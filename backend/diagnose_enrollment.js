
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Transaction } from "./model/transaction.model.js";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017";
const MONGODB_URI = MONGODB_URL.endsWith("/lms") ? MONGODB_URL : `${MONGODB_URL}/lms`;

async function diagnose() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const purchaseTxs = await Transaction.aggregate([
            {
                $match: {
                    type: "PURCHASE",
                    status: { $in: ["COMPLETED", "PENDING_APPROVAL", "VALIDATED"] }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "from_user",
                    foreignField: "_id",
                    as: "user"
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
            {
                $group: {
                    _id: { from_user: "$from_user", course_id: "$course_id" },
                    userName: { $first: { $arrayElemAt: ["$user.userName", 0] } },
                    courseTitle: { $first: { $arrayElemAt: ["$course.title", 0] } },
                    count: { $sum: 1 },
                    txs: { $push: "$_id" }
                }
            }
        ]);

        console.log("Detailed Enrollments:");
        purchaseTxs.forEach(p => {
            console.log(`User: ${p.userName} (${p._id.from_user}), Course: ${p.courseTitle} (${p._id.course_id}), Count: ${p.count}`);
        });

        console.log("\nUnique Enrollments total:", purchaseTxs.length);

    } catch (err) {
        console.error("Diagnosis failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

diagnose();
