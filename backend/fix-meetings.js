const mongoose = require('mongoose');
const Meeting = require('./src/models/Meeting/Meeting');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hrm')
    .then(async () => {
        console.log('Connected to MongoDB');

        // Update all meetings to disable lobby mode
        const result = await Meeting.updateMany(
            {},
            { $set: { 'settings.lobbyMode': false } }
        );

        console.log(`Updated ${result.modifiedCount} meetings`);
        console.log('All meetings now have lobbyMode set to false');

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
