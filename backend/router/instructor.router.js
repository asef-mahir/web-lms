// routes/instructor.routes.js
import { Router } from "express";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";
import {
  getApproveStudents,
  getCoursesEarningsForChart,
  getMyCourseDetails,
  getMyCoursesWithStats,
  approveStudentEnrollment,
} from "../controller/instructor.controller.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { addResourcesToCourse, addVideosToCourse, createCourse, deleteResource, deleteCourse } from "../controller/course.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(verifyRole("Instructor"));
console.log(5)
router.post(
  "/create-course",
  upload.fields([
    { name: "videos", maxCount: 50 },
    { name: "resourceFiles", maxCount: 20 }
  ]),
  createCourse
);
router.post("/:courseId/add-videos", upload.array("files", 20), addVideosToCourse);
router.post("/:courseId/add-resources", upload.array("files", 10), addResourcesToCourse);


router.delete("/:courseId/resource/:resourceId", deleteResource);

router.get("/my-courses", getMyCoursesWithStats);
router.get("/approve-students/:courseId", getApproveStudents);
router.post("/approve-enrollment", approveStudentEnrollment);
router.get("/total-earning-forChart", getCoursesEarningsForChart)

router.get("/course/:courseId/details", getMyCourseDetails);



router.delete("/course/:courseId", deleteCourse);

export default router;