const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    module: {
        type: mongoose.Schema.Types.ObjectId
        // specific module ID from the project
    },
    requirement: {
        type: mongoose.Schema.Types.ObjectId,
        // Links to an item in project.requirements
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true // The Team Lead
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }],
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'In Review', 'Completed', 'On Hold'],
        default: 'To Do'
    },
    startDate: {
        type: Date
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
