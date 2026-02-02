const mongoose = require('mongoose');
require('dotenv').config();
const RecruitmentSettings = require('./src/models/Recruitment/RecruitmentSettings');

const inspect = async () => {
    try {
        const uri = 'mongodb+srv://HRD:surya2003@cluster0.nguvijg.mongodb.net/?appName=Cluster0';
        await mongoose.connect(uri);
        console.log('Connected.');

        const settings = await RecruitmentSettings.findOne();
        console.log('Settings Document:', JSON.stringify(settings, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

inspect();
