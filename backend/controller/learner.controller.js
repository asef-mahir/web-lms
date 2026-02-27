// learner.controller.js

import { Course } from "../model/course.model.js";
import { Transaction } from "../model/transaction.model.js";
import { Learner } from "../model/learner.model.js";
import { processCoursePurchase } from "./bank.controller.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const LMS_ADMIN_BANK_ACCOUNT = "10001";

export const enrollInCourse = asyncHandler(async (req, res) => {
    const { courseId, bankAccountNumber, secretKey } = req.body;
    const learnerId = req.user._id;

    const course = await Course.findById(courseId).populate("instructor");
    if (!course) throw new ApiError(404, "Course not found");

    // Prevent duplicate enrollment
    const learner = await Learner.findById(learnerId);
    const already = learner.courses_enrolled.find(
        e => e.course.toString() === courseId && e.status !== "Rejected"
    );

    if (already) {
        throw new ApiError(400, "Already enrolled in this course");
    }

    // Prevent duplicate enrollment (Race condition check)
    const existingTransaction = await Transaction.findOne({
        from_user: learnerId,
        course_id: courseId,
        type: "PURCHASE",
        status: { $in: ["PENDING_APPROVAL", "VALIDATED", "COMPLETED"] }
    });

    if (existingTransaction) {
        throw new ApiError(400, "Enrollment is already in progress or completed");
    }

    // Payment execution: Learner -> LMS
    await processCoursePurchase({
        learnerId,
        learnerBankAccount: bankAccountNumber,
        secretKey,
        amount: course.price
    });

    // Create COMPLETED transaction (Learner -> LMS)
    const transaction = await Transaction.create({
        type: "PURCHASE",
        amount: course.price,

        from_user: learnerId,
        from_account_number: bankAccountNumber,

        // To LMS System
        to_user: null,
        to_account_number: LMS_ADMIN_BANK_ACCOUNT,

        status: "PENDING_APPROVAL",
        course_id: courseId
    });

    // Direct full access → Inprogress
    learner.courses_enrolled.push({
        course: courseId,
        status: "PendingApproval",
        progress_percentage: 0
    });

    await learner.save();

    res.status(201).json(new ApiResponse(201, {
        message: "Payment successful! Waiting for Instructor Approval.",
        transactionId: transaction._id
    }));
});



// 1. Get all enrolled courses with status & progress
export const getMyCourses = asyncHandler(async (req, res) => {
    const learner = await Learner.findById(req.user._id)
        .populate({
            path: "courses_enrolled.course",
            populate: { path: "instructor", select: "fullName" }
        });

    const courses = learner.courses_enrolled
        .filter(en => en.course) // Filter out null courses (e.g. if deleted)
        .map(en => {
            const course = en.course;
            const videos = course.videos || [];
            const totalDuration = videos.reduce((sum, v) => sum + (v.duration_seconds || 0), 0);

            const watchedDuration = (en.watch_history || []).reduce((sum, wh) => {
                const video = videos.find(v => v._id.toString() === wh.material_id.toString());
                if (!video) return sum;
                return sum + (wh.last_watched_time > video.duration_seconds ? video.duration_seconds : wh.last_watched_time);
            }, 0);

            const progress = totalDuration > 0 ? Math.round((watchedDuration / totalDuration) * 100) : 0;

            return {
                courseId: course._id,
                title: course.title,
                description: course.description,
                price: course.price,
                instructorName: course.instructor?.fullName || "Unknown Instructor",
                status: en.status,
                progress_percentage: progress,
                enrolledAt: en.enrollment_date
            };
        });

    res.json(new ApiResponse(200, courses));
});


// 2. Get full course content of a specific enrolled course
// 2. Get full course content of a specific enrolled course
export const getCourseContent = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const learner = await Learner.findById(req.user._id);

    const enrollment = learner.courses_enrolled.find(
        en => en.course.toString() === courseId &&
            ["InProgress", "Completed"].includes(en.status)
    );

    if (!enrollment) {
        throw new ApiError(403, "You don't have access to this course.");
    }

    const course = await Course.findById(courseId).populate("instructor");

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Attach last watched time for each video
    const videos = course.videos || [];
    const videosWithProgress = videos.map(video => {
        const history = (enrollment.watch_history || []).find(
            h => h.material_id.toString() === video._id.toString()
        );
        return {
            ...video.toObject(),
            lastWatchedSeconds: history?.last_watched_time || 0,
            completed: history?.completed || false
        };
    });

    res.json(new ApiResponse(200, {
        course: {
            _id: course._id,
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            videos: videosWithProgress,
            resources: course.resources || []
        },
        yourProgress: enrollment.progress_percentage
    }));
});



