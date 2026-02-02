const Attendance = require('../models/Attendance/Attendance');
const Holiday = require('../models/Holiday/Holiday');
const Leave = require('../models/Leave/Leave');

/**
 * Get aggregated attendance stats for an employee within a date range
 * @param {String} employeeId 
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @returns {Object} { totalDays, presentDays, absentDays, halfDays, lateDays, overtimeHours, lopDays }
 */
exports.getAttendanceSummary = async (employeeId, startDate, endDate) => {
    try {
        const attendanceRecords = await Attendance.find({
            employee: employeeId,
            date: { $gte: startDate, $lte: endDate }
        });

        // Fetch Holidays in this range
        const holidays = await Holiday.find({
            date: { $gte: startDate, $lte: endDate },
            isActive: true
        });
        const holidayDates = holidays.map(h => h.date.toISOString().split('T')[0]);

        // Fetch Approved Leaves
        // Note: Leave schema uses 'user' for some reason, but we need to check if 'employee' is populated or used differently. 
        // Based on schema, 'employee' field exists.
        const leaves = await Leave.find({
            employee: employeeId,
            status: 'Approved',
            // Simple overlap check
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        // Create a Set of leave dates
        const leaveDates = new Set();
        leaves.forEach(leave => {
            let current = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            while (current <= end) {
                if (current >= startDate && current <= endDate) {
                    leaveDates.add(current.toISOString().split('T')[0]);
                }
                current.setDate(current.getDate() + 1);
            }
        });

        // Map attendance by date string
        const attendanceMap = {};
        attendanceRecords.forEach(r => {
            const d = new Date(r.date).toISOString().split('T')[0];
            attendanceMap[d] = r;
        });

        const STANDARD_HOURS = 8;

        let presentDays = 0;
        let halfDays = 0;
        let absentDays = 0; // These are strictly unauthorized absences
        let overtimeHours = 0;
        let totalMissingHours = 0;

        // Counters for report
        let weekendCount = 0;
        let holidayCount = 0;
        let leaveCount = 0;

        // Iterate through each day of the query range
        let currentDate = new Date(startDate);
        const lastDate = new Date(endDate);

        while (currentDate <= lastDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            const isHoliday = holidayDates.includes(dateStr);
            const isLeave = leaveDates.has(dateStr);
            const record = attendanceMap[dateStr];

            // If Record Exists (Marked Attendance)
            if (record) {
                if (record.status === 'Present' || record.status === 'Late') {
                    presentDays++;
                    // Check missing hours ONLY if it's a working day (not holiday/weekend)
                    // Unless they worked on a weekend, in which case we usually don't penalize missing hours?
                    // Let's assume strict 8 hours required if they punched in.
                    const hoursWorked = record.totalHours || 0;
                    if (hoursWorked < STANDARD_HOURS) {
                        totalMissingHours += (STANDARD_HOURS - hoursWorked);
                    }
                } else if (record.status === 'Half-day') {
                    halfDays++;
                    // Half-day is 0.5 LOP regardless of weekend/holiday usually? 
                    // If they applied for half-day leave, it's authorized. 
                    // If they just worked half day without leave, it's 0.5 LOP.
                    // We assume 'Half-day' status in Attendance implies lack of full work.
                } else if (record.status === 'Absent') {
                    // Explicit absent record
                    // If it's a weekend/holiday/approved-leave, we ignore the 'Absent' label 
                    // (e.g. sometimes auto-marked absent)
                    if (!isWeekend && !isHoliday && !isLeave) {
                        absentDays++;
                    }
                }

                if (record.overtime > 0) {
                    overtimeHours += record.overtime;
                }
            } else {
                // No Record Found
                if (isWeekend) {
                    weekendCount++;
                } else if (isHoliday) {
                    holidayCount++;
                } else if (isLeave) {
                    leaveCount++;
                } else {
                    // It's a working day, no attendance, no leave => Unauthorized Absence
                    absentDays++;
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // LOP Calculation
        // LOP = Unauthorized Absent Days + (0.5 * HalfDays) + (MissingHours / 8)
        // Note: Approved Leaves are NOT LOP (they are Paid Leaves).
        // If Paid Leaves exceed quota, they should be marked 'Absent' or Unpaid Leave in Leave system.
        // Here we assume 'Approved' = Paid.

        const missingHoursPenaltyDays = totalMissingHours / STANDARD_HOURS;
        const lopDays = absentDays + (halfDays * 0.5) + missingHoursPenaltyDays;

        return {
            totalDays: new Date(endDate).getDate(),
            presentDays,
            absentDays, // Unauthorized
            halfDays,
            weekendCount,
            holidayCount,
            leaveCount,     // Approved Leaves
            overtimeHours,
            missingHours: Math.round(totalMissingHours * 100) / 100,
            lopDays: Math.round(lopDays * 100) / 100
        };
    } catch (error) {
        throw new Error(`Error calculating attendance summary: ${error.message}`);
    }
};
