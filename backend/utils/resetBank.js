
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // Adjust path if needed, usually run from backend root so just .env
import mongoose from "mongoose";
import { BankAccount } from "../model/bankAccount.model.js";
import { bankAccountData } from "./bankAccountData.js";

const resetBankAccounts = async () => {
    try {
        // 1. Connect
        // Ensure you use the same connection string as server.js
        const MONGODB_URI = `${process.env.MONGODB_URL || "mongodb://127.0.0.1:27017"}/lms`;
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for Bank Reset");

        // 2. Delete All
        await BankAccount.deleteMany({});
        console.log("🗑️ Deleted all existing bank accounts.");

        // 3. Insert New
        await BankAccount.insertMany(bankAccountData);
        console.log(`✅ Seeded ${bankAccountData.length} new bank accounts.`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error resetting bank accounts:", error);
        process.exit(1);
    }
};

resetBankAccounts();
