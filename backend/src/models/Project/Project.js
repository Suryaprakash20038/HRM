const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    projectCode: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true
    },
    client: {
        type: {
            type: String,
            enum: ['Internal', 'Client'],
            default: 'Internal'
        },
        name: { type: String, trim: true },
        company: { type: String, trim: true },
        email: { type: String, trim: true },
        contact: { type: String, trim: true }
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    adminInstructions: {
        type: String,
        trim: true
    },
    visibility: {
        type: String,
        enum: ['Manager', 'Employees'],
        default: 'Employees'
    },
    files: [{
        fileName: { type: String },
        fileUrl: { type: String },
        fileType: { type: String },
        fileSize: { type: Number },
        uploadedAt: { type: Date, default: Date.now }
    }],
    department: {
        type: String,
        required: [true, 'Department is required']
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Manager is required']
    },
    teamLead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    teamMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }],
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required']
    },
    status: {
        type: String,
        enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],
        default: 'Planning'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    requirements: [{
        title: { type: String, required: true },
        description: { type: String },
        requirementType: {
            type: String,
            enum: ['Functional', 'Non-Functional', 'Technical'],
            default: 'Functional'
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium'
        },
        attachments: [{
            fileName: String,
            fileUrl: String,
            uploadedAt: { type: Date, default: Date.now }
        }],
        createdAt: { type: Date, default: Date.now }
    }],
    modules: [{
        moduleName: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        moduleUrl: {
            type: String
        },
        teamLead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed', 'On Hold'],
            default: 'Pending'
        },
        dueDate: {
            type: Date
        },
        files: [{
            fileName: {
                type: String,
                required: true
            },
            fileUrl: {
                type: String,
                required: true
            },
            fileType: {
                type: String
            },
            fileSize: {
                type: Number
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            },
            uploadedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    statusHistory: [{
        status: {
            type: String
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        comment: {
            type: String
        }
    }],
    progressHistory: [{
        progress: {
            type: Number
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        comment: {
            type: String
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
