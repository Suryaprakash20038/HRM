const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Can be Employee(User) or Admin
        required: true
    },
    senderType: {
        type: String,
        enum: ['Employee', 'Admin', 'Manager'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    attachment: {
        type: String // URL/Path to file
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    attachment: {
        type: String // Initial attachment
    },
    relatedProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    mentionedEmployees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }],
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Waiting', 'Resolved', 'Closed'],
        default: 'Open'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin or Support Staff
    },
    conversations: [conversationSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);
