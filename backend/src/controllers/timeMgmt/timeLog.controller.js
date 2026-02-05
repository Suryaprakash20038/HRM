const TimeLog = require('../../models/TimeMgmt/TimeLog');
const Attendance = require('../../models/Attendance/Attendance');
const Employee = require('../../models/Employee/Employee');
const Shift = require('../../models/Shift/Shift');
const RegularisationRequest = require('../../models/Regularisation/RegularisationRequest');
const Notification = require('../../models/Notification/Notification');
const User = require('../../models/User/User');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');

// Helper to parse "HH:mm AM/PM" to a Date object for today
const parseTime = (timeStr, date = new Date()) => {
    if (!timeStr) return null;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }
    const d = new Date(date);
    d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return d;
};

exports.checkIn = async (req, res) => {
    try {
        const { employeeId, lateReason, hasPermission } = req.body;

        if (!employeeId) {
            return errorResponse(res, 'Employee ID is required', 400);
        }

        let query;
        if (String(employeeId).includes('@')) {
            query = { email: employeeId };
        } else if (mongoose.Types.ObjectId.isValid(employeeId)) {
            query = { $or: [{ _id: employeeId }, { userId: employeeId }] };
        } else {
            return errorResponse(res, 'Invalid Employee ID/Email', 400);
        }

        const employee = await Employee.findOne(query).populate('shift');
        if (!employee) {
            return errorResponse(res, 'Employee not found', 404);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const now = new Date();

        // 1. CLEANUP PAST SESSIONS (Yesterday and older)
        const yesterdayAndBefore = await TimeLog.find({
            employee: employee._id,
            date: { $lt: today },
            'sessions.checkOut': { $exists: false } // active sessions only optimization
        }).sort({ date: -1 });

        // Iterate through any found logs with potentially open sessions
        // (Usually just one, but handle multiple just in case of data corruption)
        for (const prevLog of yesterdayAndBefore) {
            let limitExceeded = false;
            let modified = false;

            prevLog.sessions.forEach(session => {
                if (!session.checkOut) {
                    // Logic to determine a reasonable checkout time for past dates
                    // Default: CheckIn + 12 hours (Max limit) or Shift End
                    const checkInTime = new Date(session.checkIn);
                    const maxDuration = 12 * 60 * 60 * 1000;

                    let autoTime = new Date(checkInTime.getTime() + 9 * 60 * 60 * 1000); // Default 9 hours

                    if (prevLog.shiftSnapshot && prevLog.shiftSnapshot.endTime) {
                        // Try to use shift end
                        // Note: Complex date parsing omitted for brevity, using simple max limit fallback
                        // In a real scheduler this would be precise.
                        // Here we assume if they forgot to logout yesterday, we just close it.
                    }

                    // Enforce Max 12 Hours Cap
                    if (now.getTime() - checkInTime.getTime() > maxDuration) {
                        // cap at 12 hours
                        autoTime = new Date(checkInTime.getTime() + 12 * 60 * 60 * 1000);
                    }

                    session.checkOut = autoTime;
                    modified = true;
                }
            });

            if (modified) {
                prevLog.statusFlags = prevLog.statusFlags || {};
                prevLog.statusFlags.autoLogout = true;
                await prevLog.save();
                await syncToAttendance(prevLog);
            }
        }

        // 2. CHECK TODAY'S TIME LOG
        let timeLog = await TimeLog.findOne({
            employee: employee._id,
            date: { $gte: today }
        });

        const ShiftSchedule = require('../../models/Shift/ShiftSchedule');
        let activeShiftId = null;
        let activeShiftData = null;
        let shiftSnapshot = {};

        // Prepare Shift Data (Used for new log OR validations)
        // ... (Shift finding logic mostly same as before, simplified reuse) ...
        // Roster lookup
        const searchStart = new Date(today);
        searchStart.setDate(searchStart.getDate() - 1);
        const searchEnd = new Date(today);
        searchEnd.setDate(searchEnd.getDate() + 2);

        const rosters = await ShiftSchedule.find({
            employee: employee._id,
            date: { $gte: searchStart, $lt: searchEnd }
        }).populate('shift');

        const todayStr = now.toLocaleDateString('en-CA');

        // Robust Roster Lookup
        // We look for a roster entry where the date component matches today's date
        let roster = rosters.find(r => {
            const rDate = new Date(r.date);
            // Check if the roster date (usually UTC midnight) matches today's local date
            // Note: This comparison works if the server local time aligns with the intend of the schedule
            // For more precision, we might need to rely on the stored date string if available, 
            // but component check is better than ISO value split if timezones drift.

            // However, sticking to the standard used in fallback:
            // Check if r.date is within today's 24h window (Local)
            return rDate >= today && rDate < new Date(today.getTime() + 86400000);
        });

        if (!roster) {
            // Fallback Query - Explicitly for this day
            roster = await ShiftSchedule.findOne({
                employee: employee._id,
                date: { $gte: today, $lt: new Date(today.getTime() + 86400000) }
            }).populate('shift');
        }

        if (roster) {
            activeShiftData = {
                startTime: roster.startTime,
                endTime: roster.endTime,
                graceTime: roster.shift ? roster.shift.graceTime : (roster.graceTime || 0),
                breakDuration: roster.shift ? roster.shift.breakDuration : 0
            };
            activeShiftId = roster.shift ? roster.shift._id : null;
            // console.log(`[CheckIn] Found Roster for ${employee.firstName}:`, activeShiftData);
        } else if (employee.shift) {
            activeShiftData = {
                startTime: employee.shift.startTime,
                endTime: employee.shift.endTime,
                graceTime: employee.shift.graceTime,
                breakDuration: employee.shift.breakDuration
            };
            activeShiftId = employee.shift._id;
            // console.log(`[CheckIn] Using Default Shift for ${employee.firstName}:`, activeShiftData);
        }

        if (activeShiftData) {
            shiftSnapshot = {
                startTime: activeShiftData.startTime,
                endTime: activeShiftData.endTime,
                graceTime: activeShiftData.graceTime,
                breakDuration: activeShiftData.breakDuration || 0
            };
        }


        // 3. HANDLE SAME-DAY ACTIVE SESSIONS
        if (timeLog) {
            // Check if there is currently an active session
            const lastSession = timeLog.sessions[timeLog.sessions.length - 1];
            if (lastSession && !lastSession.checkOut) {
                // AUTO CHECK OUT PREVIOUS SESSION
                console.log(`Auto-closing previous active session for ${employee.firstName} to allow new check-in.`);
                lastSession.checkOut = now;
                timeLog.statusFlags.autoLogout = true; // Mark as auto-logout
                // We don't return here, we proceed to add the NEW session check-in
            }
            // Add New Session
            timeLog.sessions.push({ checkIn: now });
        } else {
            // Create New Type Log
            let statusFlags = { properCheckIn: false, lateLogin: false };

            if (activeShiftData) {
                const shiftStart = parseTime(activeShiftData.startTime, now);
                const grace = activeShiftData.graceTime || 15; // User policy: 15 min default
                const lateThreshold = new Date(shiftStart.getTime() + grace * 60000);
                if (now <= lateThreshold) statusFlags.properCheckIn = true;
                else {
                    statusFlags.lateLogin = true;
                    if (lateReason) statusFlags.lateLoginReason = lateReason;
                    if (hasPermission) statusFlags.hasPermission = hasPermission;
                }
            } else {
                statusFlags.properCheckIn = true;
            }

            timeLog = new TimeLog({
                employee: employee._id,
                date: today,
                shift: activeShiftId,
                shiftSnapshot,
                sessions: [{ checkIn: now }],
                statusFlags
            });
        }

        await timeLog.save();
        await syncToAttendance(timeLog);

        logger.info(`Check-in processed for ${employeeId} at ${now}`);
        return successResponse(res, { timeLog }, 'Checked in successfully');

    } catch (error) {
        logger.error('Check-in error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.checkOut = async (req, res) => {
    try {
        const { employeeId } = req.body;

        let query;
        if (String(employeeId).includes('@')) {
            query = { email: employeeId };
        } else if (mongoose.Types.ObjectId.isValid(employeeId)) {
            query = { $or: [{ _id: employeeId }, { userId: employeeId }] };
        } else {
            return errorResponse(res, 'Invalid Employee ID/Email', 400);
        }
        const employee = await Employee.findOne(query).populate('shift');
        if (!employee) {
            return errorResponse(res, 'Employee not found', 404);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let timeLog = await TimeLog.findOne({
            employee: employee._id,
            date: { $gte: yesterday }
        }).sort({ date: -1 });

        if (!timeLog) {
            return errorResponse(res, 'No active session found for last 48 hours', 404);
        }

        const lastSession = timeLog.sessions[timeLog.sessions.length - 1];
        if (!lastSession || lastSession.checkOut) {
            return errorResponse(res, 'You are already checked out!', 400);
        }

        const now = new Date();
        lastSession.checkOut = now;

        // PRIORITY: Find Roster (ShiftSchedule)
        const ShiftSchedule = require('../../models/Shift/ShiftSchedule');

        // Use Wider Search Window
        const searchStart = new Date(today);
        searchStart.setDate(searchStart.getDate() - 1);
        const searchEnd = new Date(today);
        searchEnd.setDate(searchEnd.getDate() + 2);

        const rosters = await ShiftSchedule.find({
            employee: employee._id,
            date: { $gte: searchStart, $lt: searchEnd }
        }).populate('shift');

        const todayStr = now.toLocaleDateString('en-CA');
        let roster = rosters.find(r => {
            const rDate = new Date(r.date);
            return rDate >= today && rDate < new Date(today.getTime() + 86400000);
        });

        if (!roster) {
            roster = await ShiftSchedule.findOne({
                employee: employee._id,
                date: { $gte: today, $lt: new Date(new Date(today).getTime() + 86400000) }
            }).populate('shift');
        }

        let activeShiftData = null;

        if (roster) {
            activeShiftData = {
                startTime: roster.startTime,
                endTime: roster.endTime,
                graceTime: roster.shift ? roster.shift.graceTime : (roster.graceTime || 0),
                breakDuration: roster.shift ? roster.shift.breakDuration : 0
            };
            if (!activeShiftData.graceTime && roster.shift) activeShiftData.graceTime = roster.shift.graceTime;
            console.log(`CheckOut: Using Roster Shift for ${employee.firstName}:`, activeShiftData);
        } else if (employee.shift) {
            activeShiftData = {
                startTime: employee.shift.startTime,
                endTime: employee.shift.endTime,
                graceTime: employee.shift.graceTime,
                breakDuration: employee.shift.breakDuration
            };
            console.log(`CheckOut: Using Default Profile Shift for ${employee.firstName}:`, activeShiftData);
        }

        if (activeShiftData) {
            timeLog.shiftSnapshot = {
                startTime: activeShiftData.startTime,
                endTime: activeShiftData.endTime,
                graceTime: activeShiftData.graceTime,
                breakDuration: activeShiftData.breakDuration || 0
            };

            // Re-validate CheckIn Status (Fix for incorrect Late Login flags if Default Shift was used erroneously on CheckIn)
            if (timeLog.sessions.length > 0 && timeLog.sessions[0].checkIn) {
                const firstCi = new Date(timeLog.sessions[0].checkIn);
                const shiftStart = parseTime(activeShiftData.startTime, firstCi);
                const grace = activeShiftData.graceTime || 15;
                const lateThreshold = new Date(shiftStart.getTime() + grace * 60000);

                // If actual check-in was within the CORRECT roster shift limits
                if (firstCi <= lateThreshold) {
                    timeLog.statusFlags.lateLogin = false;
                } else {
                    timeLog.statusFlags.lateLogin = true;
                }
            }
        }

        let shiftEndTimeStr = null;
        if (activeShiftData && activeShiftData.endTime) {
            shiftEndTimeStr = activeShiftData.endTime;
        } else if (timeLog.shiftSnapshot && timeLog.shiftSnapshot.endTime) {
            shiftEndTimeStr = timeLog.shiftSnapshot.endTime;
        }

        if (shiftEndTimeStr) {
            const shiftEnd = parseTime(shiftEndTimeStr, now);
            const earlyThreshold = new Date(shiftEnd.getTime() - 60 * 60 * 1000);
            const lateThreshold = new Date(shiftEnd.getTime() + 10 * 60 * 1000);

            timeLog.statusFlags.earlyLogout = false;
            timeLog.statusFlags.properCheckOut = false;
            timeLog.statusFlags.lateLogout = false;

            if (now < earlyThreshold) {
                timeLog.statusFlags.earlyLogout = true;
            } else if (now >= shiftEnd && now <= lateThreshold) {
                timeLog.statusFlags.properCheckOut = true;
            } else if (now > lateThreshold) {
                timeLog.statusFlags.lateLogout = true;
            }
        }

        await timeLog.save();
        await syncToAttendance(timeLog);

        return successResponse(res, { timeLog }, 'Checked out successfully');

    } catch (error) {
        logger.error('Check-out error:', error);
        return errorResponse(res, error.message, 500);
    }
};

const syncToAttendance = async (timeLog) => {
    // Calculate final status per Shift Duration Logic
    let attendanceStatus = 'Absent';
    const hours = timeLog.totalWorkingHours;

    // Check for Active Session
    const isActive = timeLog.sessions.length > 0 && !timeLog.sessions[timeLog.sessions.length - 1].checkOut;

    let shiftDuration = 8; // Default

    // Attempt to calculate precise shift duration from Snapshot
    if (timeLog.shiftSnapshot && timeLog.shiftSnapshot.startTime && timeLog.shiftSnapshot.endTime) {
        try {
            // Helper to get minutes from HH:MM [AM/PM]
            const getMinutes = (timeStr) => {
                const [time, modifier] = timeStr.split(' ');
                let [h, m] = time.split(':').map(Number);

                if (modifier) {
                    if (modifier === 'PM' && h < 12) h += 12;
                    if (modifier === 'AM' && h === 12) h = 0;
                }

                return h * 60 + m;
            };

            let startMin = getMinutes(timeLog.shiftSnapshot.startTime);
            let endMin = getMinutes(timeLog.shiftSnapshot.endTime);

            if (endMin < startMin) endMin += 24 * 60; // Overnight

            const diffMin = endMin - startMin;
            if (diffMin > 0) shiftDuration = diffMin / 60;

        } catch (e) {
            console.error("Error calculating shift duration, using 8h default", e);
        }
    }

    if (isActive) {
        attendanceStatus = 'Present'; // Implicitly Present if currently checked in
    } else {
        // Validation Thresholds
        const presentThreshold = shiftDuration * 0.70;
        const halfDayThreshold = shiftDuration * 0.40;

        if (hours >= presentThreshold) attendanceStatus = 'Present';
        else if (hours >= halfDayThreshold) attendanceStatus = 'Half-day';
        else attendanceStatus = 'Absent';
    }

    const firstCheckIn = timeLog.sessions[0]?.checkIn;
    const lastCheckOut = timeLog.sessions[timeLog.sessions.length - 1]?.checkOut;

    await Attendance.findOneAndUpdate(
        { employee: timeLog.employee, date: timeLog.date },
        {
            employee: timeLog.employee,
            date: timeLog.date,
            checkIn: firstCheckIn,
            checkOut: lastCheckOut,
            totalHours: timeLog.netWorkingHours,
            overtime: timeLog.overtimeHours,
            status: attendanceStatus,
            shift: timeLog.shift
        },
        { upsert: true, new: true }
    );
};

exports.getEmployeeTimeLogs = async (req, res) => {
    try {
        let { employeeId, view, startDate, endDate } = req.query;
        let targetEmployeeId = employeeId;

        if (!targetEmployeeId) {
            const employee = await Employee.findOne({ userId: req.user.id });
            if (employee) targetEmployeeId = employee._id;
        } else {
            if (!mongoose.Types.ObjectId.isValid(targetEmployeeId)) {
                const e = await Employee.findOne({ email: targetEmployeeId });
                if (e) targetEmployeeId = e._id;
            }
        }

        const query = {};
        if (targetEmployeeId) query.employee = targetEmployeeId;

        // Default View Logic: Show only recent logs (Yesterday + Today)
        if (!startDate && !endDate && view !== 'all') {
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            query.date = { $gte: yesterday };
        } else if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const logs = await TimeLog.find(query)
            .populate('employee', 'firstName lastName')
            .populate('shift', 'shiftName shiftType startTime endTime')
            .sort({ date: -1 });
        return successResponse(res, logs);
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

exports.getAllTimeLogs = async (req, res) => {
    try {
        const { view, startDate, endDate } = req.query;
        const query = {};

        // Default View Logic: Show only recent logs (Yesterday + Today)
        if (!startDate && !endDate && view !== 'all') {
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            query.date = { $gte: yesterday };
        } else if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const logs = await TimeLog.find(query)
            .populate('employee', 'firstName lastName')
            .populate('shift', 'shiftName shiftType startTime endTime')
            .sort({ date: -1 });
        return successResponse(res, logs);
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

exports.requestRegularisation = async (req, res) => {
    try {
        const { employeeId, timeLogId, date, reason, newCheckIn, newCheckOut } = req.body;

        let targetEmployee = null;
        if (employeeId) {
            if (mongoose.Types.ObjectId.isValid(employeeId)) {
                targetEmployee = await Employee.findOne({ $or: [{ _id: employeeId }, { userId: employeeId }] });
            } else {
                targetEmployee = await Employee.findOne({ email: employeeId });
            }
        }

        if (!targetEmployee) {
            targetEmployee = await Employee.findOne({ userId: req.user.id });
        }

        if (!targetEmployee) return errorResponse(res, 'Employee not found', 404);
        const targetEmployeeId = targetEmployee._id;

        const reqDate = new Date(date);
        const startOfMonth = new Date(reqDate.getFullYear(), reqDate.getMonth(), 1);
        const endOfMonth = new Date(reqDate.getFullYear(), reqDate.getMonth() + 1, 0);

        // Check limit
        const count = await RegularisationRequest.countDocuments({
            employee: targetEmployeeId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        if (count >= 3) {
            return errorResponse(res, 'Monthly regularisation limit (3) exceeded. Admin approval required strictly.', 400);
            // Note: The requirement says "After 3 uses -> auto mark LOP". 
            // This might mean they can't regularise or it just marks LOP unless manual override?
            // "Maximum 3 regularisations allowed per month" usually means block the 4th request.
        }

        const request = new RegularisationRequest({
            employee: targetEmployeeId,
            timeLog: timeLogId,
            date: reqDate,
            newCheckIn,
            newCheckOut,
            reason,
            status: 'Pending'
        });

        await request.save();

        // Notify Admin
        const admins = await User.find({ role: 'Admin' });
        if (admins.length > 0) {
            const empName = (await Employee.findById(targetEmployeeId))?.firstName || 'Employee';
            const notes = admins.map(admin => ({
                userId: admin._id,
                title: 'New Regularisation Request',
                message: `${empName} requested attendance regularisation.`,
                type: 'info',
                link: '/admin/attendance/requests'
            }));
            await Notification.insertMany(notes);
        }

        return successResponse(res, request, 'Regularisation request submitted.');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

exports.getRegularisationRequests = async (req, res) => {
    try {
        // If admin, show all pending? If employee, show theirs.
        // Assuming this is for the Employee Panel mostly:
        let targetEmployeeId = null;
        const employee = await Employee.findOne({ userId: req.user.id });
        if (employee) targetEmployeeId = employee._id;

        const query = {};
        if (targetEmployeeId && req.user.role !== 'Admin') {
            query.employee = targetEmployeeId;
        }

        const requests = await RegularisationRequest.find(query)
            .populate('employee', 'firstName lastName')
            .sort({ createdAt: -1 });

        return successResponse(res, requests);
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

exports.updateRegularisationStatus = async (req, res) => {
    try {
        const { requestId, status, adminComment } = req.body;
        // status: 'Approved' | 'Rejected'

        const request = await RegularisationRequest.findById(requestId);
        if (!request) return errorResponse(res, 'Request not found', 404);

        request.status = status;
        request.adminComment = adminComment;
        request.actionBy = req.user.id; // User ID of admin

        if (status === 'Approved') {
            // Update the Time Log
            let timeLog = null;
            if (request.timeLog) {
                timeLog = await TimeLog.findById(request.timeLog);
            } else {
                // Try find by date
                timeLog = await TimeLog.findOne({
                    employee: request.employee,
                    date: {
                        $gte: new Date(new Date(request.date).setHours(0, 0, 0, 0)),
                        $lt: new Date(new Date(request.date).setHours(23, 59, 59, 999))
                    }
                });
            }

            if (timeLog) {
                // Determine shifts if not set? 
                // Assuming existing log, just patch sessions
                // For simplicity, we might wipe sessions and set one session with new times?
                // Or just set the FIRST checkIn and LAST checkOut?
                // "Editable check-in and check-out time" in modal implies simplified session.

                // Reset sessions
                timeLog.sessions = [{
                    checkIn: request.newCheckIn,
                    checkOut: request.newCheckOut
                }];
                // Recalculate will happen in pre-save
                await timeLog.save();
                await syncToAttendance(timeLog);
            } else {
                // Create new log if it didn't exist (e.g. absent regularisation)
                // Need active Shift logic... 
                // For now assume if log doesn't exist, we might skip or basic create.
            }
        }

        await request.save();

        // Notify Employee
        const emp = await Employee.findById(request.employee);
        if (emp && emp.userId) {
            await Notification.create({
                userId: emp.userId,
                title: `Regularisation ${status}`,
                message: `Your regularisation request for ${new Date(request.date).toLocaleDateString()} has been ${status}.`,
                type: status === 'Approved' ? 'success' : 'error',
                link: '/employee/time-tracking'
            });
        }

        return successResponse(res, request, `Request ${status}`);
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

exports.getAttendanceSummary = async (req, res) => {
    try {
        let { month, year, employeeId } = req.query;
        // Default to current month
        const now = new Date();
        if (!month) month = now.getMonth() + 1;
        if (!year) year = now.getFullYear();

        let targetEmployee = null;
        if (employeeId) {
            if (mongoose.Types.ObjectId.isValid(employeeId)) {
                targetEmployee = await Employee.findOne({ $or: [{ _id: employeeId }, { userId: employeeId }] });
            } else {
                targetEmployee = await Employee.findOne({ email: employeeId });
            }
        }

        if (!targetEmployee) {
            targetEmployee = await Employee.findOne({ userId: req.user.id });
        }

        if (!targetEmployee) return errorResponse(res, 'Employee not found', 404);
        const targetEmployeeId = targetEmployee._id;

        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const logs = await TimeLog.find({
            employee: targetEmployeeId,
            date: { $gte: start, $lte: end }
        });

        const regCount = await RegularisationRequest.countDocuments({
            employee: targetEmployeeId,
            date: { $gte: start, $lte: end },
            status: 'Approved' // Count used approvals? Or requests? "Regularisation used (x / 3)" Usually means requests made or approved.
            // Rule says "Maximum 3 regularisations allowed". Usually implies attempts.
        });

        const summary = {
            workingDays: logs.length, // Rough count
            presentDays: logs.filter(l => l.attendanceStatus === 'Present').length,
            halfDays: logs.filter(l => l.attendanceStatus === 'Half Day').length,
            leaveDays: 0, // Need LeaveRequests model for this
            lopDays: logs.filter(l => l.attendanceStatus === 'Absent' || l.attendanceStatus === 'LOP').length, // Logic needs refinement
            regularisationUsed: regCount
        };

        return successResponse(res, summary);

    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};
