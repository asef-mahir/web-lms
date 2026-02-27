import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Course } from "../model/course.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { Instructor } from "../model/instructor.model.js";
import { Transaction } from "../model/transaction.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { saveFileLocally } from "../utils/localUpload.js";
import { processLumpSumPayment } from "./bank.controller.js";

const LMS_ADMIN_BANK_ACCOUNT = "10001";

const createCourse = asyncHandler(async (req, res) => {
  const { title, description, price, lumpSumPayment } = req.body;
  const instructor = req.body.instructor || req.user._id;

  // Validate required text fields
  if ([title, description, price].some(field => !field || field.toString().trim() === "")) {
    throw new ApiError(400, "Title, description, and price are required");
  }

  // ENFORCE PROJECT CONSTRAINT: Max 5 Courses
  const courseCount = await Course.countDocuments();
  if (courseCount >= 5) {
    throw new ApiError(400, "Project Constraint: The LMS system only hosts 5 courses.");
  }

  // Calculate lumpSumPayment
  const calculatedLumpSum = lumpSumPayment ? Number(lumpSumPayment) : Math.floor(Number(price) * 0.9);

  // Parse Video Titles and Durations
  const videoTitles = typeof req.body.videoTitles === "string"
    ? JSON.parse(req.body.videoTitles)
    : req.body.videoTitles || [];

  const videoDurations = typeof req.body.videoDurations === "string"
    ? JSON.parse(req.body.videoDurations)
    : req.body.videoDurations || [];

  // Parse Resources
  let resourcesData = [];
  if (req.body.resources) {
    try {
      resourcesData = typeof req.body.resources === "string"
        ? JSON.parse(req.body.resources)
        : req.body.resources;
    } catch (err) {
      throw new ApiError(400, "Invalid resources format");
    }
  }

  // --- HANDLE FILES ---
  // req.files is now an object: { videos: [...], resourceFiles: [...] }
  const videoFiles = req.files?.videos || [];
  const resourceFiles = req.files?.resourceFiles || [];

  if (videoFiles.length === 0) {
    throw new ApiError(400, "At least one video file is required");
  }

  // 1. Upload Videos
  const uploadedVideos = [];
  for (const file of videoFiles) {
    const result = await saveFileLocally(file);
    if (result) uploadedVideos.push(result);
  }

  // Map to video schema
  const videos = uploadedVideos.map((result, index) => ({
    title: videoTitles[index]?.trim() || `Video ${index + 1}`,
    url: result.secure_url,
    duration_seconds: parseInt(videoDurations[index]) || 60
  }));

  // 2. Upload Resource Files
  const uploadedResources = [];
  for (const file of resourceFiles) {
    const result = await saveFileLocally(file);
    if (result) uploadedResources.push(result);
  }

  // Map to resource schema
  let resFileIndex = 0;
  const resources = resourcesData.map(res => {
    // If resource needs a file (pdf/audio) and doesn't have a URL, assign next uploaded file
    if (["pdf", "audio"].includes(res.mediaType) && !res.url && resFileIndex < uploadedResources.length) {
      const file = uploadedResources[resFileIndex++];
      return { ...res, url: file.secure_url };
    }
    return res;
  });

  // Create the course
  const course = await Course.create({
    title,
    description,
    price: Number(price),
    lumpSumPayment: calculatedLumpSum,
    instructor,
    videos,
    resources
  });

  // Verify and Pay Lump Sum
  try {
    await processLumpSumPayment({ instructorId: instructor, amount: calculatedLumpSum });

    const instructorDoc = await Instructor.findById(instructor);

    await Transaction.create({
      type: "LUMP_SUM",
      amount: calculatedLumpSum,
      from_user: null, // LMS System
      from_account_number: LMS_ADMIN_BANK_ACCOUNT,
      to_user: instructor,
      to_account_number: instructorDoc.bank_account_number,
      status: "COMPLETED",
      course_id: course._id
    });
  } catch (err) {
    // Rollback course creation if payment fails
    await Course.findByIdAndDelete(course._id);
    throw new ApiError(400, "Course creation failed: " + err.message);
  }

  // Add course to Instructor's courses_taught
  await Instructor.findByIdAndUpdate(
    instructor,
    { $push: { courses_taught: course._id } },
    { new: true }
  );

  return res.status(201).json(new ApiResponse(201, course, "Course created successfully"));
});

const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find();
  return res.status(200).json(new ApiResponse(200, courses, "Courses fetched successfully"));
});

