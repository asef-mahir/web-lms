
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import mongoose from "mongoose";
import { User } from "../model/user.model.js";
import { Learner } from "../model/learner.model.js";
import { Instructor } from "../model/instructor.model.js";
import { Transaction } from "../model/transaction.model.js";

const resetUsers = async () => {
    try {
        const MONGODB_URI = `${process.env.MONGODB_URL || "mongodb://127.0.0.1:27017"}/lms`;
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for User Reset");

        // Delete Users
        await User.deleteMany({});
        await Learner.deleteMany({});
        await Instructor.deleteMany({});
        // Also clear transactions since they depend on users
        await Transaction.deleteMany({});

        console.log("🗑️ Deleted all Users, Learners, Instructors, and Transactions.");
        console.log("✅ System cleaned. Bank accounts remain seeded.");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error resetting users:", error);
        process.exit(1);
    }
};

resetUsers();
