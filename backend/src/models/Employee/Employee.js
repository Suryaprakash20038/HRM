const mongoose = require('mongoose');
// Ensure Status model is registered
require('../Status/Status');

const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        default: 'India'
    },
    zipCode: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: [true, 'Department is required']
    },
    position: {
        type: String,
        required: [true, 'Position is required']
    },
    domain: {
        type: String,
        default: ''
    },
    joiningDate: {
        type: Date,
        required: [true, 'Joining date is required'],
        default: Date.now
    },
    employmentType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
        default: 'Full-time'
    },
    workLocation: {
        type: String,
        required: true
    },
    basicSalary: {
        type: Number,
        required: [true, 'Basic salary is required']
    },
    allowances: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    emergencyContactName: {
        type: String,
        required: true
    },
    emergencyContactPhone: {
        type: String,
        required: true
    },
    emergencyContactRelation: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: ''
    },
    resume: {
        type: String,
        default: ''
    },
    documents: {
        tenthMarksheet: { type: String, default: '' },
        twelfthMarksheet: { type: String, default: '' },
        degreeCertificate: { type: String, default: '' },
        consolidatedMarksheet: { type: String, default: '' },
        provisionalCertificate: { type: String, default: '' },
        aadharCard: { type: String, default: '' },
        panCard: { type: String, default: '' },
        resume: { type: String, default: '' }
    },
    employeeLetters: [{
        name: { type: String, required: true },
        type: { type: String, required: true }, // Filterable: 'Experience', 'Relieving', etc.
        url: { type: String, required: true },
        generatedAt: { type: Date, default: Date.now }
    }],
    bankDetails: {
        accountNumber: { type: String, default: '' },
        accountHolderName: { type: String, default: '' },
        ifscCode: { type: String, default: '' },
        branchName: { type: String, default: '' }
    },
    resignationData: {
        reason: { type: String, default: '' },
        requestedLWD: { type: Date },
        comments: { type: String, default: '' },
        attachmentUrl: { type: String, default: '' },
        resignationDate: { type: Date },
        noticeDays: { type: Number },
        finalLWD: { type: Date },
        daysRemaining: { type: Number },
        exitInterviewDone: { type: Boolean, default: false },
        rejectionReason: { type: String, default: '' },
        hrComments: { type: String, default: '' },
        domainTLApprovalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Not Required'], default: 'Pending' },
        domainTLActionDate: { type: Date },
        domainTLComments: { type: String, default: '' },
        managerApprovalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Not Required'], default: 'Pending' },
        managerActionDate: { type: Date },
        exitClearance: {
            assetsReturned: { type: Boolean, default: false },
            financeCleared: { type: Boolean, default: false },
            itCleared: { type: Boolean, default: false },
            adminCleared: { type: Boolean, default: false }
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['Probation', 'Confirmed', 'Resignation Submitted', 'Notice Period', 'Exit Process', 'Relieved', 'Terminated', 'Intern'],
        default: 'Probation'
    },
    shift: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift'
    }
}, {
    timestamps: true
});

// Middleware to track status changes
employeeSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this._statusChanged = true;
    }
    next();
});

employeeSchema.post('save', async function (doc) {
    if (doc._statusChanged) {
        try {
            const Status = mongoose.model('Status');
            await Status.create({
                employee: doc._id,
                email: doc.email,
                status: doc.status,
                reason: doc.resignationData ? (doc.resignationData.reason || doc.resignationData.rejectionReason) : '',
                changedAt: new Date()
            });
        } catch (error) {
            console.error('Error logging status change:', error);
        }
    }
});

employeeSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

employeeSchema.virtual('positionWithDomain').get(function () {
    return this.domain ? `${this.position} (${this.domain})` : this.position;
});

employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema);
