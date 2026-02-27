
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import mongoose from "mongoose";
import { User } from "../model/user.model.js";

const listUsers = async () => {
    try {
        const MONGODB_URI = `${process.env.MONGODB_URL || "mongodb://127.0.0.1:27017"}/lms`;
        // Note: server.js might append DB name if not in URI. 
        // Let's assume default behavior.

        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for Listing Users");

        const users = await User.find({});
        console.log(`Found ${users.length} users in the database:`);
        users.forEach(u => {
            console.log(`- ID: ${u._id}, Name: ${u.fullName}, Role: ${u.role}, Email: ${u.email}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error listing users:", error);
        process.exit(1);
    }
};

listUsers();