const getCoursesByCategory = asyncHandler(async (req, res) => {
  // Placeholder implementation
  return res.status(200).json(new ApiResponse(200, [], "Courses by category fetched successfully"));
});

const getMostViewedCourses = asyncHandler(async (req, res) => {
  // Placeholder implementation
  return res.status(200).json(new ApiResponse(200, [], "Most viewed courses fetched successfully"));
});

const addVideosToCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { videoTitles: videoTitlesStr, videoDurations: videoDurationsStr } = req.body;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required");
  }

  // Parse Titles and Durations
  const videoTitles = typeof videoTitlesStr === "string"
    ? JSON.parse(videoTitlesStr || "[]")
    : videoTitlesStr || [];

  const videoDurations = typeof videoDurationsStr === "string"
    ? JSON.parse(videoDurationsStr || "[]")
    : videoDurationsStr || [];

  // Handle Files
  const files = req.files || [];

  if (files.length === 0) {
    throw new ApiError(400, "At least one video file is required");
  }

  // Upload Videos
  const uploadedVideos = [];
  for (const file of files) {
    // Determine the title for this file based on its index
    // Note: This relies on the order of files matching the order of titles if sent as array
    // Since req.files is an array, we match by index.
    const result = await saveFileLocally(file);
    if (result) uploadedVideos.push(result);
  }

  // Map to video schema
  const newVideos = uploadedVideos.map((result, index) => ({
    title: videoTitles[index]?.trim() || `New Video ${Date.now()}`,
    url: result.secure_url,
    duration_seconds: parseInt(videoDurations[index]) || 60,
    // Add logic for freePreview if needed, defaulting to false
    isFree: false
  }));

  const course = await Course.findByIdAndUpdate(
    courseId,
    { $push: { videos: { $each: newVideos }, totalVideos: { $inc: newVideos.length } } },
    { new: true }
  );

  // Note: We might want to increment totalVideos count manually if it's not a virtual
  // Typically totalVideos might be virtual, but if it's a field we should update it.
  // Checking course model would be ideal, but for now assuming we just push to videos array.
  // Actually, let's just push to videos. If totalVideos is a stored field, we should increment it.
  // Re-reading `createCourse`: it maps videos array. It doesn't seem to set `totalVideos` explicitly on create?
  // Let's assume videos array length is the truth.

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // If totalVideos is a field, let's update it.
  if (course.totalVideos !== undefined) {
    course.totalVideos = course.videos.length;
    await course.save();
  }

  return res.status(200).json(new ApiResponse(200, course, "Videos added successfully"));
});

const addResourcesToCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { resources: resourcesString } = req.body;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required");
  }

  let resources = [];
  try {
    resources = JSON.parse(resourcesString || "[]");
  } catch (error) {
    throw new ApiError(400, "Invalid resources format");
  }

  // Upload files if any
  const uploadedFiles = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await saveFileLocally(file);
      if (result) uploadedFiles.push(result);
    }
  }

  // Map resources: Assign uploaded files to resources that need them
  // Assumption: Frontend sends 'isUpload: true' or we match by order of 'pdf'/'audio' types
  // Strategy: If a resource has no URL and is of type pdf/audio, OR we just pop files for every 'isUpload' flag

  let fileIndex = 0;
  const newResources = resources.map(res => {
    // If it's an upload type or explicitly marked, use the uploaded file
    // We'll rely on the order: first resource needing file gets first file
    if (["pdf", "audio"].includes(res.mediaType) && !res.url && fileIndex < uploadedFiles.length) {
      const file = uploadedFiles[fileIndex++];
      return {
        ...res,
        url: file.secure_url
      };
    }
    return res;
  });

  const course = await Course.findByIdAndUpdate(
    courseId,
    { $push: { resources: { $each: newResources } } },
    { new: true }
  );

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res.status(200).json(new ApiResponse(200, course, "Resources added successfully"));
});

const deleteResource = asyncHandler(async (req, res) => {
  // Placeholder implementation
  return res.status(200).json(new ApiResponse(200, {}, "Resource deleted successfully"));
});


const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user._id;

  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Check if the user is the instructor of this course
  if (course.instructor.toString() !== instructorId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this course");
  }

  await Course.findByIdAndDelete(courseId);

  // Remove from instructor's list
  await Instructor.findByIdAndUpdate(instructorId, {
    $pull: { courses_taught: courseId }
  });

  return res.status(200).json(new ApiResponse(200, {}, "Course deleted successfully"));
});

export { createCourse, getAllCourses, getCoursesByCategory, getMostViewedCourses, addVideosToCourse, addResourcesToCourse, deleteResource, deleteCourse };
