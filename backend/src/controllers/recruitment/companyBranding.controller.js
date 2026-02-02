const CompanyBranding = require('../../models/Recruitment/CompanyBranding');
const fs = require('fs');

/**
 * Get Company Branding Settings
 */
exports.getBranding = async (req, res) => {
    try {
        const branding = await CompanyBranding.getBranding();
        res.status(200).json({
            success: true,
            data: branding
        });
    } catch (error) {
        console.error('Error fetching branding settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch branding settings'
        });
    }
};

/**
 * Update Company Branding Settings
 */
exports.updateBranding = async (req, res) => {
    try {
        const { companyName, headerContent, footerContent } = req.body;
        let updateData = {
            updatedBy: req.user._id
        };

        if (companyName) updateData.companyName = companyName;
        if (req.body.companyAddress) updateData.companyAddress = req.body.companyAddress;
        if (headerContent) updateData.headerContent = headerContent;
        if (footerContent) updateData.footerContent = footerContent;

        // Handle File Uploads (Logo & Signature)
        // Middleware `uploadToCloudinary` updates file.path to the cloudinary URL
        if (req.files) {
            if (req.files.logo && req.files.logo.length > 0) {
                updateData.logo = {
                    url: req.files.logo[0].path
                };
            }
            if (req.files.signature && req.files.signature.length > 0) {
                updateData.signature = {
                    url: req.files.signature[0].path
                };
            }
            if (req.files.letterPad && req.files.letterPad.length > 0) {
                updateData.letterPad = {
                    url: req.files.letterPad[0].path,
                    isActive: true,
                    uploadedAt: new Date(),
                    uploadedBy: req.user._id
                };
            }
        }

        const branding = await CompanyBranding.findOneAndUpdate(
            {},
            { $set: updateData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Branding settings updated successfully',
            data: branding
        });

    } catch (error) {
        console.error('Error updating branding settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update branding settings'
        });
    }
};