// 3. Update video progress
export const updateVideoProgress = asyncHandler(async (req, res) => {
    const { courseId, videoId, currentTime, completed = false } = req.body;
    const learnerId = req.user._id;

    const learner = await Learner.findById(learnerId);
    if (!learner) throw new ApiError(404, "Learner not found");

    const enrollment = learner.courses_enrolled.find(
        en => en.course.toString() === courseId &&
            ["InProgress", "Completed"].includes(en.status)
    );

    if (!enrollment) throw new ApiError(403, "You don't have access to this course");

    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, "Course not found");

    const video = course.videos.id(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    // -----------------------------------------------------
    // UPDATE WATCH HISTORY ENTRY
    // -----------------------------------------------------
    let watchEntry = enrollment.watch_history.find(
        h => h.material_id.toString() === videoId
    );

    const isCompleted = completed || currentTime >= video.duration_seconds * 0.95;

    if (watchEntry) {
        watchEntry.last_watched_time = Math.min(currentTime, video.duration_seconds);
        watchEntry.completed = isCompleted;
        watchEntry.updatedAt = new Date();
    } else {
        enrollment.watch_history.push({
            material_id: videoId,
            last_watched_time: Math.min(currentTime, video.duration_seconds),
            completed: isCompleted
        });
    }

    // -----------------------------------------------------
    // RECALCULATE OVERALL COURSE PROGRESS
    // -----------------------------------------------------
    const videos = course.videos || [];
    const totalDuration = videos.reduce((sum, v) => sum + (v.duration_seconds || 0), 0);

    const watched = (enrollment.watch_history || []).reduce((sum, h) => {
        const vid = videos.find(v => v._id.toString() === h.material_id.toString());
        if (!vid) return sum;
        return sum + Math.min(h.last_watched_time, vid.duration_seconds);
    }, 0);

    const progress = totalDuration > 0 ? Math.round((watched / totalDuration) * 100) : 0;
    enrollment.progress_percentage = progress;

    let message = "Progress updated";

    // -----------------------------------------------------
    // CHECK IF ALL VIDEOS COMPLETED
    // -----------------------------------------------------
    const allVideosCompleted = videos.length > 0 &&
        videos.every(v =>
            (enrollment.watch_history || []).some(h =>
                h.material_id.toString() === v._id.toString() && h.completed
            )
        );

    // -----------------------------------------------------
    // MARK COURSE COMPLETED + AWARD CERTIFICATE
    // -----------------------------------------------------
    if (allVideosCompleted && enrollment.status !== "Completed") {
        enrollment.status = "Completed";

        // Generate unique certificate ID
        const certificateId = `${learnerId}-${courseId}-${Date.now()}`;

        learner.certificates_earned.push(certificateId);

        message = "Course completed! Certificate awarded.";
    }

    await learner.save();

    res.json(
        new ApiResponse(200, {
            message,
            progress: enrollment.progress_percentage,
            status: enrollment.status,
            certificates_earned: learner.certificates_earned
        })
    );
});


export const getBuyableCourses = asyncHandler(async (req, res) => {
    const learnerId = req.user._id;

    const learner = await Learner.findById(learnerId);
    if (!learner) throw new ApiError(404, "Learner not found");

    const purchased = learner.courses_enrolled
        .filter(c => c.status === "InProgress" || c.status === "Completed")
        .map(c => c.course.toString());

    const courses = await Course.find({
        _id: { $nin: purchased }
    })
        .populate("instructor", "fullName userName")
        .select("title description price videos createdAt");

    const result = await Promise.all(
        courses.map(async (course) => {
            const enrolled = await Transaction.countDocuments({
                course_id: course._id,
                status: { $in: ["COMPLETED", "VALIDATED", "PENDING_APPROVAL"] },
                type: "PURCHASE"
            });

            return {
                _id: course._id,
                title: course.title,
                description: course.description,
                price: course.price,
                totalVideos: (course.videos || []).length,
                enrolledStudents: enrolled,
                instructor: {
                    name: course.instructor?.fullName || "Unknown",
                    username: course.instructor?.userName || "unknown"
                },
                thumbnail: course.videos?.[0]?.url || null
            };
        })
    );

    res.json(new ApiResponse(200, result));
});

