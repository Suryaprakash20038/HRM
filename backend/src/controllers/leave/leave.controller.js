const Leave = require('../../models/Leave/Leave');
const Employee = require('../../models/Employee/Employee');
const User = require('../../models/User/User');
const { successResponse, errorResponse } = require('../../utils/response');
const { sendNotification, notifyAdmins } = require('../../services/notification.service');
const { sendLeaveApprovalEmail } = require('../../services/email.service');
const logger = require('../../utils/logger');

exports.applyLeave = async (req, res) => {
  try {
    const leaveData = req.body;
    const userId = req.user.id;
    leaveData.user = userId;

    // Handle file upload
    if (req.file) {
      leaveData.documentUrl = req.file.path.replace(/\\/g, '/');
    }

    // Find the employee associated with the logged-in user
    const employee = await Employee.findOne({ userId });

    if (employee) {
      leaveData.employee = employee._id;
    } else {
      logger.warn(`Employee profile not found for User ID: ${userId}. Leave request linked to User only.`);
    }

    // Calculate totalDays if not provided
    if (leaveData.startDate && leaveData.endDate) {
      const start = new Date(leaveData.startDate);
      const end = new Date(leaveData.endDate);
      const diff = end - start;
      leaveData.totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    const leave = await Leave.create(leaveData);

    // Notify Admins & HRs
    let applicantName = 'An Employee';
    if (employee) {
      applicantName = `${employee.firstName} ${employee.lastName}`;
    } else {
      const userDetails = await User.findById(userId);
      if (userDetails) applicantName = `${userDetails.firstName} ${userDetails.lastName}`;
    }

    await notifyAdmins({
      title: 'New Leave Request',
      message: `New leave request received from ${applicantName}.`,
      link: '/leave/pending'
    });

    logger.info(`Leave application created for user: ${userId}`);
    return successResponse(res, { leave }, 'Leave application submitted successfully', 201);
  } catch (error) {
    logger.error('Apply leave error:', error);
    return errorResponse(res, error.message, 500);
  }
};

exports.getLeaveRequests = async (req, res) => {
  try {
    const { employeeId, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (employeeId) {
      query.$or = [{ employee: employeeId }, { user: employeeId }];
    }
    if (status) {
      query.status = status;
    }

    const findQuery = employeeId ? { ...query, $or: [{ employee: employeeId }, { user: employeeId }] } : { ...query };
    if (!employeeId) delete findQuery.$or;

    const leaves = await Leave.find(findQuery)
      .populate('user', 'firstName lastName email profileImage')
      .populate('employee', 'firstName lastName employeeId email profileImage')
      .populate('approvalChain.teamLead.by', 'firstName lastName')
      .populate('approvalChain.manager.by', 'firstName lastName')
      .populate('approvalChain.hr.by', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean();

    // Manually populate missing employee details
    for (let leave of leaves) {
      if (!leave.employee && leave.user) {
        let employee = await Employee.findOne({ userId: leave.user._id })
          .select('firstName lastName employeeId email profileImage');
        if (!employee && leave.user.email) {
          employee = await Employee.findOne({ email: leave.user.email })
            .select('firstName lastName employeeId email profileImage');
        }
        if (employee) {
          leave.employee = employee;
        }
      }
    }

    const total = await Leave.countDocuments(findQuery);

    return successResponse(res, {
      leaves,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    }, 'Leave requests retrieved successfully');
  } catch (error) {
    logger.error('Get leave requests error:', error);
    return errorResponse(res, error.message, 500);
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return errorResponse(res, 'Leave request not found', 404);
    }

    const userId = req.user.id;
    const updateData = {};

    if (leave.currentStage === 'TeamLead') {
      updateData['approvalChain.teamLead'] = {
        status: 'Approved',
        date: new Date(),
        by: userId
      };
      updateData.currentStage = 'Manager'; // Move to Manager
    } else if (leave.currentStage === 'Manager') {
      updateData['approvalChain.manager'] = {
        status: 'Approved',
        date: new Date(),
        by: userId
      };
      // updateData.currentStage = 'HR'; // OLD: Move to HR
      // NEW: Skip HR, move directly to Completed
      updateData.currentStage = 'Completed';
      updateData.status = 'Approved';
    } else if (leave.currentStage === 'HR') {
      updateData['approvalChain.hr'] = {
        status: 'Approved',
        date: new Date(),
        by: userId
      };
      updateData.currentStage = 'Completed';
      updateData.status = 'Approved';
    } else {
      return errorResponse(res, 'Leave request is already completed or in invalid stage', 400);
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    )
      .populate('user', 'firstName lastName email')
      .populate('employee', 'firstName lastName email');

    // Notify Employee via Email
    const emailRecipient = updatedLeave.employee || updatedLeave.user;
    console.log(`[LEAVE CONTROLLER] Approval - Recipient: ${emailRecipient ? 'Yes' : 'No'}, Email: ${emailRecipient?.email}`);
    logger.info(`Attempting to notify employee. Found recipient: ${emailRecipient ? 'Yes' : 'No'}, Email: ${emailRecipient?.email}`);

    if (emailRecipient && emailRecipient.email) {
      await sendLeaveApprovalEmail(updatedLeave, emailRecipient);
    } else {
      logger.warn('Skipping email notification: No valid email recipient found for leave approval.');
    }

    // NOTIFICATIONS

    // 1. Notify the Employee
    await sendNotification({
      userId: leave.user,
      title: 'Leave Request Update',
      message: `Your leave request has been marked as ${updatedLeave.status === 'Approved' ? (updatedLeave.currentStage === 'Completed' ? 'Fully Approved' : 'Approved by ' + leave.currentStage) : updatedLeave.status}`,
      type: updatedLeave.status === 'Approved' ? 'success' : 'info',
      link: '/employee/leave'
    });

    // 2. If approved by TeamLead, notify Manager (if we can find them)
    // Assuming manager is linked to employee or we broadcast to all managers (simplistic fallback if specific manager logic isn't robust yet)
    if (leave.currentStage === 'TeamLead' && updatedLeave.currentStage === 'Manager') {
      // Ideally find specific manager. For now, we skip generic manager broadcast to avoid spam, 
      // unless we have specific manager ID from employee profile. 
      // If you want to notify specific manager, you'd need to fetch Employee -> reportingManager.
    }

    // 3. Notify HR and Admin if the request is fully approved (Manager approved)
    if (leave.currentStage === 'Manager' && updatedLeave.status === 'Approved') {
      try {
        const hrUsers = await User.find({ role: { $in: ['hr', 'admin'] } });
        const employeeName = updatedLeave.employee ? `${updatedLeave.employee.firstName} ${updatedLeave.employee.lastName}` : (updatedLeave.user ? `${updatedLeave.user.firstName} ${updatedLeave.user.lastName}` : 'Employee');

        // Send notification to each HR/Admin
        for (const user of hrUsers) {
          await sendNotification({
            userId: user._id,
            title: 'Leave Request Approved',
            message: `Leave request for ${employeeName} has been approved by Manager.`,
            type: 'info',
            link: '/leave/approved'
          });
        }
      } catch (notifError) {
        logger.error('Failed to send HR/Admin notifications:', notifError);
      }
    }

    logger.info(`Leave approved at stage ${leave.currentStage}: ${leave._id}`);
    return successResponse(res, { leave: updatedLeave }, 'Leave approved successfully');
  } catch (error) {
    logger.error('Approve leave error:', error);
    return errorResponse(res, error.message, 500);
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return errorResponse(res, 'Rejection reason is required', 400);
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return errorResponse(res, 'Leave request not found', 404);
    }

    const userId = req.user.id;
    const updateData = {
      status: 'Rejected',
      rejectionReason,
      currentStage: 'Completed'
    };

    if (leave.currentStage === 'TeamLead') {
      updateData['approvalChain.teamLead'] = {
        status: 'Rejected',
        date: new Date(),
        by: userId,
        comment: rejectionReason
      };
    } else if (leave.currentStage === 'Manager') {
      updateData['approvalChain.manager'] = {
        status: 'Rejected',
        date: new Date(),
        by: userId,
        comment: rejectionReason
      };
    } else if (leave.currentStage === 'HR') {
      updateData['approvalChain.hr'] = {
        status: 'Rejected',
        date: new Date(),
        by: userId,
        comment: rejectionReason
      };
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    )
      .populate('user', 'firstName lastName email')
      .populate('employee', 'firstName lastName email');

    // Notify Employee via Email
    const emailRecipient = updatedLeave.employee || updatedLeave.user;
    console.log(`[LEAVE CONTROLLER] Rejection - Recipient: ${emailRecipient ? 'Yes' : 'No'}, Email: ${emailRecipient?.email}`);
    logger.info(`Attempting to notify employee (Rejection). Found recipient: ${emailRecipient ? 'Yes' : 'No'}, Email: ${emailRecipient?.email}`);

    if (emailRecipient && emailRecipient.email) {
      await sendLeaveApprovalEmail(updatedLeave, emailRecipient);
    } else {
      logger.warn('Skipping rejection email: No valid email recipient found.');
    }

    // Notify Employee of Rejection
    await sendNotification({
      userId: leave.user,
      title: 'Leave Request Rejected',
      message: `Your leave request has been rejected. Reason: ${rejectionReason}`,
      type: 'error',
      link: '/employee/leave'
    });

    logger.info(`Leave rejected at stage ${leave.currentStage}: ${leave._id}`);
    return successResponse(res, { leave: updatedLeave }, 'Leave rejected successfully');
  } catch (error) {
    logger.error('Reject leave error:', error);
    return errorResponse(res, error.message, 500);
  }
};

exports.getLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const currentYear = new Date().getFullYear();
    const leaves = await Leave.find({
      employee: employeeId,
      status: 'Approved',
      startDate: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      }
    });
    const leaveBalance = {
      totalLeaves: 30,
      sickLeave: 0,
      casualLeave: 0,
      annualLeave: 0,
      otherLeave: 0
    };
    leaves.forEach(leave => {
      if (leave.leaveType === 'Sick Leave') {
        leaveBalance.sickLeave += leave.totalDays;
      } else if (leave.leaveType === 'Casual Leave') {
        leaveBalance.casualLeave += leave.totalDays;
      } else if (leave.leaveType === 'Annual Leave') {
        leaveBalance.annualLeave += leave.totalDays;
      } else {
        leaveBalance.otherLeave += leave.totalDays;
      }
    });
    leaveBalance.usedLeaves = leaveBalance.sickLeave + leaveBalance.casualLeave +
      leaveBalance.annualLeave + leaveBalance.otherLeave;
    leaveBalance.remainingLeaves = leaveBalance.totalLeaves - leaveBalance.usedLeaves;
    return successResponse(res, { leaveBalance }, 'Leave balance retrieved successfully');
  } catch (error) {
    logger.error('Get leave balance error:', error);
    return errorResponse(res, error.message, 500);
  }
};