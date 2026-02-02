const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dzkkyw2hg',
    api_key: '689497529599583',
    api_secret: 'ODT85za1wBxWHQVud95tNNFYAEo'
});

async function testUpload() {
    try {
        console.log('Testing Cloudinary Upload...');

        // Create a dummy file
        const filePath = path.join(__dirname, 'test-upload.txt');
        fs.writeFileSync(filePath, 'This is a test file for Cloudinary upload.');

        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'hrm_documents',
            resource_type: 'auto'
        });

        console.log('Upload Successful!');
        console.log('Public ID:', result.public_id);
        console.log('URL:', result.secure_url);
        console.log('Folder:', result.folder); // Note: result.folder might not be directly available in all response versions, but public_id usually contains it.

        // Clean up
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Upload Failed:', error);
    }
}

testUpload();
