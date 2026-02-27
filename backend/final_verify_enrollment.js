
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Transaction } from "./model/transaction.model.js";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017";
const MONGODB_URI = MONGODB_URL.endsWith("/lms") ? MONGODB_URL : `${MONGODB_URL}/lms`;

async function verify() {
    try {
        await mongoose.connect(MONGODB_URI);

        const enrollmentAgg = await Transaction.aggregate([
            {
                $match: {
                    type: "PURCHASE",
                    status: { $in: ["COMPLETED", "PENDING_APPROVAL", "VALIDATED"] }
                }
            },
            {
                $lookup: {
                    from: "courses",
                    localField: "course_id",
                    foreignField: "_id",
                    as: "course"
                }
            },
            { $match: { "course.0": { $exists: true } } },
            { $count: "count" }
        ]);

        const count = enrollmentAgg[0]?.count || 0;
        console.log("Verified Enrollment Count:", count);

        if (count === 1) {
            console.log("SUCCESS: Count is exactly 1 as expected.");
        } else {
            console.log("FAILURE: Expected 1, got", count);
        }

    } catch (err) {
        console.error("Verification failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
