const Ticket = require('../../models/Ticket/ticket.model');
const Employee = require('../../models/Employee/Employee');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');

// Helper to generate Ticket ID
const generateTicketId = async () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Ticket.countDocuments({
        createdAt: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
        }
    });
    return `TKT-${dateStr}-${String(count + 1).padStart(3, '0')}`;
};

exports.createTicket = async (req, res) => {
    try {
        const {
            category,
            title,
            description,
            priority,
            relatedProject,
            mentionedEmployees
        } = req.body;

        // Get Employee ID from User
        let employee = await Employee.findOne({ userId: req.user.id });
        if (!employee) {
            return errorResponse(res, 'Employee profile not found', 404);
        }

        const ticketId = await generateTicketId();

        let attachmentPath = null;
        if (req.file) {
            attachmentPath = req.file.path;
        }

        // Parse mentionedEmployees if it's sent as a JSON string (common with FormData)
        let mentioned = [];
        if (mentionedEmployees) {
            try {
                mentioned = typeof mentionedEmployees === 'string' ? JSON.parse(mentionedEmployees) : mentionedEmployees;
            } catch (e) {
                mentioned = [mentionedEmployees];
            }
        }

        const newTicket = await Ticket.create({
            ticketId,
            employeeId: employee._id,
            category,
            title,
            description,
            priority,
            attachment: attachmentPath,
            relatedProject: relatedProject || null,
            mentionedEmployees: mentioned,
            status: 'Open'
        });

        return successResponse(res, { ticket: newTicket }, 'Ticket raised successfully', 201);
    } catch (error) {
        logger.error('Create ticket error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getEmployeeTickets = async (req, res) => {
    try {
        let employee = await Employee.findOne({ userId: req.user.id });
        if (!employee) {
            return errorResponse(res, 'Employee profile not found', 404);
        }

        // Find tickets where employee is creator OR mentioned
        const tickets = await Ticket.find({
            $or: [
                { employeeId: employee._id },
                { mentionedEmployees: employee._id }
            ]
        })
            .populate('relatedProject', 'projectName')
            .populate('assignedTo', 'firstName lastName')
            .sort({ createdAt: -1 });

        return successResponse(res, { tickets }, 'Tickets retrieved successfully');
    } catch (error) {
        logger.error('Get employee tickets error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getTicketDetails = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('employeeId', 'firstName lastName employeeId profileImage department')
            .populate('mentionedEmployees', 'firstName lastName employeeId profileImage')
            .populate('relatedProject', 'projectName')
            .populate('conversations.sender', 'firstName lastName role profileImage') // Might need adjustment based on User model
            .populate('assignedTo', 'firstName lastName');

        if (!ticket) {
            return errorResponse(res, 'Ticket not found', 404);
        }

        // Check Access: Creator or Mentioned
        // Note: Real-world app would also allow Admin/Manager access here
        const employee = await Employee.findOne({ userId: req.user.id });
        // Handling for admin/manager who might not have an Employee profile linked directly or checking purely by role

        let hasAccess = false;

        if (['admin', 'hr', 'manager'].includes(req.user.role)) {
            hasAccess = true;
        } else if (employee) {
            hasAccess =
                ticket.employeeId._id.toString() === employee._id.toString() ||
                ticket.mentionedEmployees.some(emp => emp._id.toString() === employee._id.toString());
        }

        if (!hasAccess) {
            return errorResponse(res, 'Unauthorized access to ticket', 403);
        }

        return successResponse(res, { ticket }, 'Ticket details retrieved successfully');
    } catch (error) {
        logger.error('Get ticket details error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.addTicketReply = async (req, res) => {
    try {
        const { message } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return errorResponse(res, 'Ticket not found', 404);
        }

        if (ticket.status === 'Closed') {
            return errorResponse(res, 'Cannot reply to a closed ticket', 400);
        }

        let attachmentPath = null;
        if (req.file) {
            attachmentPath = req.file.path;
        }

        const reply = {
            sender: req.user.id,
            senderType: req.user.role === 'employee' ? 'Employee' : 'Admin', // Simplified
            message,
            attachment: attachmentPath,
            createdAt: new Date()
        };

        ticket.conversations.push(reply);

        // Auto-status update? Maybe not.

        await ticket.save();

        return successResponse(res, { ticket }, 'Reply added successfully');
    } catch (error) {
        logger.error('Add ticket reply error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getDepartmentColleagues = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user.id });
        if (!employee) {
            return errorResponse(res, 'Employee not found', 404);
        }

        const colleagues = await Employee.find({
            department: employee.department,
            _id: { $ne: employee._id }, // Exclude self
            isActive: true
        }).select('firstName lastName employeeId position profileImage');

        return successResponse(res, { colleagues }, 'Colleagues retrieved successfully');
    } catch (error) {
        logger.error('Get colleagues error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('employeeId', 'firstName lastName employeeId profileImage department')
            .populate('relatedProject', 'projectName')
            .populate('assignedTo', 'firstName lastName')
            .sort({ createdAt: -1 });

        return successResponse(res, { tickets }, 'All tickets retrieved successfully');
    } catch (error) {
        logger.error('Get all tickets error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const { status, priority, assignedTo } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return errorResponse(res, 'Ticket not found', 404);
        }

        if (status) ticket.status = status;
        if (priority) ticket.priority = priority;
        if (assignedTo) ticket.assignedTo = assignedTo;

        await ticket.save();

        return successResponse(res, { ticket }, 'Ticket updated successfully');
    } catch (error) {
        logger.error('Update ticket status error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return errorResponse(res, 'Ticket not found', 404);
        }

        await Ticket.findByIdAndDelete(req.params.id);

        return successResponse(res, null, 'Ticket deleted successfully');
    } catch (error) {
        logger.error('Delete ticket error:', error);
        return errorResponse(res, error.message, 500);
    }
};
