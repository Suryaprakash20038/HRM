const mongoose = require('mongoose');
const Meeting = require('./src/models/Meeting/Meeting');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hrm')
    .then(async () => {
        console.log('Connected to MongoDB');

        // Delete all existing meetings
        const deleteResult = await Meeting.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} old meetings`);

        console.log('All old meetings have been removed. Please create a new meeting from the UI.');

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
