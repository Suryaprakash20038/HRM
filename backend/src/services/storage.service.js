const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Upload file to local storage
const uploadFile = async (file, destination = 'uploads', customFileName = null) => {
    try {
        // 1. Resolve absolute path based on project root
        // This handles Windows/Linux paths correctly
        const uploadPath = path.resolve(process.cwd(), destination);

        // 2. Automatically create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            logger.info(`Creating missing directory: ${uploadPath}`);
            fs.mkdirSync(uploadPath, { recursive: true });
        } else {
            // Safety check: Ensure it is actually a directory
            const stats = fs.statSync(uploadPath);
            if (!stats.isDirectory()) {
                logger.warn(`Path exists but is not a directory: ${uploadPath}. Replacing with directory.`);
                fs.unlinkSync(uploadPath);
                fs.mkdirSync(uploadPath, { recursive: true });
            }
        }

        // 3. Create a safe filename
        let fileName;
        if (customFileName) {
            fileName = customFileName;
        } else {
            const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            fileName = `${Date.now()}-${safeName}`;
        }
        const filePath = path.join(uploadPath, fileName);

        // 4. Write file
        fs.writeFileSync(filePath, file.buffer);

        logger.info(`File saved locally: ${fileName}`);

        return {
            fileName,
            filePath,
            fileSize: file.size,
            mimeType: file.mimetype
        };

    } catch (error) {
        logger.error(`Storage Error (Upload): ${error.message}`, error);
        throw error;
    }
};

// Delete file from storage
const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`File deleted: ${filePath}`);
            return true;
        }
        return false;

    } catch (error) {
        logger.error('File deletion error:', error);
        throw error;
    }
};

// Get file info
const getFileInfo = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            return null;
        }

        const stats = fs.statSync(filePath);
        const fileName = path.basename(filePath);

        return {
            fileName,
            filePath,
            fileSize: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
        };

    } catch (error) {
        logger.error('Get file info error:', error);
        throw error;
    }
};

// TODO: Implement cloud storage (AWS S3, Google Cloud Storage, etc.)
const uploadToCloud = async (file) => {
    // Placeholder for cloud storage implementation
    logger.info('Cloud storage not implemented yet');
    return uploadFile(file);
};

module.exports = {
    uploadFile,
    deleteFile,
    getFileInfo,
    uploadToCloud
};
