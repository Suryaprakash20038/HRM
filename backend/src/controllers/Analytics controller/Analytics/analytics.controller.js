const Employee = require('../../../models/Employee/Employee');
const TimeLog = require('../../../models/TimeMgmt/TimeLog');
const Leave = require('../../../models/Leave/Leave');
const Project = require('../../../models/Project/Project');
const Task = require('../../../models/Task/Task');
const { successResponse, errorResponse } = require('../../../utils/response');

// Helper to filter by date range
const getDateFilter = (startDate, endDate) => {
    let filter = {};
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            filter = {
                $gte: start,
                $lte: end
            };
            return filter;
        }
    }

    // Default fallback: last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    filter = { $gte: thirtyDaysAgo };

    return filter;
};

// 1. Workforce Insights
exports.getWorkforceInsights = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Active vs Inactive (Mapped from Enum)
        const activeStatuses = ['Probation', 'Confirmed', 'Resignation Submitted', 'Notice Period', 'Exit Process', 'Intern'];
        const inactiveStatuses = ['Relieved', 'Terminated'];

        // Headcount Stats
        const totalEmployees = await Employee.countDocuments();
        const activeEmployees = await Employee.countDocuments({ status: { $in: activeStatuses } });
        const inactiveEmployees = await Employee.countDocuments({ status: { $in: inactiveStatuses } });

        // Return actual status distribution for chart
        const statusDistribution = await Employee.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Department Distribution
        const departmentDistribution = await Employee.aggregate([
            { $group: { _id: "$department", count: { $sum: 1 } } }
        ]);

        // Role Distribution
        const roleDistribution = await Employee.aggregate([
            { $group: { _id: "$position", count: { $sum: 1 } } }
        ]);

        // Attrition & New Hires (using joiningDate and resignationDate)
        const dateFilter = getDateFilter(startDate, endDate);

        const newHires = await Employee.countDocuments({
            joiningDate: dateFilter
        });

        const resignations = await Employee.countDocuments({
            "resignationData.resignationDate": dateFilter
        });

        // Tenure Calculation (for active employees)
        const tenureStats = await Employee.aggregate([
            { $match: { status: { $in: activeStatuses }, joiningDate: { $exists: true } } },
            {
                $project: {
                    tenureDays: {
                        $dateDiff: {
                            startDate: "$joiningDate",
                            endDate: "$$NOW",
                            unit: "day"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgTenureDays: { $avg: "$tenureDays" }
                }
            }
        ]);

        return successResponse(res, {
            headcount: {
                total: totalEmployees,
                active: activeEmployees,
                inactive: inactiveEmployees
            },
            distribution: {
                byStatus: statusDistribution,
                byDepartment: departmentDistribution,
                byRole: roleDistribution
            },
            turnover: {
                newHires,
                resignations,
                attritionRate: totalEmployees > 0 ? ((resignations / totalEmployees) * 100).toFixed(2) : 0
            },
            avgTenureDays: tenureStats[0]?.avgTenureDays || 0
        }, "Workforce insights fetched");

    } catch (error) {
        console.error("Workforce Analytics Error:", error);
        return errorResponse(res, "Failed to fetch workforce insights", 500);
    }
};

