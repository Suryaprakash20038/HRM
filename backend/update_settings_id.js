const mongoose = require('mongoose');
require('dotenv').config();
const RecruitmentSettings = require('./src/models/Recruitment/RecruitmentSettings');

const rawObj = { "0": "1", "1": "m", "10": "j", "11": "y", "12": "L", "13": "9", "14": "x", "15": "I", "16": "I", "17": "P", "18": "n", "19": "w", "2": "w", "20": "k", "21": "Q", "22": "y", "23": "T", "24": "x", "25": "u", "26": "c", "27": "b", "28": "R", "29": "z", "3": "K", "30": "c", "31": "G", "32": "M", "33": "P", "34": "A", "35": "2", "36": "A", "37": "X", "38": "a", "39": "1", "4": "b", "40": "6", "41": "X", "42": "8", "43": "k", "5": "l", "6": "B", "7": "c", "8": "7", "9": "x" };

const reconstructId = () => {
    const keys = Object.keys(rawObj).map(Number).sort((a, b) => a - b);
    let id = '';
    for (const k of keys) {
        id += rawObj[k];
    }
    return id;
};

const update = async () => {
    try {
        const uri = 'mongodb+srv://HRD:surya2003@cluster0.nguvijg.mongodb.net/?appName=Cluster0';
        await mongoose.connect(uri);

        const id = reconstructId();
        console.log('Reconstructed ID:', id);

        let settings = await RecruitmentSettings.findOne();
        if (!settings) settings = new RecruitmentSettings();

        settings.googleSpreadsheetId = id;
        settings.isAutoSyncEnabled = true;
        settings.syncFrequencyMinutes = 0.5; // Ensure 30s
        await settings.save();

        console.log('✅ Settings Updated Successfully!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

update();
