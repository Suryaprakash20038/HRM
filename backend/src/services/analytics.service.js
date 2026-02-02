const logger = require('../utils/logger');

// Calculate analytics for dashboard
const calculateDashboardAnalytics = async (models) => {
    try {
        const { Employee, Attendance, Leave, Payroll } = models;

        const analytics = {
            employeeMetrics: await calculateEmployeeMetrics(Employee),
            attendanceMetrics: await calculateAttendanceMetrics(Attendance),
            leaveMetrics: await calculateLeaveMetrics(Leave),
            payrollMetrics: await calculatePayrollMetrics(Payroll)
        };

        return analytics;

    } catch (error) {
        logger.error('Analytics calculation error:', error);
        throw error;
    }
};

// Calculate employee metrics
const calculateEmployeeMetrics = async (Employee) => {
    const total = await Employee.countDocuments({ isActive: true });
    const byDepartment = await Employee.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    const byEmploymentType = await Employee.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$employmentType', count: { $sum: 1 } } }
    ]);

    return { total, byDepartment, byEmploymentType };
};

// Calculate attendance metrics
const calculateAttendanceMetrics = async (Attendance) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPresent = await Attendance.countDocuments({
        date: { $gte: today },
        status: 'Present'
    });

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyStats = await Attendance.aggregate([
        { $match: { date: { $gte: monthStart } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return { todayPresent, monthlyStats };
};

// Calculate leave metrics
const calculateLeaveMetrics = async (Leave) => {
    const pending = await Leave.countDocuments({ status: 'Pending' });
    const approved = await Leave.countDocuments({ status: 'Approved' });
    const rejected = await Leave.countDocuments({ status: 'Rejected' });

    const byType = await Leave.aggregate([
        { $group: { _id: '$leaveType', count: { $sum: 1 } } }
    ]);

    return { pending, approved, rejected, byType };
};

// Calculate payroll metrics
const calculatePayrollMetrics = async (Payroll) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const monthlyPayroll = await Payroll.aggregate([
        { $match: { month: currentMonth, year: currentYear } },
        {
            $group: {
                _id: null,
                totalSalary: { $sum: '$netSalary' },
                count: { $sum: 1 }
            }
        }
    ]);

    return monthlyPayroll[0] || { totalSalary: 0, count: 0 };
};

module.exports = {
    calculateDashboardAnalytics,
    calculateEmployeeMetrics,
    calculateAttendanceMetrics,
    calculateLeaveMetrics,
    calculatePayrollMetrics
};