// 2. Attendance & Productivity Analytics
exports.getAttendanceAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = getDateFilter(startDate, endDate);

        // Daily Attendance Trends
        const allLogs = await TimeLog.find({ date: dateFilter }).select('date attendanceStatus netWorkingHours');
        console.log(`[Attendance Analytics] Found ${allLogs.length} logs for filter:`, dateFilter);
        if (allLogs.length > 0) {
            console.log('[Attendance Analytics] Sample Log:', allLogs[0]);
        }

        const attendanceTrends = await TimeLog.aggregate([
            { $match: { date: dateFilter } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    avgWorkingHours: { $avg: "$netWorkingHours" },
                    totalOvertime: { $sum: "$overtimeHours" },
                    presentCount: { $sum: { $cond: [{ $eq: ["$attendanceStatus", "Present"] }, 1, 0] } },
                    lateLoginCount: { $sum: { $cond: ["$statusFlags.lateLogin", 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        console.log('[Attendance Analytics] Trends Result:', attendanceTrends);

        // Overall Stats
        const overallStats = await TimeLog.aggregate([
            { $match: { date: dateFilter } },
            {
                $group: {
                    _id: null,
                    avgHours: { $avg: "$netWorkingHours" },
                    totalOvertime: { $sum: "$overtimeHours" },
                    totalLateLogins: { $sum: { $cond: ["$statusFlags.lateLogin", 1, 0] } },
                    totalAbsent: { $sum: { $cond: [{ $eq: ["$attendanceStatus", "Absent"] }, 1, 0] } }
                }
            }
        ]);

        return successResponse(res, {
            trends: attendanceTrends,
            summary: overallStats[0] || {}
        }, "Attendance analytics fetched");

    } catch (error) {
        console.error("Attendance Analytics Error:", error);
        return errorResponse(res, "Failed to fetch attendance analytics", 500);
    }
};

// 3. Leave Analytics
exports.getLeaveAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        // Filtering leaves based on startDate 
        const dateFilter = getDateFilter(startDate, endDate);

        // Leave Type Distribution
        const leaveTypeDist = await Leave.aggregate([
            { $match: { startDate: dateFilter } },
            { $group: { _id: "$leaveType", count: { $sum: 1 }, totalDays: { $sum: "$totalDays" } } }
        ]);

        // Most Frequent Leavers
        const topLeavers = await Leave.aggregate([
            { $match: { startDate: dateFilter, status: "Approved" } },
            { $group: { _id: "$user", totalLeaves: { $sum: 1 }, totalDays: { $sum: "$totalDays" } } },
            { $sort: { totalDays: -1 } },
            { $limit: 5 },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userDetails" } },
            { $unwind: "$userDetails" },
            { $project: { "userDetails.password": 0 } }
        ]);

        // Leaves by Department (Needs lookup since Leave has user reference)
        const deptLeaves = await Leave.aggregate([
            { $match: { startDate: dateFilter } },
            { $lookup: { from: "employees", localField: "employee", foreignField: "_id", as: "employeeDetails" } },
            { $unwind: "$employeeDetails" },
            { $group: { _id: "$employeeDetails.department", count: { $sum: 1 } } }
        ]);

        return successResponse(res, {
            byType: leaveTypeDist,
            topLeavers: topLeavers.map(l => ({
                name: `${l.userDetails.firstName} ${l.userDetails.lastName}`,
                totalLeaves: l.totalLeaves,
                totalDays: l.totalDays
            })),
            byDepartment: deptLeaves
        }, "Leave analytics fetched");

    } catch (error) {
        console.error("Leave Analytics Error:", error);
        return errorResponse(res, "Failed to fetch leave analytics", 500);
    }
};

// 4. Performance Analytics
exports.getPerformanceAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        console.log("Performance Analytics Request:", { startDate, endDate });

        const dateFilter = getDateFilter(startDate, endDate);
        console.log("Calculated Date Filter:", dateFilter);

        // Task Completion Rate
        const taskStats = await Task.aggregate([
            { $match: { createdAt: dateFilter } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Employee Workload (Assigned Tasks)
        // Employee Workload (Assigned Tasks)
        const workload = await Task.aggregate([
            {
                $match: {
                    status: { $ne: "Completed" },
                    assignedTo: { $exists: true, $ne: null }
                }
            },
            { $group: { _id: "$assignedTo", taskCount: { $sum: 1 } } },
            { $sort: { taskCount: -1 } },
            { $limit: 10 },
            { $lookup: { from: "employees", localField: "_id", foreignField: "_id", as: "employee" } },
            { $unwind: { path: "$employee", preserveNullAndEmptyArrays: false } }, // Ensure we have employee details
            { $project: { name: { $concat: ["$employee.firstName", " ", "$employee.lastName"] }, taskCount: 1 } }
        ]);

        // Overdue Tasks
        const overdueTasks = await Task.countDocuments({
            dueDate: { $lt: new Date() },
            status: { $nin: ["Completed", "Done"] } // Adjust status matches as per enum
        });

        // Project Progress Overview
        const projectStats = await Project.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    avgProgress: { $avg: "$progress" }
                }
            }
        ]);

        return successResponse(res, {
            tasksByStatus: taskStats,
            employeeWorkload: workload,
            overdueTaskCount: overdueTasks,
            projectStats
        }, "Performance analytics fetched");

    } catch (error) {
        console.error("Performance Analytics Error:", error);
        return errorResponse(res, "Failed to fetch performance analytics", 500);
    }
};

