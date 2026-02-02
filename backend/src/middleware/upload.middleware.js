const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dzkkyw2hg',
    api_key: '689497529599583',
    api_secret: 'ODT85za1wBxWHQVud95tNNFYAEo'
});

console.log('Cloudinary Configured:', {
    cloud_name: 'dzkkyw2hg',
    api_key: '***' + '689497529599583'.slice(-4)
});

// Configure local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Get email from body
        const email = req.body.email ? req.body.email.replace(/@/g, '_at_').replace(/\./g, '_dot_') : 'general';
        const uploadPath = path.join('uploads', 'documents', email);

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    },
    fileFilter: (req, file, cb) => {
        // Basic file type validation
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|zip|rar/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, PDFs, Word docs, and Zip/Rar files are allowed.'), false);
        }
    }
});

// Middleware to also upload to Cloudinary after local upload
const uploadToCloudinary = async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next();
    }

    try {
        const email = req.body.email ? req.body.email.replace(/@/g, '_at_').replace(/\./g, '_dot_') : 'general';

        // Upload each file to Cloudinary
        for (const fieldName in req.files) {
            const filesArray = req.files[fieldName];

            for (const file of filesArray) {
                try {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: `hrm_documents/${email}`,
                        resource_type: 'auto',
                        type: 'upload', // Explicitly public
                        access_mode: 'public'
                    });

                    // Update the file path in the request object to use the Cloudinary URL
                    file.path = result.secure_url;

                    console.log(`✅ Uploaded to Cloudinary: ${fieldName}`, result.secure_url);
                } catch (cloudinaryError) {
                    console.error(`⚠️ Cloudinary upload failed for ${fieldName}:`, cloudinaryError.message);
                    // Continue even if Cloudinary fails - we still have local copy
                }
            }
        }

        next();
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        // Don't fail the request if Cloudinary fails
        next();
    }
};

module.exports = { upload, uploadToCloudinary };
