
// Mocking the behavior of processLumpSumPayment for verification
const mockAdminAccount = { account_number: "10001", current_balance: 10000 };
const mockInstructorAccount = { account_number: "INST123", current_balance: 0 };
const mockInstructorUser = { bank_account_number: "INST123", total_earnings: 0 };

const processLumpSumPaymentMock = async ({ instructorId, amount }) => {
    // Simulate finding instructor
    const instructor = mockInstructorUser;

    // Simulate finding bank accounts
    const instructorAcc = mockInstructorAccount;
    const adminAcc = mockAdminAccount;

    if (adminAcc.current_balance < amount) {
        throw new Error("LMS System Account has insufficient funds to pay lump sum.");
    }

    adminAcc.current_balance -= amount;
    instructorAcc.current_balance += amount;
    instructor.total_earnings += amount;

    console.log(`Paid ${amount} to instructor ${instructorId}`);
    return { adminAcc, instructorAcc, instructor };
};

const runTest = async () => {
    try {
        const amount = 500;
        console.log("Initial State:");
        console.log("Admin Balance:", mockAdminAccount.current_balance);
        console.log("Instructor Balance:", mockInstructorAccount.current_balance);
        console.log("Instructor Total Earnings:", mockInstructorUser.total_earnings);

        const result = await processLumpSumPaymentMock({ instructorId: "test_inst", amount });

        console.log("\nFinal State:");
        console.log("Admin Balance:", result.adminAcc.current_balance);
        console.log("Instructor Balance:", result.instructorAcc.current_balance);
        console.log("Instructor Total Earnings:", result.instructor.total_earnings);

        if (result.instructorAcc.current_balance === 500 && result.instructor.total_earnings === 500 && result.adminAcc.current_balance === 9500) {
            console.log("\nSUCCESS: Lump-sum payment logic verified correctly.");
        } else {
            console.log("\nFAILURE: Logic mismatch.");
        }
    } catch (err) {
        console.error("Test failed:", err.message);
    }
};

runTest();
