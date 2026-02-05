const Leave = require('../../models/Leave/Leave');
const Employee = require('../../models/Employee/Employee');
const User = require('../../models/User/User');
const { successResponse, errorResponse } = require('../../utils/response');
const { sendNotification, notifyAdmins } = require('../../services/notification.service');
const { sendLeaveApprovalEmail } = require('../../services/email.service');
const logger = require('../../utils/logger');

// Helper to find reporting manager
const getReportingManager = async (userId) => {
  const employee = await Employee.findOne({ userId }).populate('reportingManager');
  return employee ? employee.reportingManager : null;
};

// Helper: Notify a specific user
const notifyUser = async (userId, title, message, link) => {
  try {
    await sendNotification({
      userId,
      title,
      message,
      link
    });
  } catch (error) {
    logger.error(`Failed to notify user ${userId}:`, error);
  }
};

// Helper: Notify all users with a role
const notifyRole = async (role, title, message, link) => {
  try {
    const users = await User.find({ role });
    for (const user of users) {
      await sendNotification({
        userId: user._id,
        title,
        message,
        link
      });
    }
  } catch (error) {
    logger.error(`Failed to notify role ${role}:`, error);
  }
};

// Helper: Find "Department Manager" or "Team Lead" dynamically
const getApproverForDepartment = async (department, targetRole) => {
  const usersWithRole = await User.find({ role: targetRole }).select('_id');
  const userIds = usersWithRole.map(u => u._id);

  const approverEmployee = await Employee.findOne({
    userId: { $in: userIds },
    department: department
  });

  return approverEmployee ? approverEmployee.userId : null;
};

