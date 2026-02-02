const Employee = require('../../models/Employee/Employee');
const Attendance = require('../../models/Attendance/Attendance');
const Leave = require('../../models/Leave/Leave');
const Project = require('../../models/Project/Project');
const Task = require('../../models/Task/Task');
const Payroll = require('../../models/Payroll/Payroll');
const Shift = require('../../models/Shift/Shift');
const Media = require('../../models/Media/Media');
const Holiday = require('../../models/Holiday/Holiday');
const Announcement = require('../../models/Announcement/Announcement');
const Recruitment = require('../../models/Recruitment/Recruitment');
const Income = require('../../models/Income/Income');
const Expense = require('../../models/Expense/Expense');
const Report = require('../../models/Report/Report');
const Ticket = require('../../models/Ticket/ticket.model');

const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ isActive: { $ne: false } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today },
      status: 'Present'
    });

    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const pendingResignations = await Employee.countDocuments({ status: 'Resignation Submitted' }); // Count pending resignations
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalPayroll = await Payroll.countDocuments();
    const totalShifts = await Shift.countDocuments();
    const totalMedia = await Media.countDocuments();
    const totalHolidays = await Holiday.countDocuments();
    const totalAnnouncements = await Announcement.countDocuments();
    const totalRecruitment = await Recruitment.countDocuments();
    const totalReports = await Report.countDocuments();
    const totalTickets = await Ticket.countDocuments();

    // Calculate Total Income
    const incomeResult = await Income.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
    const totalIncomeCount = await Income.countDocuments();

    // Calculate Total Expense
    const expenseResult = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpense = expenseResult.length > 0 ? expenseResult[0].total : 0;
    const totalExpenseCount = await Expense.countDocuments();

    const totalBalance = totalIncome - totalExpense;

    const employeesByDepartment = await Employee.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: currentMonth }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // --- CHART 1: Department-wise Attendance (Last 7 Days) ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const deptAttendanceAgg = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: sevenDaysAgo, $lte: todayEnd }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeDetails'
        }
      },
      { $unwind: '$employeeDetails' },
      {
        $group: {
          _id: '$employeeDetails.department',
          Present: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          },
          Absent: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
          }
        }
      }
    ]);

    const departmentAttendance = deptAttendanceAgg.map(item => ({
      name: item._id || 'Unknown',
      Present: item.Present,
      Absent: item.Absent
    }));

    // --- CHART 2: Tasks by Status ---
    const taskGroups = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const taskChart = taskGroups.map(g => ({
      name: g._id || 'Unknown',
      value: g.count,
      fill: g._id === 'Completed' ? '#34C759' : g._id === 'In Progress' ? '#007AFF' : '#E5E5EA'
    }));
    // --- CHART 2.5: Projects by Status (NEW) ---
    const projectGroups = await Project.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const projectStatusChart = projectGroups.map(g => ({
      name: g._id || 'Unknown',
      value: g.count,
      fill: g._id === 'Completed' ? '#34C759'
        : g._id === 'Active' ? '#007AFF'
          : g._id === 'Planning' ? '#FF9500'
            : g._id === 'On Hold' ? '#FF3B30' // Red for On Hold
              : '#8E8E93'
    }));

    // --- HELPERS for Charts ---
    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const getLast6Months = () => {
      const months = [];
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push({
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          name: monthNames[d.getMonth() + 1]
        });
      }
      return months;
    };

    const last6Months = getLast6Months();

    // --- CHART 3: Accounts (Income vs Expense - Last 6 Months) ---
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const incomeAgg = await Income.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Merge with last 6 months to ensure all months show (fill 0)
    const accountChart = last6Months.map(m => {
      const found = incomeAgg.find(item => item._id.year === m.year && item._id.month === m.month);
      return {
        name: m.name,
        val: found ? found.total : 0
      };
    });

    // --- CHART 4: Project Creation Trend (Last 6 Months) ---
    const projectAgg = await Project.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]);

    const projectChart = last6Months.map(m => {
      const found = projectAgg.find(item => item._id.year === m.year && item._id.month === m.month);
      return {
        name: m.name,
        progress: found ? found.count : 0
      };
    });

    const recentMedia = await Media.find().sort({ createdAt: -1 }).limit(6);

    const stats = {
      totalEmployees,
      todayAttendance,
      pendingLeaves,
      totalProjects,
      totalTasks,
      totalPayroll,
      totalShifts,
      totalMedia,
      totalHolidays,
      totalAnnouncements,
      totalRecruitment,
      totalReports,
      totalTickets,
      pendingResignations, // Add pending resignations
      totalIncome,
      totalIncomeCount,
      totalExpense,
      totalExpenseCount,
      totalBalance,
      employeesByDepartment,
      monthlyAttendance,
      departmentAttendance,
      taskChart,
      projectStatusChart,
      accountChart,
      projectChart,
      recentMedia
    };

    return successResponse(res, { stats }, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    return errorResponse(res, error.message, 500);
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const recentEmployees = await Employee.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName employeeId createdAt');
    const recentLeaves = await Leave.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employee', 'firstName lastName')
      .select('leaveType status createdAt');
    const recentAttendance = await Attendance.find()
      .sort({ date: -1 })
      .limit(5)
      .populate('employee', 'firstName lastName')
      .select('date status checkIn checkOut');
    const activities = {
      recentEmployees,
      recentLeaves,
      recentAttendance
    };
    return successResponse(res, { activities }, 'Recent activities retrieved successfully');
  } catch (error) {
    logger.error('Get recent activities error:', error);
    return errorResponse(res, error.message, 500);
  }
};