const cron = require('node-cron');
const Media = require('../models/Media/Media');
const logger = require('../utils/logger');

// Auto-delete all media posts on the 1st of every month at midnight
const scheduleMediaCleanup = () => {
    // Cron expression: '0 0 1 * *' means "At 00:00 on day-of-month 1"
    cron.schedule('0 0 1 * *', async () => {
        try {
            logger.info('🗑️ Starting monthly media cleanup...');

            const result = await Media.deleteMany({});

            logger.info(`✅ Monthly media cleanup completed. Deleted ${result.deletedCount} posts.`);
        } catch (error) {
            logger.error('❌ Error during monthly media cleanup:', error);
        }
    }, {
        timezone: "Asia/Kolkata" // Set your timezone
    });

    logger.info('📅 Media cleanup cron job scheduled for 1st of every month at midnight');
};

module.exports = { scheduleMediaCleanup };
