// bank.controller.js

import { BankAccount } from "../model/bankAccount.model.js";
import { User } from "../model/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const ADMIN_ACCOUNT = "10001"; // Updated to match new 5-digit admin account

// Learner pays LMS (Admin) for course
export const processCoursePurchase = async ({
    learnerId,
    learnerBankAccount,
    secretKey,
    amount
}) => {
    const learner = await User.findById(learnerId).select("+bank_secret");
    if (!learner) throw new ApiError(404, "User not found");

    if (learner.bank_account_number !== learnerBankAccount || learner.bank_secret !== secretKey) {
        throw new ApiError(400, "Invalid bank credentials");
    }

    const [learnerAcc, adminAcc] = await Promise.all([
        BankAccount.findOne({ account_number: learnerBankAccount }),
        BankAccount.findOne({ account_number: ADMIN_ACCOUNT })
    ]);

    if (!learnerAcc || !adminAcc) throw new ApiError(404, "Bank account not found");

    if (learnerAcc.current_balance < amount) {
        throw new ApiError(400, "Insufficient balance");
    }

    // Transfer 100% to LMS (Admin)
    learnerAcc.current_balance -= amount;
    adminAcc.current_balance += amount;

    await Promise.all([
        learnerAcc.save({ validateBeforeSave: false }),
        adminAcc.save({ validateBeforeSave: false })
    ]);
};

// LMS (Admin) pays Instructor on course upload
export const processLumpSumPayment = async ({
    instructorId,
    amount
}) => {
    const instructor = await User.findById(instructorId);
    if (!instructor) throw new ApiError(404, "Instructor not found");

    const [instructorAcc, adminAcc] = await Promise.all([
        BankAccount.findOne({ account_number: instructor.bank_account_number }),
        BankAccount.findOne({ account_number: ADMIN_ACCOUNT })
    ]);

    if (!instructorAcc || !adminAcc) throw new ApiError(404, "Bank account not found");

    if (adminAcc.current_balance < amount) {
        // In a real system, this would fail. For simulation, maybe we allow it or throw.
        // Let's throw to simulate real constraints, but ensure Admin has initial funds.
        throw new ApiError(400, "LMS System Account has insufficient funds to pay lump sum.");
    }

    adminAcc.current_balance -= amount;
    instructorAcc.current_balance += amount;

    instructor.total_earnings += amount;

    await Promise.all([
        instructorAcc.save({ validateBeforeSave: false }),
        adminAcc.save({ validateBeforeSave: false }),
        instructor.save({ validateBeforeSave: false })
    ]);
};

// Get User's Bank Balance
export const getMyBalance = async (req, res) => {
    const user = req.user; // from auth middleware

    if (!user.bank_account_number) {
        throw new ApiError(400, "Bank account not linked");
    }

    const bankAccount = await BankAccount.findOne({ account_number: user.bank_account_number });
    if (!bankAccount) {
        throw new ApiError(404, "Linked bank account not found in bank system");
    }

    // In a real app, we might verify secret again or just trust the link
    // Assuming trust if it's in user profile

    // We return the balance + account info
    return res.status(200).json(new ApiResponse(200, {
        account_number: bankAccount.account_number,
        balance: bankAccount.current_balance,
        bank_name: bankAccount.bank_name // Assuming this field exists or similar
    }, "Balance fetched successfully"));
};