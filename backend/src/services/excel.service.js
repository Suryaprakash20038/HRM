const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Generate attendance report Excel
const generateAttendanceReport = async (attendanceData) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance Report');

        // Define columns
        worksheet.columns = [
            { header: 'Employee ID', key: 'employeeId', width: 15 },
            { header: 'Employee Name', key: 'employeeName', width: 25 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Check In', key: 'checkIn', width: 15 },
            { header: 'Check Out', key: 'checkOut', width: 15 },
            { header: 'Total Hours', key: 'totalHours', width: 12 },
            { header: 'Status', key: 'status', width: 12 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };

        // Add data
        attendanceData.forEach(record => {
            worksheet.addRow({
                employeeId: record.employee?.employeeId || 'N/A',
                employeeName: record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : 'N/A',
                date: record.date.toDateString(),
                checkIn: record.checkIn ? record.checkIn.toLocaleTimeString() : 'N/A',
                checkOut: record.checkOut ? record.checkOut.toLocaleTimeString() : 'N/A',
                totalHours: record.totalHours || 0,
                status: record.status
            });
        });

        // Save file
        const fileName = `attendance-report-${Date.now()}.xlsx`;
        const filePath = path.join(__dirname, '../../uploads/reports', fileName);

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await workbook.xlsx.writeFile(filePath);
        logger.info(`Attendance report generated: ${fileName}`);

        return filePath;

    } catch (error) {
        logger.error('Excel generation error:', error);
        throw error;
    }
};

// Generate employee list Excel
const generateEmployeeList = async (employees) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Employee List');

        worksheet.columns = [
            { header: 'Employee ID', key: 'employeeId', width: 15 },
            { header: 'First Name', key: 'firstName', width: 20 },
            { header: 'Last Name', key: 'lastName', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Department', key: 'department', width: 20 },
            { header: 'Position', key: 'position', width: 20 },
            { header: 'Joining Date', key: 'joiningDate', width: 15 },
            { header: 'Salary', key: 'salary', width: 12 },
            { header: 'Status', key: 'status', width: 10 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF70AD47' }
        };

        employees.forEach(employee => {
            worksheet.addRow({
                employeeId: employee.employeeId,
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                phone: employee.phone,
                department: employee.department,
                position: employee.position,
                joiningDate: employee.joiningDate.toDateString(),
                salary: employee.basicSalary,
                status: employee.isActive ? 'Active' : 'Inactive'
            });
        });

        const fileName = `employee-list-${Date.now()}.xlsx`;
        const filePath = path.join(__dirname, '../../uploads/reports', fileName);

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await workbook.xlsx.writeFile(filePath);
        logger.info(`Employee list generated: ${fileName}`);

        return filePath;

    } catch (error) {
        logger.error('Excel generation error:', error);
        throw error;
    }
};

// Generate payroll report Excel
const generatePayrollReport = async (payrollData) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Payroll Report');

        worksheet.columns = [
            { header: 'Employee ID', key: 'employeeId', width: 15 },
            { header: 'Employee Name', key: 'employeeName', width: 25 },
            { header: 'Month', key: 'month', width: 10 },
            { header: 'Year', key: 'year', width: 10 },
            { header: 'Basic Salary', key: 'basicSalary', width: 15 },
            { header: 'Allowances', key: 'allowances', width: 12 },
            { header: 'Deductions', key: 'deductions', width: 12 },
            { header: 'Bonus', key: 'bonus', width: 12 },
            { header: 'Tax', key: 'tax', width: 12 },
            { header: 'Net Salary', key: 'netSalary', width: 15 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC000' }
        };

        payrollData.forEach(record => {
            worksheet.addRow({
                employeeId: record.employee?.employeeId || 'N/A',
                employeeName: record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : 'N/A',
                month: record.month,
                year: record.year,
                basicSalary: record.basicSalary,
                allowances: record.allowances,
                deductions: record.deductions,
                bonus: record.bonus,
                tax: record.tax,
                netSalary: record.netSalary
            });
        });

        const fileName = `payroll-report-${Date.now()}.xlsx`;
        const filePath = path.join(__dirname, '../../uploads/reports', fileName);

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await workbook.xlsx.writeFile(filePath);
        logger.info(`Payroll report generated: ${fileName}`);

        return filePath;

    } catch (error) {
        logger.error('Excel generation error:', error);
        throw error;
    }
};

module.exports = {
    generateAttendanceReport,
    generateEmployeeList,
    generatePayrollReport
};
