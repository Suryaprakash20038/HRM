const Attendance = require('../../models/Attendance/Attendance');
const Employee = require('../../models/Employee/Employee');
const User = require('../../models/User/User');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');

// Helper to resolve employee from logged-in user
const getEmployeeFromUser = async (userId) => {
  let employee = await Employee.findOne({ userId });
  if (!employee) {
    // Fallback: try finding by email if userId link is missing
    const user = await User.findById(userId);
    if (user) {
      employee = await Employee.findOne({ email: user.email });
    }
  }
  return employee;
};

exports.checkIn = async (req, res) => {
  try {
    let { employeeId } = req.body;

    // If no employeeId provided, try to find from logged-in user
    if (!employeeId && req.user) {
      const employee = await getEmployeeFromUser(req.user.id);
      if (employee) {
        employeeId = employee._id;
      }
    }

    if (!employeeId) {
      return errorResponse(res, 'Employee ID is required. Please ensure your profile is linked.', 400);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: today }
    });
    if (existingAttendance) {
      return errorResponse(res, 'Already checked in today', 400);
    }
    const attendance = await Attendance.create({
      employee: employeeId,
      date: new Date(),
      checkIn: new Date(),
      status: 'Present'
    });
    logger.info(`Employee checked in: ${employeeId}`);
    return successResponse(res, { attendance }, 'Checked in successfully', 201);
  } catch (error) {
    logger.error('Check in error:', error);
    return errorResponse(res, error.message, 500);
  }
};

exports.checkOut = async (req, res) => {
  try {
    let { employeeId, checkOutTime } = req.body;

    // If no employeeId provided, try to find from logged-in user
    if (!employeeId && req.user) {
      const employee = await getEmployeeFromUser(req.user.id);
      if (employee) {
        employeeId = employee._id;
      }
    }

    if (!employeeId) {
      return errorResponse(res, 'Employee ID is required', 400);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: today }
    });
    if (!attendance) {
      return errorResponse(res, 'No check-in record found for today', 404);
    }
    if (attendance.checkOut) {
      return errorResponse(res, 'Already checked out', 400);
    }

    // Use provided time or current time
    attendance.checkOut = checkOutTime ? new Date(checkOutTime) : new Date();

    await attendance.save();
    logger.info(`Employee checked out: ${employeeId}`);
    return successResponse(res, { attendance }, 'Checked out successfully');
  } catch (error) {
    logger.error('Check out error:', error);
    return errorResponse(res, error.message, 500);
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};

    // If user is employee, force their own ID
    if (req.user && req.user.role === 'employee') {
      const employee = await getEmployeeFromUser(req.user.id);
      if (employee) {
        query.employee = employee._id;
      } else {
        return errorResponse(res, 'Employee record not found', 404);
      }
    } else if (employeeId) {
      // Admin can filter by any employee
      query.employee = employeeId;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query.date = {
        $gte: start,
        $lte: end
      };
    }
    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });
    const total = await Attendance.countDocuments(query);
    return successResponse(res, {
      attendance,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }, 'Attendance records retrieved successfully');
  } catch (error) {
    logger.error('Get attendance error:', error);
    return errorResponse(res, error.message, 500);
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Upsert: Update if exists for this day, else create
    const attendance = await Attendance.findOneAndUpdate(
      {
        employee: employeeId,
        date: { $gte: startOfDay, $lte: endOfDay }
      },
      {
        employee: employeeId,
        date: targetDate, // Update date to the new one (or keep existing)
        status,
        checkIn,
        checkOut,
        notes
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    logger.info(`Attendance marked/updated manually for employee: ${employeeId}`);
    return successResponse(res, { attendance }, 'Attendance marked successfully', 201);
  } catch (error) {
    logger.error('Mark attendance error:', error);
    return errorResponse(res, error.message, 500);
  }
};

const { getAttendanceSummary } = require('../../services/attendance.service');

exports.getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentYear = parseInt(year) || new Date().getFullYear();
    const currentMonth = parseInt(month) || (new Date().getMonth() + 1);

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Aggregate present days per employee
    const diffStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $in: ['Present', 'Late', 'Half-day'] } // Considering these as 'Working'
        }
      },
      {
        $group: {
          _id: "$employee",
          presentDays: { $sum: { $cond: [{ $eq: ["$status", "Half-day"] }, 0.5, 1] } }
        }
      }
    ]);

    // Calculate Total Working Days in this month (excluding weekends)
    let totalWorkingDays = 0;
    let d = new Date(startDate);
    while (d <= endDate) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) {
        totalWorkingDays++;
      }
      d.setDate(d.getDate() + 1);
    }

    const summaryMap = {};
    diffStats.forEach(stat => {
      summaryMap[stat._id] = stat.presentDays;
    });

    return successResponse(res, { summary: summaryMap, totalWorkingDays }, 'Monthly summary retrieved');
  } catch (error) {
    logger.error('Monthly summary error:', error);
    return errorResponse(res, error.message, 500);
  }
};

exports.getEmployeeStats = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    if (!employeeId || !month || !year) {
      return errorResponse(res, 'Missing params', 400);
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Calculate stats using the service (strictly same logic as payroll)
    const stats = await getAttendanceSummary(employeeId, startDate, endDate, true); // Enable sandwich rule for preview

    return successResponse(res, { stats }, 'Employee attendance stats retrieved');
  } catch (error) {
    logger.error('Get employee stats error:', error);
    return errorResponse(res, error.message, 500);
  }
};
