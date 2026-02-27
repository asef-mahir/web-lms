import mongoose from "mongoose";
import dotenv from "dotenv";
import { Transaction } from "./model/transaction.model.js";
import { Learner } from "./model/learner.model.js";
import { BankAccount } from "./model/bankAccount.model.js";
import { User } from "./model/user.model.js";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017";
const MONGODB_URI = MONGODB_URL.endsWith("/lms") ? MONGODB_URL : `${MONGODB_URL}/lms`;

async function cleanup() {
    try {
        console.log("Connecting to:", MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const learnerId = "696aa17ed95881906bf80ff5";
        const courseId = "696a9f81f7ca294cc69bdcc9";

        console.log(`Searching for transactions for Learner: ${learnerId} and Course: ${courseId}`);

        const allTxs = await Transaction.find({});
        console.log(`Total transactions in DB: ${allTxs.length}`);
        const instructorId = "696a9af33e891c834e3f8cbc";
        const adminAccount = "10001";
        const instructorAccount = "10002";
        const learnerAccount = "10005";

        // 1. Find the 3 transactions
        const txs = await Transaction.find({
            from_user: learnerId,
            course_id: courseId,
            type: "PURCHASE"
        }).sort({ createdAt: 1 });

        if (txs.length <= 1) {
            console.log("No duplicates found. Current count:", txs.length);
            process.exit(0);
        }

        const duplicates = txs.slice(1);
        console.log(`Found ${duplicates.length} duplicate transactions.`);

        let refundTotal = 0;
        let clawBackTotal = 0;

        for (const tx of duplicates) {
            refundTotal += tx.amount;
            if (tx.status === "VALIDATED" || tx.status === "COMPLETED") {
                clawBackTotal += tx.amount * 0.8;
            }
        }

        console.log(`Refunding $${refundTotal} to learner.`);
        console.log(`Clawing back $${clawBackTotal} from instructor.`);

        // 2. Update Bank Accounts
        const lAcc = await BankAccount.findOne({ account_number: learnerAccount });
        const iAcc = await BankAccount.findOne({ account_number: instructorAccount });
        const aAcc = await BankAccount.findOne({ account_number: adminAccount });

        lAcc.current_balance += refundTotal;
        iAcc.current_balance -= clawBackTotal;
        // Admin loses the 20% commission they kept: refundTotal - clawBackTotal
        aAcc.current_balance -= (refundTotal - clawBackTotal);

        await Promise.all([lAcc.save(), iAcc.save(), aAcc.save()]);

        // 3. Update Instructor earnings
        const instructor = await User.findById(instructorId);
        instructor.total_earnings -= clawBackTotal;
        await instructor.save();

        // 4. Update Learner Enrollments
        const learner = await Learner.findById(learnerId);
        // Find all indices of this course
        const indices = [];
        learner.courses_enrolled.forEach((e, idx) => {
            if (e.course.toString() === courseId) {
                indices.push(idx);
            }
        });

        // Keep only the first one, remove others (reverse order to not mess up indices)
        if (indices.length > 1) {
            const toRemove = indices.slice(1).reverse();
            for (const idx of toRemove) {
                learner.courses_enrolled.splice(idx, 1);
            }
            await learner.save();
        }

        // 5. Delete Duplicate Transactions
        const idsToDelete = duplicates.map(d => d._id);
        await Transaction.deleteMany({ _id: { $in: idsToDelete } });

        console.log("Cleanup completed successfully!");
    } catch (err) {
        console.error("Cleanup failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

cleanup();
