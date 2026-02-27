import express from "express";
import { adminLogin, adminLogout, adminSignup, instructorLogin, instructorLogout, instructorSignup, learnerLogin, learnerLogout, learnerSignup, updateBankDetails } from "../controller/auth.controller.js";
import { getMyBalance } from "../controller/bank.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ------------ Learner Routes ------------
router.post("/learner/signup", learnerSignup);
router.post("/learner/login", learnerLogin);
router.post("/learner/logout", verifyJWT, learnerLogout);

// ------------ Instructor Routes ------------
router.post("/instructor/signup", instructorSignup);
router.post("/instructor/login", instructorLogin);
router.post("/instructor/logout", verifyJWT, instructorLogout);

// ------------ Admin Routes ------------
router.post("/admin/signup", adminSignup);
router.post("/admin/login", adminLogin);
// ------------ Common User Routes ------------
router.post("/user/bank-details", verifyJWT, updateBankDetails);
router.get("/user/balance", verifyJWT, getMyBalance);

export default router;
