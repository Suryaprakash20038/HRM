const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    // BASIC FIELDS
    taskTitle: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    taskType: {
        type: String,
        enum: ['Feature', 'Bug', 'Improvement', 'Research', 'Meeting', 'Admin', 'Testing', 'Documentation', 'Other'],
        default: 'Feature'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Review', 'Completed', 'Cancelled'],
        default: 'To Do'
    },

    // ASSIGNMENT FIELDS
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Assigned by is required']
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Assigned to is required']
    },
    department: {
        type: String,
        required: [true, 'Department is required']
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }],

    // DATE & TIME FIELDS
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    estimatedHours: {
        type: Number,
        default: 0,
        min: 0
    },
    actualHours: {
        type: Number,
        default: 0,
        min: 0
    },
    timeLogs: [{
        startTime: {
            type: Date,
            required: true
        },
        endTime: {
            type: Date
        },
        duration: {
            type: Number, // in minutes
            default: 0
        },
        loggedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        },
        description: {
            type: String,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // PROJECT RELATION
    relatedProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    isStandaloneTask: {
        type: Boolean,
        default: true
    },

    // ATTACHMENTS
    attachments: [{
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
            type: Number // in bytes
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // PROGRESS
    progressPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    // EMPLOYEE PANEL FIELDS
    taskResult: {
        type: String,
        enum: ['Pending', 'Success', 'Failed', 'Reassigned', 'Delayed'],
        default: 'Pending'
    },
    delayReason: {
        type: String,
        trim: true
    },
    employeeNotes: {
        type: String,
        trim: true
    },
    selfProgressUpdates: [{
        comment: {
            type: String,
            required: true
        },
        progress: {
            type: Number,
            min: 0,
            max: 100
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // SUBTASKS
    subtasks: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Date
        },
        completedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        }
    }],

    // COMMENTS & ACTIVITY
    comments: [{
        comment: {
            type: String,
            required: true
        },
        commentedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true
        },
        commentedAt: {
            type: Date,
            default: Date.now
        }
    }],

    activityLog: [{
        action: {
            type: String,
            required: true
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        performedAt: {
            type: Date,
            default: Date.now
        },
        details: {
            type: String
        }
    }],

    // SYSTEM FIELDS
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Virtual field for overdue status
taskSchema.virtual('isOverdue').get(function () {
    if (this.status === 'Completed' || this.status === 'Cancelled') {
        return false;
    }
    return new Date() > new Date(this.dueDate);
});

// Virtual field for delay duration in days
taskSchema.virtual('delayDuration').get(function () {
    if (!this.isOverdue) {
        return 0;
    }
    const now = new Date();
    const due = new Date(this.dueDate);
    const diffTime = Math.abs(now - due);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Virtual field for completion percentage based on subtasks
taskSchema.virtual('subtaskProgress').get(function () {
    if (!this.subtasks || this.subtasks.length === 0) {
        return null;
    }
    const completed = this.subtasks.filter(st => st.isCompleted).length;
    return Math.round((completed / this.subtasks.length) * 100);
});

// Pre-save middleware to validate assignment
taskSchema.pre('save', async function (next) {
    if (this.isModified('assignedTo') || this.isModified('department')) {
        const Employee = mongoose.model('Employee');
        const assignedEmployee = await Employee.findById(this.assignedTo);

        if (assignedEmployee && assignedEmployee.department !== this.department) {
            return next(new Error('Cannot assign task to employee outside selected department'));
        }
    }

    // Auto-set isStandaloneTask based on relatedProject
    if (this.relatedProject) {
        this.isStandaloneTask = false;
    } else {
        this.isStandaloneTask = true;
    }

    // Auto-update taskResult to Delayed if overdue
    if (this.isOverdue && this.status !== 'Completed' && this.status !== 'Cancelled') {
        if (this.taskResult === 'Pending') {
            this.taskResult = 'Delayed';
        }
    }

    next();
});

// Enable virtuals in JSON
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

// Indexes for better query performance
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ department: 1, status: 1 });
taskSchema.index({ priority: 1, dueDate: 1 });
taskSchema.index({ relatedProject: 1 });
taskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
