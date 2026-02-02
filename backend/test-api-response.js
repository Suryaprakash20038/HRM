// Test API Response Format
require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./src/models/Employee/Employee');
const Payroll = require('./src/models/Payroll/Payroll');

async function testAPIResponse() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Simulate what the API does for admin
        console.log('📊 ADMIN API TEST - getAllPayroll:');
        console.log('─'.repeat(80));

        const month = 12;
        const year = 2025;
        const limit = 1000;
        const page = 1;

        const query = { month, year };

        const payrolls = await Payroll.find(query)
            .populate('employee', 'firstName lastName employeeId department designation profileImage email phone bankDetails')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ year: -1, month: -1 });

        const total = await Payroll.countDocuments(query);

        const adminResponse = {
            success: true,
            data: {
                payrolls,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
            },
            message: 'Payroll records retrieved successfully'
        };

        console.log('Admin Response Structure:');
        console.log(JSON.stringify({
            success: adminResponse.success,
            data: {
                payrolls: `Array(${adminResponse.data.payrolls.length})`,
                totalPages: adminResponse.data.totalPages,
                currentPage: adminResponse.data.currentPage,
                total: adminResponse.data.total
            },
            message: adminResponse.message
        }, null, 2));

        console.log(`\n✅ Found ${payrolls.length} payroll records for admin`);

        if (payrolls.length > 0) {
            console.log('\nFirst record sample:');
            const first = payrolls[0];
            console.log({
                _id: first._id,
                employee: first.employee ? {
                    firstName: first.employee.firstName,
                    lastName: first.employee.lastName,
                    employeeId: first.employee.employeeId
                } : null,
                month: first.month,
                year: first.year,
                netSalary: first.netSalary,
                paymentStatus: first.paymentStatus
            });
        }

        // Simulate what the API does for employee
        console.log('\n\n📊 EMPLOYEE API TEST - getMyPayslips:');
        console.log('─'.repeat(80));

        const testEmail = 'muthu@gmail.com';
        console.log(`Testing with email: ${testEmail}`);

        const employee = await Employee.findOne({ email: testEmail });

        if (!employee) {
            console.log('❌ Employee not found!');
        } else {
            console.log(`✅ Employee found: ${employee.firstName} ${employee.lastName}`);

            const empQuery = { employee: employee._id, year: 2025 };
            const empPayrolls = await Payroll.find(empQuery)
                .populate('employee', 'firstName lastName employeeId department designation profileImage email phone bankDetails')
                .limit(100)
                .sort({ year: -1, month: -1 });

            const empTotal = await Payroll.countDocuments(empQuery);

            const employeeResponse = {
                success: true,
                data: {
                    payrolls: empPayrolls,
                    total: empTotal,
                    employee: {
                        _id: employee._id,
                        firstName: employee.firstName,
                        lastName: employee.lastName,
                        employeeId: employee.employeeId,
                        department: employee.department
                    }
                },
                message: 'Payslips retrieved successfully'
            };

            console.log('\nEmployee Response Structure:');
            console.log(JSON.stringify({
                success: employeeResponse.success,
                data: {
                    payrolls: `Array(${employeeResponse.data.payrolls.length})`,
                    total: employeeResponse.data.total,
                    employee: employeeResponse.data.employee
                },
                message: employeeResponse.message
            }, null, 2));

            console.log(`\n✅ Found ${empPayrolls.length} payroll records for employee`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

testAPIResponse();
