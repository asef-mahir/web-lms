// controllers/admin.controller.js

import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Course } from "../model/course.model.js";
import { User } from "../model/user.model.js";
import { Transaction } from "../model/transaction.model.js";
import { BankAccount } from "../model/bankAccount.model.js";

const getPlatformStats = asyncHandler(async (req, res) => {
  if (req.user.role !== "Admin") {
    throw new ApiError(403, "Access denied. Admin only.");
  }

  const adminAccountNumber = "10001"; // Updated to match new 5-digit admin account

  // === 1. Basic Stats ===
  const [
    totalCourses,
    totalLearners,
    totalInstructors,
    adminBank,
    enrollmentAgg
  ] = await Promise.all([
    Course.countDocuments(),
    User.countDocuments({ role: "Learner" }),
    User.countDocuments({ role: "Instructor" }),
    BankAccount.findOne({ account_number: adminAccountNumber }),
    Transaction.aggregate([
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
    ])
  ]);

  const totalEnrollments = enrollmentAgg[0]?.count || 0;

  const lmsBankBalance = adminBank?.current_balance || 0;

  // Total Revenue: Sum of all purchase transactions (including pending/validated)
  const revenueAgg = await Transaction.aggregate([
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
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  // Admin Income: 20% of Total Revenue (Plan 1)
  const adminIncome = totalRevenue * 0.2;

  // === 2. Monthly Revenue Chart (Last 12 Months) ===
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);

  const monthlyRevenue = await Transaction.aggregate([
    {
      $match: {
        type: "PURCHASE",
        status: { $in: ["COMPLETED", "PENDING_APPROVAL", "VALIDATED"] },
        createdAt: { $gte: twelveMonthsAgo }
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
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    },
    {
      $project: {
        month: {
          $dateToString: {
            format: "%b %Y",
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: 1
              }
            }
          }
        },
        revenue: "$totalAmount",
        enrollments: "$count"
      }
    }
  ]);

  // Fill missing months
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const current = new Date();
  const chartData = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(current.getMonth() - i);
    const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    const found = monthlyRevenue.find(item => item.month === monthKey);
    chartData.push({
      month: monthKey,
      revenue: found ? Math.round(found.revenue) : 0,
      enrollments: found ? found.enrollments : 0
    });
  }

  // === Final Response ===
  const stats = {
    overview: {
      totalCourses,
      totalLearners,
      totalInstructors,
      totalEnrollments,
      totalRevenue,
      adminIncome,
      lmsBankBalance // Added explicit balance field
    },
    monthlyRevenueChart: chartData,
    lastUpdated: new Date().toISOString()
  };

  return res.status(200).json(
    new ApiResponse(200, stats, "Admin dashboard stats fetched successfully")
  );
});

export { getPlatformStats };