// 5. Payroll & Compensation Analytics
exports.getPayrollAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const Payroll = require('../../../models/Payroll/Payroll');
        const Employee = require('../../../models/Employee/Employee'); // Ensure Employee model is loaded for CTC query

        // Total Payroll Cost (Current Month)
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentYear = now.getFullYear();

        const currentPayroll = await Payroll.aggregate([
            {
                $match: {
                    month: currentMonth,
                    year: currentYear
                }
            },
            { $group: { _id: null, totalCost: { $sum: "$netSalary" } } }
        ]);

        // 12-Month Payroll Trend
        // We want the last 12 months. We can construct a Date from year/month for sorting
        const payrollTrends = await Payroll.aggregate([
            {
                $addFields: {
                    dateObject: {
                        $dateFromParts: {
                            year: "$year",
                            month: "$month",
                            day: 1
                        }
                    }
                }
            },
            {
                $match: {
                    dateObject: {
                        $gte: new Date(new Date().setMonth(now.getMonth() - 11)) // Last 12 months
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$dateObject" } },
                    totalNetPay: { $sum: "$netSalary" }, // Using correct field name
                    employeeCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // CTC Distribution by Department (From Employee Model)
        // Note: 'salary' field in Employee model is usually 'basicSalary' or we need to check Employee schema
        // Checking Employee schema... it has 'basicSalary'. We'll use that as proxy for CTC if no separate CTC field
        const ctcByDept = await Employee.aggregate([
            { $match: { status: { $in: ['Probation', 'Confirmed'] } } },
            {
                $group: {
                    _id: "$department",
                    avgCTC: { $avg: "$basicSalary" },
                    totalCTC: { $sum: "$basicSalary" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalCTC: -1 } }
        ]);

        return successResponse(res, {
            currentMonthCost: currentPayroll[0]?.totalCost || 0,
            trends: payrollTrends,
            ctcByDepartment: ctcByDept
        }, "Payroll analytics fetched");

    } catch (error) {
        console.error("Payroll Analytics Error:", error);
        return errorResponse(res, "Failed to fetch payroll analytics", 500);
    }
};

// 6. Tickets & Support Analytics
exports.getTicketsAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const Ticket = require('../../../models/Ticket/ticket.model'); // Corrected path
        const dateFilter = getDateFilter(startDate, endDate);

        // Ticket Status Distribution
        const statusDist = await Ticket.aggregate([
            { $match: { createdAt: dateFilter } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Average Resolution Time (for closed tickets)
        const resolutionTime = await Ticket.aggregate([
            {
                $match: {
                    status: "Closed",
                    createdAt: dateFilter,
                    closedAt: { $exists: true }
                }
            },
            {
                $project: {
                    resolutionDays: {
                        $dateDiff: {
                            startDate: "$createdAt",
                            endDate: "$closedAt",
                            unit: "day"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgResolutionDays: { $avg: "$resolutionDays" }
                }
            }
        ]);

        // Tickets by Category
        const byCategory = await Ticket.aggregate([
            { $match: { createdAt: dateFilter } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        return successResponse(res, {
            statusDistribution: statusDist,
            avgResolutionDays: resolutionTime[0]?.avgResolutionDays || 0,
            byCategory: byCategory
        }, "Tickets analytics fetched");

    } catch (error) {
        console.error("Tickets Analytics Error:", error);
        return errorResponse(res, "Failed to fetch tickets analytics", 500);
    }
};

// 7. Recruitment Pipeline Analytics
exports.getRecruitmentAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const Candidate = require('../../../models/Recruitment/Candidate');
        // Removed Interview model as it does not exist
        const dateFilter = getDateFilter(startDate, endDate);

        // Candidates by Stage (Status)
        const candidatesByStage = await Candidate.aggregate([
            { $match: { createdAt: dateFilter } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Time to Hire (Estimated from createdAt to updatedAt for 'Selected' candidates)
        // Since offerAcceptedDate is missing, we use updatedAt for Selected candidates as a proxy
        const timeToHire = await Candidate.aggregate([
            {
                $match: {
                    status: "Selected",
                    createdAt: dateFilter
                }
            },
            {
                $project: {
                    daysToHire: {
                        $dateDiff: {
                            startDate: "$createdAt",
                            endDate: "$updatedAt",
                            unit: "day"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgTimeToHire: { $avg: "$daysToHire" }
                }
            }
        ]);

        // Candidates by Source (Replacing Interview Results)
        const sourceStats = await Candidate.aggregate([
            { $match: { createdAt: dateFilter } },
            {
                $group: {
                    _id: "$source",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        return successResponse(res, {
            pipelineStages: candidatesByStage,
            avgTimeToHire: timeToHire[0]?.avgTimeToHire || 0,
            sourceResults: sourceStats
        }, "Recruitment analytics fetched");

    } catch (error) {
        console.error("Recruitment Analytics Error:", error);
        return errorResponse(res, "Failed to fetch recruitment analytics", 500);
    }
};

// 8. Attrition & Retention Analytics
exports.getAttritionAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = getDateFilter(startDate, endDate);

        // Define resignation-related statuses
        const resignationStatuses = ['Resignation Submitted', 'Notice Period', 'Exit Process', 'Relieved', 'Terminated'];

        // Resignations in Period (using updatedAt as proxy for when status changed)
        // Also include those with resignationDate set
        const resignations = await Employee.countDocuments({
            $or: [
                {
                    status: { $in: resignationStatuses },
                    updatedAt: dateFilter
                },
                {
                    "resignationData.resignationDate": dateFilter
                }
            ]
        });

        // Total current resignations (regardless of date)
        const totalResignations = await Employee.countDocuments({
            status: { $in: ['Relieved', 'Terminated'] }
        });

        // Attrition Rate (using total resignations vs total employees)
        const totalEmployees = await Employee.countDocuments();
        const attritionRate = totalEmployees > 0 ? ((totalResignations / totalEmployees) * 100).toFixed(2) : 0;

        // Resignations by Department (all resigned/terminated employees)
        const resignationsByDept = await Employee.aggregate([
            { $match: { status: { $in: ['Relieved', 'Terminated'] } } },
            { $group: { _id: "$department", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Resignation Reasons (from all resigned employees)
        const resignationReasons = await Employee.aggregate([
            {
                $match: {
                    status: { $in: resignationStatuses },
                    "resignationData.reason": { $exists: true, $ne: null, $ne: '' }
                }
            },
            { $group: { _id: "$resignationData.reason", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Average Tenure of Resigned Employees (all resigned, not just in date range)
        const avgTenureResigned = await Employee.aggregate([
            {
                $match: {
                    status: { $in: ['Relieved', 'Terminated'] },
                    joiningDate: { $exists: true }
                }
            },
            {
                $project: {
                    tenureDays: {
                        $dateDiff: {
                            startDate: "$joiningDate",
                            endDate: {
                                $ifNull: [
                                    "$resignationData.resignationDate",
                                    "$updatedAt"  // Fallback to updatedAt if resignationDate not set
                                ]
                            },
                            unit: "day"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgTenureDays: { $avg: "$tenureDays" }
                }
            }
        ]);

        return successResponse(res, {
            resignationCount: totalResignations, // Show total resignations, not just in date range
            attritionRate: parseFloat(attritionRate),
            byDepartment: resignationsByDept,
            reasons: resignationReasons,
            avgTenureOfResigned: avgTenureResigned[0]?.avgTenureDays || 0
        }, "Attrition analytics fetched");

    } catch (error) {
        console.error("Attrition Analytics Error:", error);
        return errorResponse(res, "Failed to fetch attrition analytics", 500);
    }
};
