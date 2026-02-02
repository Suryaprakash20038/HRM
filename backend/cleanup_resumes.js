const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrm_db');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const cleanupResumes = async () => {
    await connectDB();

    try {
        const Candidate = require('./src/models/Recruitment/Candidate');

        // 1. Get all valid resume filenames from DB
        const candidates = await Candidate.find({ resume: { $exists: true, $ne: null } }).select('resume');
        const validResumes = new Set(candidates.map(c => c.resume));

        console.log(`Found ${candidates.length} candidates with resumes.`);
        console.log(`Valid filenames count: ${validResumes.size}`);

        // 2. Read uploads directory
        const uploadsDir = path.join(__dirname, 'uploads', 'resumes');

        if (!fs.existsSync(uploadsDir)) {
            console.log('Uploads directory does not exist.');
            process.exit(0);
        }

        const files = fs.readdirSync(uploadsDir);
        console.log(`Scanning ${files.length} files in ${uploadsDir}...`);

        let deletedCount = 0;
        let preservedCount = 0;

        for (const file of files) {
            // Skip non-pdf/doc files if any (optional, but safer to stick to valid list)

            if (!validResumes.has(file)) {
                // FILE IS ORPHANED
                const filePath = path.join(uploadsDir, file);
                try {
                    fs.unlinkSync(filePath);
                    console.log(`Deleted Orphaned File: ${file}`);
                    deletedCount++;
                } catch (err) {
                    console.error(`Failed to delete ${file}:`, err.message);
                }
            } else {
                preservedCount++;
            }
        }

        console.log('------------------------------------------------');
        console.log(`Cleanup Complete.`);
        console.log(`Total Files Scanned: ${files.length}`);
        console.log(`Deleted: ${deletedCount}`);
        console.log(`Preserved: ${preservedCount}`);
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

cleanupResumes();
