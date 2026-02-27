import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import mongoose from "mongoose";
import { User } from "./model/user.model.js";

const diagnoseLogin = async () => {
    try {
        const MONGODB_URI = `${process.env.MONGODB_URL || "mongodb://127.0.0.1:27017"}/lms`;
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB\n");

        // Test email
        const testEmail = "hamza@gmail.com"; // Instructor from the list

        console.log(`=== Testing login for: ${testEmail} ===\n`);

        // Check what's in database
        const userByEmail = await User.findOne({ email: testEmail });
        if (userByEmail) {
            console.log("✓ User found by email:");
            console.log(`  - Role in DB: "${userByEmail.role}" (type: ${typeof userByEmail.role})`);
            console.log(`  - Role length: ${userByEmail.role.length}`);
            console.log(`  - Role charCodes: ${[...userByEmail.role].map(c => c.charCodeAt(0)).join(',')}`);
        } else {
            console.log("✗ User NOT found by email");
        }

        console.log("\n=== Testing role queries ===");

        // Test different role formats
        const testRoles = ["Instructor", "instructor", "INSTRUCTOR", " Instructor", "Instructor "];

        for (const testRole of testRoles) {
            const user = await User.findOne({ email: testEmail, role: testRole });
            console.log(`  Role: "${testRole}" -> ${user ? '✓ FOUND' : '✗ NOT FOUND'}`);
        }

        console.log("\n=== All users and their roles ===");
        const allUsers = await User.find({}).select('email role');
        allUsers.forEach(u => {
            console.log(`  ${u.email} -> "${u.role}"`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

diagnoseLogin();
