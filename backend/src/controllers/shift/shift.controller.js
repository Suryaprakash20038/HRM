const Shift = require('../../models/Shift/Shift');
const ShiftSchedule = require('../../models/Shift/ShiftSchedule');
const Employee = require('../../models/Employee/Employee');
const Notification = require('../../models/Notification/Notification');
const User = require('../../models/User/User');
const mongoose = require('mongoose');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');

exports.getAllShifts = async (req, res) => {
    try {
        const { shiftType } = req.query;
        const query = { isActive: true };

        if (shiftType) query.shiftType = shiftType;

        const shifts = await Shift.find(query)
            .populate('assignedEmployees', 'firstName lastName employeeId department profileImage')
            .sort({ shiftName: 1 });

        return successResponse(res, { shifts }, 'Shifts retrieved successfully');

    } catch (error) {
        logger.error('Get all shifts error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getShiftById = async (req, res) => {
    try {
        const shift = await Shift.findById(req.params.id)
            .populate('assignedEmployees', 'firstName lastName employeeId email');

        if (!shift) {
            return errorResponse(res, 'Shift not found', 404);
        }

        return successResponse(res, { shift }, 'Shift retrieved successfully');

    } catch (error) {
        logger.error('Get shift by ID error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.createShift = async (req, res) => {
    try {
        const shift = await Shift.create(req.body);

        logger.info(`New shift created: ${shift.shiftName}`);

        return successResponse(res, { shift }, 'Shift created successfully', 201);

    } catch (error) {
        logger.error('Create shift error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.updateShift = async (req, res) => {
    try {
        const shift = await Shift.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('assignedEmployees', 'firstName lastName');

        if (!shift) {
            return errorResponse(res, 'Shift not found', 404);
        }

        logger.info(`Shift updated: ${shift.shiftName}`);

        return successResponse(res, { shift }, 'Shift updated successfully');

    } catch (error) {
        logger.error('Update shift error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.deleteShift = async (req, res) => {
    try {
        const shift = await Shift.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!shift) {
            return errorResponse(res, 'Shift not found', 404);
        }

        logger.info(`Shift deactivated: ${shift.shiftName}`);

        return successResponse(res, { shift }, 'Shift deactivated successfully');

    } catch (error) {
        logger.error('Delete shift error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.assignShift = async (req, res) => {
    try {
        const { shiftId, employeeIds } = req.body;

        const shift = await Shift.findById(shiftId);

        if (!shift) {
            return errorResponse(res, 'Shift not found', 404);
        }

        shift.assignedEmployees = employeeIds;
        await shift.save();

        logger.info(`Employees assigned to shift: ${shift.shiftName}`);

        return successResponse(res, { shift }, 'Shift assigned successfully');

    } catch (error) {
        logger.error('Assign shift error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// ==========================================
// Roster / Date-Based Scheduling Methods
// ==========================================

exports.getSchedule = async (req, res) => {
    try {
        const { startDate, endDate, department, employeeId } = req.query;

        if (!startDate || !endDate) {
            return errorResponse(res, 'StartDate and EndDate are required', 400);
        }

        const query = {
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        if (employeeId) {
            query.employee = employeeId;
        } else if (department) {
            // Find employees in department first
            const employees = await Employee.find({ department }).select('_id');
            query.employee = { $in: employees.map(e => e._id) };
        }

        const schedules = await ShiftSchedule.find(query)
            .populate('employee', 'firstName lastName department profileImage')
            .populate('shift', 'shiftName shiftType')
            .sort({ date: 1 });

        return successResponse(res, { schedules }, 'Schedule retrieved successfully');

    } catch (error) {
        logger.error('Get schedule error:', error);
        console.error('Full Error Stack:', error.stack);
        return errorResponse(res, `Internal Server Error: ${error.message}`, 500);
    }
};

exports.assignSchedule = async (req, res) => {
    try {
        const {
            employeeIds,
            startDate,
            endDate,
            // Fixed / Manual Mode
            shiftId, startTime, endTime, type, isManual,
            // Rotation Mode
            assignmentType, // 'fixed' | 'rotation'
            rotationFrequency, // 'daily' | 'weekly'
            rotationShifts // Array of shiftIds
        } = req.body;

        if (!employeeIds || !employeeIds.length || !startDate || !endDate) {
            return errorResponse(res, 'Missing required fields', 400);
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Pre-fetch shift details
        let shiftDetailsMap = {};
        let singleShiftDetails = null;

        if (assignmentType === 'rotation' && rotationShifts && rotationShifts.length > 0) {
            const shifts = await Shift.find({ _id: { $in: rotationShifts } });
            shifts.forEach(s => { shiftDetailsMap[s._id.toString()] = s; });
        } else if (shiftId && !isManual) {
            singleShiftDetails = await Shift.findById(shiftId);
            if (!singleShiftDetails) return errorResponse(res, 'Invalid Shift ID', 400);
        }

        // Optimization: Pre-fetch existing schedules to determine "isDoubleShift"
        // Avoids DB call inside loop
        const existingSchedules = await ShiftSchedule.find({
            employee: { $in: employeeIds },
            date: { $gte: start, $lte: end }
        }).select('employee date');

        // Map: employeeId -> Set(dateString)
        const scheduleMap = {};
        existingSchedules.forEach(s => {
            const dStr = s.date.toISOString().split('T')[0];
            const empStr = s.employee.toString();
            if (!scheduleMap[empStr]) scheduleMap[empStr] = new Set();
            scheduleMap[empStr].add(dStr);
        });

        // Pre-fetch employee details (name, dep) for denormalization
        const employeeDetails = await Employee.find({ _id: { $in: employeeIds } }).select('firstName lastName department');
        const empMap = {};
        employeeDetails.forEach(e => {
            empMap[e._id.toString()] = {
                name: `${e.firstName} ${e.lastName}`,
                dept: e.department
            };
        });

        const operations = [];
        const loopDate = new Date(start);

        // Calculate total days for index logic
        const startTimestamp = start.getTime();

        while (loopDate <= end) {
            const currentIsoDate = new Date(loopDate);
            const dateStr = currentIsoDate.toISOString().split('T')[0];
            const diffTime = Math.abs(currentIsoDate.getTime() - startTimestamp);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let currentShift = null;
            let sTime, eTime, sType, sId;

            if (assignmentType === 'rotation') {
                if (!rotationShifts || rotationShifts.length === 0) {
                    // Optimization: Loop increment at end
                    loopDate.setDate(loopDate.getDate() + 1);
                    continue;
                }

                let index = 0;
                if (rotationFrequency === 'weekly') {
                    index = Math.floor(diffDays / 7) % rotationShifts.length;
                } else {
                    // daily or default
                    index = diffDays % rotationShifts.length;
                }

                sId = rotationShifts[index];
                currentShift = shiftDetailsMap[sId];

                if (currentShift) {
                    sTime = currentShift.startTime;
                    eTime = currentShift.endTime;
                    sType = currentShift.shiftType;
                } else {
                    // Fallback or skip if shift not found
                    loopDate.setDate(loopDate.getDate() + 1);
                    continue;
                }
            } else {
                // Fixed or Manual
                if (isManual) {
                    sTime = startTime;
                    eTime = endTime;
                    sType = type || 'Regular';
                    sId = null;
                } else {
                    currentShift = singleShiftDetails;
                    sTime = currentShift.startTime;
                    eTime = currentShift.endTime;
                    sType = currentShift.shiftType;
                    sId = shiftId;
                }
            }

            for (const empId of employeeIds) {
                // Check if employee has a shift on this date already
                const hasShift = scheduleMap[empId] && scheduleMap[empId].has(dateStr);
                const isDouble = !!hasShift;

                operations.push({
                    insertOne: {
                        document: {
                            employee: empId,
                            shift: sId,
                            date: currentIsoDate,
                            startTime: sTime,
                            endTime: eTime,
                            type: sType,
                            isDoubleShift: isDouble,
                            employeeName: empMap[empId] ? empMap[empId].name : '',
                            department: empMap[empId] ? empMap[empId].dept : ''
                        }
                    }
                });
            }

            loopDate.setDate(loopDate.getDate() + 1);
        }

        if (operations.length > 0) {
            await ShiftSchedule.bulkWrite(operations);

            // Notify Assigned Employees
            const { sendShiftNotification } = require('../../services/notification.service');
            await sendShiftNotification(employeeIds, startDate, endDate);
        }

        return successResponse(res, { count: operations.length }, 'Schedule assigned successfully');

    } catch (error) {
        logger.error('Assign schedule error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getStats = async (req, res) => {
    try {
        const { startDate, endDate, employeeId } = req.query;

        const endObj = new Date(endDate);
        endObj.setUTCHours(23, 59, 59, 999);

        const matchStage = {
            date: { $gte: new Date(startDate), $lte: endObj }
        };

        if (employeeId) matchStage.employee = new mongoose.Types.ObjectId(employeeId);

        const stats = await ShiftSchedule.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$employee",
                    totalShifts: { $sum: 1 },
                    doubleShifts: { $sum: { $cond: ["$isDoubleShift", 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "_id",
                    foreignField: "_id",
                    as: "employeeDetails"
                }
            },
            {
                $project: {
                    employee: { $arrayElemAt: ["$employeeDetails", 0] },
                    totalShifts: 1,
                    doubleShifts: 1
                }
            },
            {
                $project: {
                    "employee.firstName": 1,
                    "employee.lastName": 1,
                    "employee.department": 1,
                    totalShifts: 1,
                    doubleShifts: 1
                }
            }
        ]);

        return successResponse(res, { stats }, 'Stats retrieved successfully');

    } catch (error) {
        logger.error('Get stats error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ShiftSchedule.findByIdAndDelete(id);
        if (!result) return errorResponse(res, "Schedule entry not found", 404);
        return successResponse(res, null, "Schedule deleted successfully");
    } catch (error) {
        logger.error('Delete schedule error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { shiftId, startTime, endTime, type, isManual } = req.body;

        let updateData = {};

        if (isManual) {
            updateData = {
                shift: null,
                startTime,
                endTime,
                type: type || 'Regular'
            };
        } else if (shiftId) {
            const shift = await Shift.findById(shiftId);
            if (!shift) return errorResponse(res, 'Shift not found', 404);
            updateData = {
                shift: shiftId,
                startTime: shift.startTime,
                endTime: shift.endTime,
                type: shift.shiftType
            };
        } else {
            return errorResponse(res, 'Must provide shiftId or isManual=true', 400);
        }

        const result = await ShiftSchedule.findByIdAndUpdate(id, updateData, { new: true });
        if (!result) return errorResponse(res, "Schedule entry not found", 404);

        return successResponse(res, { schedule: result }, "Schedule updated successfully");

    } catch (error) {
        logger.error('Update schedule error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getMyTodayShift = async (req, res) => {
    try {
        // Resolve Employee ID
        let employee = await Employee.findOne({ userId: req.user.id }).populate('shift');
        if (!employee) {
            const user = await User.findById(req.user.id);
            if (user) {
                employee = await Employee.findOne({ email: user.email }).populate('shift');
            }
        }

        if (!employee) {
            // Instead of 404, return a default "No Shift" state to prevent frontend errors
            return successResponse(res, {
                shiftName: 'No Shift Assigned',
                startTime: '--:--',
                endTime: '--:--',
                type: 'Off',
                message: 'User is not linked to an employee profile'
            }, 'No employee profile found, returning default shift.');
        }

        // 1. Check ShiftSchedule for "Today" using Robust Lookup
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Search Window: Yesterday to Tomorrow to cover Timezones
        const searchStart = new Date(today);
        searchStart.setDate(searchStart.getDate() - 1);
        const searchEnd = new Date(today);
        searchEnd.setDate(searchEnd.getDate() + 2);

        const schedules = await ShiftSchedule.find({
            employee: employee._id,
            date: { $gte: searchStart, $lt: searchEnd }
        }).populate('shift');

        // Explicit String Match date
        // Robust Schedule Lookup
        let schedule = schedules.find(s => {
            const sDate = new Date(s.date);
            return sDate >= today && sDate < new Date(today.getTime() + 86400000);
        });

        // Fallback
        if (!schedule) {
            schedule = await ShiftSchedule.findOne({
                employee: employee._id,
                date: { $gte: today, $lt: new Date(new Date(today).getTime() + 86400000) }
            }).populate('shift');
        }

        if (schedule) {
            return successResponse(res, {
                shiftName: schedule.isDoubleShift ? 'Double Shift' : (schedule.shift ? schedule.shift.shiftName : 'Custom Schedule'),
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                graceTime: schedule.shift ? schedule.shift.graceTime : (schedule.graceTime || 0),
                type: schedule.type // Regular, Overtime, etc.
            }, 'Shift retrieved from schedule');
        }

        // 2. Fallback to Default Shift
        if (employee.shift) {
            return successResponse(res, {
                shiftName: employee.shift.shiftName,
                startTime: employee.shift.startTime,
                endTime: employee.shift.endTime,
                graceTime: employee.shift.graceTime,
                type: employee.shift.shiftType
            }, 'Shift retrieved from profile default');
        }

        // 3. No shift found
        return successResponse(res, {
            shiftName: 'No Shift Assigned',
            startTime: '--:--',
            endTime: '--:--',
            type: 'Off'
        }, 'No shift found');

    } catch (error) {
        logger.error('Get my today shift error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getMyWeeklySchedule = async (req, res) => {
    try {
        // Resolve Employee ID
        let employee = await Employee.findOne({ userId: req.user.id }).populate('shift');
        if (!employee) {
            const user = await User.findById(req.user.id);
            if (user) {
                employee = await Employee.findOne({ email: user.email }).populate('shift');
            }
        }

        if (!employee) {
            return successResponse(res, { schedules: [], defaultShift: null }, 'No employee profile found.');
        }

        const today = new Date();
        const currentDay = today.getDay(); // 0 is Sunday

        // Calculate Sunday of this week
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDay);
        startOfWeek.setHours(0, 0, 0, 0);

        // Calculate Saturday of this week
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const schedules = await ShiftSchedule.find({
            employee: employee._id,
            date: { $gte: startOfWeek, $lte: endOfWeek }
        }).populate('shift').sort({ date: 1 });

        return successResponse(res, {
            schedules,
            defaultShift: employee.shift
        }, 'Weekly schedule retrieved successfully');

    } catch (error) {
        logger.error('Get my weekly schedule error:', error);
        return errorResponse(res, error.message, 500);
    }
};