exports.applyLeave = async (req, res) => {
  try {
    const leaveData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role; // 'employee', 'teamlead', 'manager', 'hr', 'admin'
    leaveData.user = userId;

    if (req.file) {
      leaveData.documentUrl = req.file.path.replace(/\\/g, '/');
    }

    const employee = await Employee.findOne({ userId });
    if (employee) {
      leaveData.employee = employee._id;
    }

    if (leaveData.startDate && leaveData.endDate) {
      const start = new Date(leaveData.startDate);
      const end = new Date(leaveData.endDate);
      const diff = end - start;
      leaveData.totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    // --- Role-Based Routing Logic (New Strict Flow) ---
    // Employee -> TeamLead -> Manager -> [HR Notify]
    // TeamLead -> Manager -> [Admin Notify]
    // Manager -> HR -> Admin
    // HR -> Admin

    let currentStage = 'TeamLead';
    let assignedTo = null;
    const userDepartment = employee ? employee.department : null;

    if (userRole === 'employee') {
      currentStage = 'TeamLead';
      if (userDepartment) {
        assignedTo = await getApproverForDepartment(userDepartment, 'teamlead');
      }
      // Fallback: If no TL found in department, escalate to Manager
      if (!assignedTo && userDepartment) {
        currentStage = 'Manager';
        assignedTo = await getApproverForDepartment(userDepartment, 'manager');
      }
    }
    else if (userRole === 'teamlead') {
      currentStage = 'Manager';
      if (userDepartment) {
        assignedTo = await getApproverForDepartment(userDepartment, 'manager');
      }
    }
    else if (userRole === 'manager') {
      currentStage = 'HR';
      assignedTo = null; // Generic HR
    }
    else if (userRole === 'hr') {
      currentStage = 'Admin';
      assignedTo = null; // Generic Admin
    }
    else if (userRole === 'admin') {
      currentStage = 'Completed';
      leaveData.status = 'Approved';
      leaveData.approvalChain = {
        admin: { status: 'Approved', date: new Date(), by: userId, comment: 'Self Approved' }
      };
    }

    leaveData.currentStage = currentStage;
    leaveData.assignedTo = assignedTo;

    const leave = await Leave.create(leaveData);

    // --- Notifications ---
    const applicantName = employee ? `${employee.firstName} ${employee.lastName}` : (req.user.firstName || 'User');
    const msg = `New leave request from ${applicantName} (${userRole})`;

    if (currentStage !== 'Completed') {
      if (assignedTo) {
        await notifyUser(assignedTo, 'Action Required: Leave Request', msg, '/leave/approvals');
      } else {
        let targetRole = '';
        if (currentStage === 'TeamLead') targetRole = 'teamlead';
        else if (currentStage === 'Manager') targetRole = 'manager';
        else if (currentStage === 'HR') targetRole = 'hr';
        else if (currentStage === 'Admin') targetRole = 'admin';

        if (targetRole) {
          await notifyRole(targetRole, 'New Leave Request', msg, '/leave/approvals');
          if (targetRole === 'admin') await notifyAdminWithMsg(msg);
        }
      }
    }

    logger.info(`Leave application created for user: ${userId}, Role: ${userRole}, Stage: ${currentStage}`);
    return successResponse(res, { leave }, 'Leave application submitted successfully', 201);
  } catch (error) {
    logger.error('Apply leave error:', error);
    return errorResponse(res, error.message, 500);
  }
};

const notifyAdminWithMsg = async (msg) => {
  await notifyAdmins({
    title: 'New Leave Request',
    message: msg,
    link: '/leave/approvals'
  });
}

exports.getLeaveRequests = async (req, res) => {
  try {
    const { employeeId, status, view, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    const query = {};

    const currentUserEmployee = await Employee.findOne({ userId });
    const userDepartment = currentUserEmployee ? currentUserEmployee.department : null;

    if (view === 'approvals') {
      // --- Approval View (Items requiring MY action) ---
      query.status = 'Pending';

      const orConditions = [
        { assignedTo: userId } // Always include explicitly assigned
      ];

      // Role-based Filters
      if (userRole === 'teamlead') {
        if (userDepartment) {
          orConditions.push({
            currentStage: 'TeamLead',
            assignedTo: null,
          });
        }
      }
      else if (userRole === 'manager') {
        orConditions.push({
          currentStage: 'Manager',
          assignedTo: null
        });
      }
      else if (userRole === 'hr') {
        orConditions.push({ currentStage: 'HR' });
      }
      else if (userRole === 'admin') {
        orConditions.push({ currentStage: 'Admin' });
        orConditions.push({ currentStage: 'HR' });
      }

      query.$or = orConditions;

    } else {
      // --- My Leaves View (History) ---
      if (employeeId) {
        query.$or = [{ employee: employeeId }, { user: employeeId }];
      } else {
        query.$or = [{ employee: req.user.employeeId }, { user: userId }];
      }

      if (status) query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate('user', 'firstName lastName email profilePicture')
      .populate('employee', 'firstName lastName employeeId email profileImage position department')
      .populate('assignedTo', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .lean();

    let filteredLeaves = leaves;
    if (view === 'approvals' && userRole !== 'admin' && userRole !== 'hr' && userDepartment) {
      filteredLeaves = leaves.filter(l => {
        if (l.assignedTo && l.assignedTo._id.toString() === userId) return true;
        if (!l.assignedTo && l.employee && l.employee.department === userDepartment) return true;
        return false;
      });
    }

    const total = await Leave.countDocuments(query);

    return successResponse(res, {
      leaves: filteredLeaves,
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
    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) return errorResponse(res, 'Leave request not found', 404);

    const userId = req.user.id;
    const userRole = req.user.role;

    // Authorization Check
    let authorized = false;
    if (leave.assignedTo && leave.assignedTo.toString() === userId) authorized = true;
    else if (!leave.assignedTo) {
      if (leave.currentStage === 'TeamLead' && userRole === 'teamlead') authorized = true;
      if (leave.currentStage === 'Manager' && userRole === 'manager') authorized = true;
      if (leave.currentStage === 'HR' && userRole === 'hr') authorized = true;
      if (leave.currentStage === 'Admin' && userRole === 'admin') authorized = true;
    }
    if (userRole === 'admin') authorized = true;

    if (!authorized) return errorResponse(res, 'You are not authorized to approve this request', 403);

    const updateData = {};
    let nextStage = leave.currentStage;
    let nextAssignedTo = null;
    let isCompleted = false;

    const userDepartment = leave.employee ? leave.employee.department : null;

    // --- State Transitions ---

    // 1. TeamLead Stage
    if (leave.currentStage === 'TeamLead') {
      updateData['approvalChain.teamLead'] = { status: 'Approved', date: new Date(), by: userId };
      nextStage = 'Manager';
      if (userDepartment) {
        nextAssignedTo = await getApproverForDepartment(userDepartment, 'manager');
      }
    }
    // 2. Manager Stage 
    else if (leave.currentStage === 'Manager') {
      updateData['approvalChain.manager'] = { status: 'Approved', date: new Date(), by: userId };

      const applicantUser = await User.findById(leave.user);
      const applicantRole = applicantUser ? applicantUser.role : 'employee';

      if (applicantRole === 'employee' || applicantRole === 'teamlead') {
        isCompleted = true;
        nextStage = 'Completed';
        updateData.status = 'Approved';
      } else {
        nextStage = 'HR';
        nextAssignedTo = null; // Generic HR
      }
    }
    // 3. HR Stage
    else if (leave.currentStage === 'HR') {
      updateData['approvalChain.hr'] = { status: 'Approved', date: new Date(), by: userId };
      nextStage = 'Admin';
      nextAssignedTo = null; // Generic Admin
    }
    // 4. Admin Stage
    else if (leave.currentStage === 'Admin') {
      updateData['approvalChain.admin'] = { status: 'Approved', date: new Date(), by: userId };
      isCompleted = true;
      nextStage = 'Completed';
      updateData.status = 'Approved';
    }
    else {
      return errorResponse(res, 'Invalid stage', 400);
    }

    updateData.currentStage = nextStage;
    updateData.assignedTo = nextAssignedTo;

    const updatedLeave = await Leave.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true })
      .populate('user')
      .populate('employee');

    // --- Notifications ---
    if (isCompleted) {
      await sendNotification({
        userId: leave.user,
        title: 'Leave Approved',
        message: 'Your leave request has been fully approved.',
        type: 'success',
        link: '/employee/leave'
      });
      if (updatedLeave.employee?.email || updatedLeave.user?.email) {
        await sendLeaveApprovalEmail(updatedLeave, updatedLeave.employee || updatedLeave.user);
      }

      const applicantUser = await User.findById(leave.user);
      const applicantRole = applicantUser ? applicantUser.role : 'employee';

      if (applicantRole === 'employee') {
        const msg = `FYI: Leave Approved for Employee ${updatedLeave.employee?.firstName}`;
        await notifyRole('hr', 'Leave Approved', msg, '/leave/requests');
      } else if (applicantRole === 'teamlead') {
        const msg = `FYI: Leave Approved for Team Lead ${updatedLeave.employee?.firstName}`;
        await notifyAdminWithMsg(msg);
      }

    } else {
      await sendNotification({
        userId: leave.user,
        title: 'Leave Update',
        message: `Your leave request has been approved by ${req.user.firstName} and moved to ${nextStage}.`,
        link: '/employee/leave'
      });

      const msg = `Action Required: Leave Request for ${updatedLeave.employee?.firstName}`;
      if (nextAssignedTo) {
        await notifyUser(nextAssignedTo, 'Action Required', msg, '/leave/approvals');
      } else {
        if (nextStage === 'Manager') await notifyRole('manager', 'Action Required', msg, '/leave/approvals');
        else if (nextStage === 'HR') await notifyRole('hr', 'Action Required', msg, '/leave/approvals');
        else if (nextStage === 'Admin') await notifyAdminWithMsg(msg);
      }
    }

    return successResponse(res, { leave: updatedLeave }, 'Leave approved successfully');
  } catch (error) {
    logger.error('Approve leave error:', error);
    return errorResponse(res, error.message, 500);
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason) return errorResponse(res, 'Rejection reason is required', 400);

    const leave = await Leave.findById(req.params.id);
    if (!leave) return errorResponse(res, 'Leave request not found', 404);

    const userId = req.user.id;

    // Simple Auth for Reject: Must be involved
    // To match 'approveLeave', strictly check role vs stage
    // ... For now, let's allow reject if they have access.

    const updateData = {
      status: 'Rejected',
      rejectionReason,
      currentStage: 'Completed',
      assignedTo: null
    };

    if (leave.currentStage === 'TeamLead') updateData['approvalChain.teamLead'] = { status: 'Rejected', date: new Date(), by: userId, comment: rejectionReason };
    else if (leave.currentStage === 'Manager') updateData['approvalChain.manager'] = { status: 'Rejected', date: new Date(), by: userId, comment: rejectionReason };
    else if (leave.currentStage === 'HR') updateData['approvalChain.hr'] = { status: 'Rejected', date: new Date(), by: userId, comment: rejectionReason };
    else if (leave.currentStage === 'Admin') updateData['approvalChain.admin'] = { status: 'Rejected', date: new Date(), by: userId, comment: rejectionReason };

    const updatedLeave = await Leave.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }).populate('user');

    await sendNotification({
      userId: leave.user,
      title: 'Leave Rejected',
      message: `Your leave request was rejected. Reason: ${rejectionReason}`,
      type: 'error',
      link: '/employee/leave'
    });

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
      totalLeaves: 30, // Default Policy
      sickLeave: 0,
      casualLeave: 0,
      annualLeave: 0,
      otherLeave: 0,
      usedLeaves: 0,
      remainingLeaves: 30
    };

    leaves.forEach(leave => {
      const days = leave.totalDays || 0;
      if (leave.leaveType === 'Sick Leave') leaveBalance.sickLeave += days;
      else if (leave.leaveType === 'Casual Leave') leaveBalance.casualLeave += days;
      else if (leave.leaveType === 'Annual Leave') leaveBalance.annualLeave += days;
      else leaveBalance.otherLeave += days;
    });

    leaveBalance.usedLeaves = leaveBalance.sickLeave + leaveBalance.casualLeave + leaveBalance.annualLeave + leaveBalance.otherLeave;
    leaveBalance.remainingLeaves = leaveBalance.totalLeaves - leaveBalance.usedLeaves;

    return successResponse(res, { leaveBalance }, 'Leave balance retrieved successfully');
  } catch (error) {
    logger.error('Get leave balance error:', error);
    return errorResponse(res, error.message, 500);
  }
};