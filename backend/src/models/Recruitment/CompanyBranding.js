const mongoose = require('mongoose');

const companyBrandingSchema = new mongoose.Schema({
    companyName: {
        type: String,
        default: 'My Company'
    },
    companyAddress: {
        type: String,
        default: ''
    },
    logo: {
        url: String,
        publicId: String
    },
    signature: {
        url: String, // Authorized HR Signature
        publicId: String
    },

    // Letter Pad Design (Background Image)
    letterPad: {
        url: String, // Full letter pad design image
        publicId: String,
        isActive: {
            type: Boolean,
            default: true // Enable/disable letter pad overlay
        },
        uploadedAt: Date,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },

    // Layout Positioning for Content Overlay
    layoutSettings: {
        // Content area margins (to avoid overlapping header/footer)
        contentMargin: {
            top: { type: Number, default: 150 }, // px from top
            bottom: { type: Number, default: 120 }, // px from bottom
            left: { type: Number, default: 60 }, // px from left
            right: { type: Number, default: 60 } // px from right
        },
        // Page dimensions
        pageSize: {
            width: { type: Number, default: 595 }, // A4 width in points (210mm)
            height: { type: Number, default: 842 } // A4 height in points (297mm)
        },
        // Safe content area (calculated automatically)
        safeArea: {
            x: { type: Number, default: 60 },
            y: { type: Number, default: 150 },
            width: { type: Number, default: 475 },
            height: { type: Number, default: 572 }
        }
    },

    // Legacy fields (kept for backward compatibility)
    headerContent: {
        type: String, // HTML content for letter header (used when letterPad is disabled)
        default: '<div style="text-align: center;"><h1>{{company_name}}</h1></div>'
    },
    footerContent: {
        type: String, // HTML content for letter footer (used when letterPad is disabled)
        default: '<div style="text-align: center;"><p>{{company_address}}</p></div>'
    },

    isActive: {
        type: Boolean,
        default: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Ensure only one document exists
companyBrandingSchema.statics.getBranding = async function () {
    let branding = await this.findOne();
    if (!branding) {
        branding = await this.create({});
    }
    return branding;
};

// Method to update safe area based on margins
companyBrandingSchema.methods.calculateSafeArea = function () {
    const { top, bottom, left, right } = this.layoutSettings.contentMargin;
    const { width, height } = this.layoutSettings.pageSize;

    this.layoutSettings.safeArea = {
        x: left,
        y: top,
        width: width - left - right,
        height: height - top - bottom
    };
};

// Pre-save hook to calculate safe area
companyBrandingSchema.pre('save', function (next) {
    if (this.isModified('layoutSettings.contentMargin') || this.isModified('layoutSettings.pageSize')) {
        this.calculateSafeArea();
    }
    next();
});

module.exports = mongoose.model('CompanyBranding', companyBrandingSchema);
