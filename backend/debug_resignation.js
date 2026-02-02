const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config(); // Defaults to .env in current dir

const Employee = require('./src/models/Employee/Employee');

console.log('Connecting to DB...');
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected.');

        const all = await Employee.find({}, 'firstName lastName status resignationData.domainTLApprovalStatus resignationData.managerApprovalStatus domain');
        console.log(JSON.stringify(all, null, 2));

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
