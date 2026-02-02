const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Get file extension
const getFileExtension = (filename) => {
    return path.extname(filename).toLowerCase();
};

// Get file name without extension
const getFileNameWithoutExtension = (filename) => {
    return path.basename(filename, path.extname(filename));
};

// Check if file exists
const fileExists = (filePath) => {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        logger.error('File exists check error:', error);
        return false;
    }
};

// Get file size in bytes
const getFileSize = (filePath) => {
    try {
        if (!fileExists(filePath)) {
            return 0;
        }
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch (error) {
        logger.error('Get file size error:', error);
        return 0;
    }
};

// Format file size to human readable
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Validate file type
const isValidFileType = (filename, allowedTypes) => {
    const ext = getFileExtension(filename);
    return allowedTypes.includes(ext);
};

// Validate image file
const isImageFile = (filename) => {
    const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return isValidFileType(filename, imageTypes);
};

// Validate document file
const isDocumentFile = (filename) => {
    const docTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
    return isValidFileType(filename, docTypes);
};

// Create directory if not exists
const ensureDirectoryExists = (dirPath) => {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            logger.info(`Directory created: ${dirPath}`);
        }
        return true;
    } catch (error) {
        logger.error('Create directory error:', error);
        return false;
    }
};

// Delete file
const deleteFile = (filePath) => {
    try {
        if (fileExists(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`File deleted: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        logger.error('Delete file error:', error);
        return false;
    }
};

// Copy file
const copyFile = (sourcePath, destinationPath) => {
    try {
        fs.copyFileSync(sourcePath, destinationPath);
        logger.info(`File copied from ${sourcePath} to ${destinationPath}`);
        return true;
    } catch (error) {
        logger.error('Copy file error:', error);
        return false;
    }
};

// Move file
const moveFile = (sourcePath, destinationPath) => {
    try {
        fs.renameSync(sourcePath, destinationPath);
        logger.info(`File moved from ${sourcePath} to ${destinationPath}`);
        return true;
    } catch (error) {
        logger.error('Move file error:', error);
        return false;
    }
};

// Read file content
const readFileContent = (filePath) => {
    try {
        if (!fileExists(filePath)) {
            return null;
        }
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        logger.error('Read file error:', error);
        return null;
    }
};

// Write file content
const writeFileContent = (filePath, content) => {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        logger.info(`File written: ${filePath}`);
        return true;
    } catch (error) {
        logger.error('Write file error:', error);
        return false;
    }
};

// Get files in directory
const getFilesInDirectory = (dirPath) => {
    try {
        if (!fs.existsSync(dirPath)) {
            return [];
        }
        return fs.readdirSync(dirPath);
    } catch (error) {
        logger.error('Get files in directory error:', error);
        return [];
    }
};

// Generate unique filename
const generateUniqueFilename = (originalFilename) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const ext = getFileExtension(originalFilename);
    const nameWithoutExt = getFileNameWithoutExtension(originalFilename);
    return `${nameWithoutExt}-${timestamp}-${random}${ext}`;
};

// Sanitize filename (remove special characters)
const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

module.exports = {
    getFileExtension,
    getFileNameWithoutExtension,
    fileExists,
    getFileSize,
    formatFileSize,
    isValidFileType,
    isImageFile,
    isDocumentFile,
    ensureDirectoryExists,
    deleteFile,
    copyFile,
    moveFile,
    readFileContent,
    writeFileContent,
    getFilesInDirectory,
    generateUniqueFilename,
    sanitizeFilename
};
