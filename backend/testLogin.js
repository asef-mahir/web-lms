import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import mongoose from "mongoose";
import { User } from "./model/user.model.js";

const testLogin = async () => {
    try {
        const MONGODB_URI = `${process.env.MONGODB_URL || "mongodb://127.0.0.1:27017"}/lms`;
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB\n");

        const testEmail = "hamza@gmail.com";
        const testPassword = "123456"; // Common test password

        console.log(`=== Simulating login for: ${testEmail} ===\n`);

        // Simulate loginUser function
        const user = await User.findOne({ email: testEmail, role: "Instructor" });

        if (!user) {
            console.log("✗ User not found with query: { email, role: 'Instructor' }");

            // Try without role
            const userNoRole = await User.findOne({ email: testEmail });
            if (userNoRole) {
                console.log(`✓ User found WITHOUT role filter. Role in DB: "${userNoRole.role}"`);
            }
        } else {
            console.log("✓ User found!");
            console.log(`  - ID: ${user._id}`);
            console.log(`  - Name: ${user.fullName}`);
            console.log(`  - Role: ${user.role}`);
            console.log(`  - Email: ${user.email}`);
            console.log(`  - Has password: ${!!user.password}`);

            // Test password
            const isValid = await user.isPasswordCorrect(testPassword);
            console.log(`  - Password "${testPassword}" valid: ${isValid}`);
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

testLogin();
