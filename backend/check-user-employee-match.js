// Check User vs Employee Email Mismatch
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User/User');
const Employee = require('./src/models/Employee/Employee');

async function checkUserEmployeeMatch() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get the specific user
        const testEmail = 'muthu@gmail.com';
        const user = await User.findOne({ email: testEmail });

        if (!user) {
            console.log(`❌ No user found with email: ${testEmail}`);
        } else {
            console.log(`✅ User found:`);
            console.log(`   Name: ${user.firstName} ${user.lastName}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   User _id: ${user._id}`);
            console.log('');

            // Try to find matching employee
            const employee = await Employee.findOne({ email: testEmail });

            if (!employee) {
                console.log(`❌ No Employee record found with email: ${testEmail}`);
                console.log('');
                console.log('Checking all employees:');
                const allEmployees = await Employee.find({}).select('firstName lastName email employeeId');
                allEmployees.forEach((emp, i) => {
                    console.log(`${i + 1}. ${emp.firstName} ${emp.lastName} - ${emp.email} (${emp.employeeId})`);
                });

                // Check if there's an employee with similar name
                const similarEmployee = await Employee.findOne({
                    firstName: new RegExp(user.firstName, 'i'),
                    lastName: new RegExp(user.lastName, 'i')
                });

                if (similarEmployee) {
                    console.log('\n⚠️ Found employee with similar name but different email:');
                    console.log(`   Employee: ${similarEmployee.firstName} ${similarEmployee.lastName}`);
                    console.log(`   Employee email: ${similarEmployee.email}`);
                    console.log(`   User email: ${user.email}`);
                    console.log('\n💡 SOLUTION: Update employee email to match user email');
                    console.log(`   Run: db.employees.updateOne({_id: ObjectId("${similarEmployee._id}")}, {$set: {email: "${user.email}"}})`);
                }
            } else {
                console.log(`✅ Employee record found:`);
                console.log(`   Name: ${employee.firstName} ${employee.lastName}`);
                console.log(`   Email: ${employee.email}`);
                console.log(`   Employee ID: ${employee.employeeId}`);
                console.log(`   Employee _id: ${employee._id}`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

checkUserEmployeeMatch();
