const Employee = require('../models/Employee/Employee');

const generateEmployeeId = async () => {
    try {
        // Find the last employee created to get the latest ID
        // Sorting by createdAt ensures we get the most recent one
        const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });

        if (!lastEmployee || !lastEmployee.employeeId) {
            return 'EMP0001';
        }

        // Extract number from EMPxxxx format
        // Supports formats like EMP0001, EMP-0001, etc. if existing data varies,
        // but we will generate EMPxxxx by default.
        const lastId = lastEmployee.employeeId;

        // Match numbers at the end of the string
        const match = lastId.match(/(\d+)$/);

        if (match) {
            let number = parseInt(match[1], 10);
            number++;
            // Pad to 4 digits or keep existing length if longer
            const outputLength = Math.max(4, match[1].length);
            return `EMP${String(number).padStart(outputLength, '0')}`;
        }

        // Fallback if no digits found in last ID
        const count = await Employee.countDocuments();
        return `EMP${String(count + 1).padStart(4, '0')}`;

    } catch (error) {
        console.error('Error generating Employee ID:', error);
        // Fallback to timestamp based ID in worst case to avoid duplicates
        return `EMP${Date.now().toString().slice(-6)}`;
    }
};

module.exports = { generateEmployeeId };
