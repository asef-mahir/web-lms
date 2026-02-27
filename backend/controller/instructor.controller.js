// instructor.controller.js

import { Course } from "../model/course.model.js";
import { Transaction } from "../model/transaction.model.js";
import { Learner } from "../model/learner.model.js";
import { User } from "../model/user.model.js";
import { BankAccount } from "../model/bankAccount.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Get all courses created by instructor + earnings per course
export const getMyCoursesWithStats = asyncHandler(async (req, res) => {
    const instructorId = req.user._id;

    const courses = await Course.find({ instructor: instructorId })
        .select("title price createdAt lumpSumPayment");

    const coursesWithStats = await Promise.all(
        courses.map(async (course) => {

            // Now no pending — only completed transactions matter
            const completed = await Transaction.countDocuments({
                course_id: course._id,
                status: { $in: ["COMPLETED", "VALIDATED"] },
                type: "PURCHASE"
            });

            const earnings = (course.price * 0.8 * completed) + (course.lumpSumPayment || 0);

            return {
                courseId: course._id,
                title: course.title,
                price: course.price,
                studentsEnrolled: completed,
                earningsFromThisCourse: earnings,
                lumpSumPayment: course.lumpSumPayment || 0
            };
        })
    );

    const totalEarnings = coursesWithStats.reduce((sum, c) => sum + c.earningsFromThisCourse, 0);

    res.json(new ApiResponse(200, {
        courses: coursesWithStats,
        totalEarnings
    }));
});


// 2. Get approved students for a specific course
export const getApproveStudents = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const instructorId = req.user._id;

    const course = await Course.findOne({ _id: courseId, instructor: instructorId });
    if (!course) throw new ApiError(403, "Not your course");

    const pending = await Transaction.find({
        course_id: courseId,
        status: "PENDING_APPROVAL"
    })
        .populate({
            path: "from_user",
            select: "userName fullName bank_account_number",
            model: "User"
        });
    res.json(new ApiResponse(200, pending));
});




// 3. Get Full Details of a Specific Course (For Instructor Dashboard)
export const getMyCourseDetails = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const instructorId = req.user._id;

    // Find course + verify ownership
    const course = await Course.findOne({
        _id: courseId,
        instructor: instructorId
    });

    if (!course) {
        throw new ApiError(404, "Course not found or you are not the owner");
    }

    // Count enrolled students
    const totalEnrolled = await Transaction.countDocuments({
        course_id: course._id,
        status: { $in: ["COMPLETED", "VALIDATED"] },
        type: "PURCHASE"
    });

    // Calculate instructor earnings (80%)
    const instructorEarnings = course.price * 0.8 * totalEnrolled;

    // Final response with full details
    const courseDetails = {
        courseId: course._id,
        title: course.title,
        description: course.description,
        price: course.price,
        lumpSumPayment: course.lumpSumPayment,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        totalEnrolled,
        instructorEarnings,
        totalVideos: (course.videos || []).length,
        totalResources: (course.resources || []).length,
        videos: (course.videos || []).map(video => ({
            videoId: video._id,
            title: video.title,
            url: video.url,
            duration_seconds: video.duration_seconds
        })),
        resources: (course.resources || []).map(res => ({
            resourceId: res._id,
            title: res.title,
            mediaType: res.mediaType,
            url: res.url
        }))
    };

    return res.status(200).json(
        new ApiResponse(200, courseDetails, "Course details fetched successfully")
    );
});

export const getCoursesEarningsForChart = asyncHandler(async (req, res) => {
    const instructorId = req.user._id;

    // Aggregate to get course-wise earnings in one query (much more efficient)
    const earningsData = await Course.aggregate([
        { $match: { instructor: instructorId } },
        {
            $lookup: {
                from: "transactions",
                let: { courseId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$course_id", "$$courseId"] },
                                    { $eq: ["$type", "PURCHASE"] },
                                    { $in: ["$status", ["COMPLETED", "VALIDATED"]] }
                                ]
                            }
                        }
                    }
                ],
                as: "purchases"
            }
        },
        {
            $project: {
                courseId: "$_id",
                title: 1,
                totalEarning: {
                    $add: [
                        { $ifNull: ["$lumpSumPayment", 0] },
                        {
                            $multiply: [
                                { $size: "$purchases" },
                                { $multiply: ["$price", 0.8] }
                            ]
                        }
                    ]
                }
            }
        },
        { $sort: { totalEarning: -1 } }
    ]);

    res.json(new ApiResponse(200, earningsData));
});

// 4. Approve Student Enrollment
export const approveStudentEnrollment = asyncHandler(async (req, res) => {
    const { transactionId } = req.body;
    const instructorId = req.user._id;

    // 1. Find Transaction
    const transaction = await Transaction.findById(transactionId).populate("from_user");
    if (!transaction) throw new ApiError(404, "Transaction not found");

    if (transaction.status !== "PENDING_APPROVAL") {
        throw new ApiError(400, "Transaction is not pending approval");
    }

    // 2. Verify Course Ownership
    const course = await Course.findById(transaction.course_id);
    if (!course) throw new ApiError(404, "Course not found");
    if (course.instructor.toString() !== instructorId.toString()) {
        throw new ApiError(403, "You are not authorized to approve this course.");
    }

    // 3. Process Payment (LMS -> Instructor)
    const instructorAmount = course.price * 0.8;

    // Get Instructor & Admin Bank Accounts
    const instructorUser = await User.findById(instructorId);
    if (!instructorUser.bank_account_number) throw new ApiError(400, "Please set up your bank account first");

    const LMS_ADMIN_BANK_ACCOUNT = "10001";

    const [instructorAcc, adminAcc] = await Promise.all([
        BankAccount.findOne({ account_number: instructorUser.bank_account_number }),
        BankAccount.findOne({ account_number: LMS_ADMIN_BANK_ACCOUNT })
    ]);

    if (!instructorAcc || !adminAcc) throw new ApiError(404, "Bank accounts not found");

    if (adminAcc.current_balance < instructorAmount) {
        // Log error, but maybe allow if we assume LMS takes the hit? 
        // For now throw.
        throw new ApiError(500, "LMS System Error: Insufficient funds for payout.");
    }

    // Transfer
    adminAcc.current_balance -= instructorAmount;
    instructorAcc.current_balance += instructorAmount;
    instructorUser.total_earnings += instructorAmount;

    await Promise.all([
        adminAcc.save({ validateBeforeSave: false }),
        instructorAcc.save({ validateBeforeSave: false }),
        instructorUser.save({ validateBeforeSave: false })
    ]);

    // 4. Update Transaction Status
    transaction.status = "VALIDATED";
    await transaction.save();

    // 5. Update Learner Course Status
    const learner = await Learner.findById(transaction.from_user._id);
    // Find nested course
    const enrollment = learner.courses_enrolled.find(e => e.course.toString() === course._id.toString());

    if (enrollment) {
        enrollment.status = "InProgress";
        await learner.save();
    }

    return res.status(200).json(new ApiResponse(200, {}, "Enrollment approved and commission transferred."));
});

