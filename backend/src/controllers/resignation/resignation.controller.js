const Employee = require('../../models/Employee/Employee');
const User = require('../../models/User/User');
const Notification = require('../../models/Notification/Notification'); // Import Notification
const logger = require('../../utils/logger');
const emailService = require('../../services/email.service');
const path = require('path');
const fs = require('fs');

/**
 * Submit Resignation
 * Endpoint: POST /api/resignation/submit
 */
exports.submitResignation = async (req, res) => {
    try {
        const { reason, comments } = req.body;
        // User is attached by authMiddleware. We need to find the Employee profile associated with this user.
        // Or if the user IS the employee (depends on auth). Assuming req.user.id is userId.

        let employee;

        // 1. Try finding by employeeId from token
        if (req.user.employeeId) {
            employee = await Employee.findById(req.user.employeeId);
        }

        // 2. If not found, try finding by userId
        if (!employee) {
            employee = await Employee.findOne({ userId: req.user.id });
        }

        // 3. Fallback: Try finding by email
        if (!employee) {
            const user = await User.findById(req.user.id);
            if (user && user.email) {
                employee = await Employee.findOne({ email: user.email });
            }
        }

        if (!employee) {
            return res.status(404).json({ status: 'error', message: 'Employee profile not found. Please contact HR to link your account.' });
        }

        if (employee.status === 'Resignation Submitted' || employee.status === 'Notice Period' || employee.status === 'Relieved') {
            return res.status(400).json({ status: 'error', message: 'Resignation already submitted or processed.' });
        }

        // Handle file upload
        let attachmentUrl = '';
        if (req.file) {
            // Assuming local upload, construct URL. The static serve is at /uploads
            attachmentUrl = `/uploads/${req.file.filename}`;
        }

        if (req.user.role === 'manager') {
            // Manager Resignation: Direct to Admin (HR)
            employee.resignationData = {
                reason,
                comments,
                attachmentUrl,
                resignationDate: new Date(),
                domainTLApprovalStatus: 'Not Required',
                managerApprovalStatus: 'Not Required' // Goes to HR list directly
            };
        } else if (req.user.role === 'teamlead') {
            // TL Resignation: Skip TL step, Go to Manager
            employee.resignationData = {
                reason,
                comments,
                attachmentUrl,
                resignationDate: new Date(),
                domainTLApprovalStatus: 'Not Required',
                managerApprovalStatus: 'Pending'
            };
        } else {
            // Standard Employee: Needs TL and Manager approval
            employee.resignationData = {
                reason,
                comments,
                attachmentUrl,
                resignationDate: new Date(),
                domainTLApprovalStatus: 'Pending',
                managerApprovalStatus: 'Pending'
            };
        }

        employee.status = 'Resignation Submitted';
        await employee.save();

        // Notification: Notify Manager/HR via Email
        await emailService.sendResignationNotification({
            type: 'RESIGNATION_SUBMITTED',
            employee,
            data: employee.resignationData
        });

        // NOTIFICATION LOGIC
        if (req.user.role === 'manager') {
            // 1. Notify Admins immediately (Manager resigned)
            const admins = await User.find({ role: 'admin' });
            if (admins.length > 0) {
                const notifications = admins.map(admin => ({
                    userId: admin._id,
                    title: 'Manager Resignation Submitted',
                    message: `${employee.firstName} ${employee.lastName} (Manager) has submitted a resignation request. Pending HR Approval.`,
                    type: 'info',
                    isRead: false,
                    link: '/resignation/approvals'
                }));
                await Notification.insertMany(notifications);
            }
        } else if (req.user.role === 'teamlead') {
            // 2. Notify Department Managers immediately (TL resigned)
            const managers = await User.find({ role: 'manager' });
            const mgrUserIds = managers.map(u => u._id);
            const mgrEmails = managers.map(u => u.email).filter(e => e);

            const deptManagers = await Employee.find({
                $or: [
                    { userId: { $in: mgrUserIds } },
                    { email: { $in: mgrEmails } }
                ],
                department: { $regex: new RegExp(`^${employee.department}$`, 'i') },
                isActive: true
            });

            // Map back to User IDs
            const targetNotifications = [];
            for (const emp of deptManagers) {
                if (emp.userId) {
                    targetNotifications.push(emp.userId);
                } else if (emp.email) {
                    const u = managers.find(user => user.email === emp.email);
                    if (u) targetNotifications.push(u._id);
                }
            }
            const uniqueIds = [...new Set(targetNotifications)];

            if (uniqueIds.length > 0) {
                const notifications = uniqueIds.map(userId => ({
                    userId: userId,
                    title: 'Team Lead Resignation',
                    message: `${employee.firstName} ${employee.lastName} (Team Lead) has submitted a resignation request. Pending your approval.`,
                    type: 'warning',
                    isRead: false,
                    link: '/resignation/approvals'
                }));
                await Notification.insertMany(notifications);
            } else {
                // Fallback to Admin
                const admins = await User.find({ role: 'admin' });
                if (admins.length > 0) {
                    const notifications = admins.map(admin => ({
                        userId: admin._id,
                        title: 'TL Resignation (No Manager Found)',
                        message: `${employee.firstName} ${employee.lastName} (TL) submitted resignation. No Manager found. Routing to HR.`,
                        type: 'warning',
                        isRead: false,
                        link: '/resignation/approvals'
                    }));
                    await Notification.insertMany(notifications);
                }
            }
        } else {
            // 3. Notify Domain TLs (Standard Employee Flow)
            // Updated Logic: Find Employees with 'Team Lead' or 'TL' in position within the same domain
            // This decouples the approval flow from the strict 'teamlead' User role, which might not be set.
            const domainTLEmployees = await Employee.find({
                domain: { $regex: new RegExp(`^${employee.domain}$`, 'i') }, // Case insensitive match
                position: { $regex: /Team Lead|TL|Lead/i }, // Look for 'Team Lead', 'TL', 'Tech Lead', etc.
                isActive: true,
                _id: { $ne: employee._id } // Exclude self
            });

            // Allow mixed access to User IDs for notification
            const tlUserIds = domainTLEmployees.map(e => e.userId).filter(id => id);
            const tlEmails = domainTLEmployees.map(e => e.email).filter(email => email);

            // Fetch users for these employees to ensure we notify valid accounts
            const teamLeads = await User.find({
                $or: [
                    { _id: { $in: tlUserIds } },
                    { email: { $in: tlEmails } }
                ]
            });

            if (domainTLEmployees.length > 0) {
                // TL Exists -> Route to TL
                employee.resignationData.domainTLApprovalStatus = 'Pending';
                employee.resignationData.managerApprovalStatus = 'Pending';
                await employee.save();

                // Map back to User IDs for Notifications
                const targetNotifications = [];
                for (const emp of domainTLEmployees) {
                    if (emp.userId) {
                        targetNotifications.push(emp.userId);
                    } else if (emp.email) {
                        const u = teamLeads.find(user => user.email === emp.email);
                        if (u) targetNotifications.push(u._id);
                    }
                }
                const uniqueIds = [...new Set(targetNotifications)];

                if (uniqueIds.length > 0) {
                    const notifications = uniqueIds.map(userId => ({
                        userId: userId,
                        title: 'New Resignation Submitted',
                        message: `${employee.firstName} ${employee.lastName} (${employee.domain}) has submitted a resignation request. Pending TL Approval.`,
                        type: 'info',
                        isRead: false,
                        link: '/resignation/approvals'
                    }));
                    await Notification.insertMany(notifications);
                }
            } else {
                // NO TL Found -> Route DIRECTLY to Manager
                logger.info(`No TL found for domain ${employee.domain}. Routing to Manager.`);

                // Mark TL as Not Required, but Manager still Pending
                employee.resignationData.domainTLApprovalStatus = 'Not Required';
                employee.resignationData.managerApprovalStatus = 'Pending';
                await employee.save();

                // Find Department Manager(s)
                const managers = await User.find({ role: 'manager' });
                const mgrUserIds = managers.map(u => u._id);
                const mgrEmails = managers.map(u => u.email).filter(e => e);

                const deptManagers = await Employee.find({
                    $or: [
                        { userId: { $in: mgrUserIds } },
                        { email: { $in: mgrEmails } }
                    ],
                    department: { $regex: new RegExp(`^${employee.department}$`, 'i') }, // Case insensitive
                    isActive: true
                });

                const targetNotifications = [];
                for (const emp of deptManagers) {
                    if (emp.userId) {
                        targetNotifications.push(emp.userId);
                    } else if (emp.email) {
                        const u = managers.find(user => user.email === emp.email);
                        if (u) targetNotifications.push(u._id);
                    }
                }
                const uniqueIds = [...new Set(targetNotifications)];

                if (uniqueIds.length > 0) {
                    const notifications = uniqueIds.map(userId => ({
                        userId: userId,
                        title: 'New Resignation (TL Skipped)',
                        message: `${employee.firstName} ${employee.lastName} submitted resignation. Routed to you (No TL found in domain).`,
                        type: 'warning',
                        isRead: false,
                        link: '/resignation/approvals'
                    }));
                    await Notification.insertMany(notifications);
                } else {
                    // Fallback: Notify Admin (HR) if no Manager found either
                    const admins = await User.find({ role: 'admin' });
                    if (admins.length > 0) {
                        const notifications = admins.map(admin => ({
                            userId: admin._id,
                            title: 'New Resignation (No TL/Mgr Found)',
                            message: `${employee.firstName} ${employee.lastName} submitted resignation. No Domain TL or Dept Manager found.`,
                            type: 'warning',
                            isRead: false,
                            link: '/resignation/approvals'
                        }));
                        await Notification.insertMany(notifications);
                    }
                }
            }
        }



        res.status(200).json({ status: 'success', message: 'Resignation submitted successfully', data: employee });

    } catch (error) {
        logger.error('Submit Resignation Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Get Domain TL Resignations
 * Endpoint: GET /api/resignation/tl/list
 */
exports.getTLResignations = async (req, res) => {
    try {
        // Find the TL's domain first (assuming the requester is a TL)
        let tlEmployee;
        if (req.user.employeeId) {
            tlEmployee = await Employee.findById(req.user.employeeId);
        } else {
            tlEmployee = await Employee.findOne({ userId: req.user.id });
        }

        // Fallback: Find by email if not found
        if (!tlEmployee) {
            const user = await User.findById(req.user.id);
            if (user && user.email) {
                tlEmployee = await Employee.findOne({ email: user.email });
            }
        }

        if (!tlEmployee) {
            return res.status(404).json({ status: 'error', message: 'TL Profile not found' });
        }

        const domain = tlEmployee.domain;

        // Fetch employees with status 'Resignation Submitted' AND TL Pending AND matching domain
        const employees = await Employee.find({
            status: 'Resignation Submitted',
            'resignationData.domainTLApprovalStatus': 'Pending',
            domain: { $regex: new RegExp(`^${domain}$`, 'i') } // Case insensitive
        }).select('firstName lastName employeeId department position domain resignationData');

        res.status(200).json({ status: 'success', data: employees });
    } catch (error) {
        logger.error('Get TL Resignations Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Approve Resignation by Domain TL
 * Endpoint: POST /api/resignation/tl/approve
 */
exports.approveResignationByTL = async (req, res) => {
    try {
        const { employeeId, comments } = req.body;
        const employee = await Employee.findOne({ employeeId });

        if (!employee) {
            return res.status(404).json({ status: 'error', message: 'Employee not found' });
        }

        if (employee.status !== 'Resignation Submitted') {
            return res.status(400).json({ status: 'error', message: 'Invalid status for approval' });
        }

        // Update TL approval status
        employee.resignationData.domainTLApprovalStatus = 'Approved';
        employee.resignationData.domainTLActionDate = new Date();
        employee.resignationData.domainTLComments = comments || '';

        await employee.save();

        // Notification: Notify Department Managers
        // Robust Lookup: Find Users with role 'manager'
        const managers = await User.find({ role: 'manager' });
        const mgrUserIds = managers.map(u => u._id);
        const mgrEmails = managers.map(u => u.email).filter(e => e);

        // Find Dept Managers via ID or Email
        const deptManagers = await Employee.find({
            $or: [
                { userId: { $in: mgrUserIds } },
                { email: { $in: mgrEmails } }
            ],
            department: { $regex: new RegExp(`^${employee.department}$`, 'i') }, // Case insensitive
            isActive: true
        });

        // Map back to User IDs
        const targetNotifications = [];
        for (const emp of deptManagers) {
            if (emp.userId) {
                targetNotifications.push(emp.userId);
            } else if (emp.email) {
                const u = managers.find(user => user.email === emp.email);
                if (u) targetNotifications.push(u._id);
            }
        }
        const uniqueIds = [...new Set(targetNotifications)];

        if (uniqueIds.length > 0) {
            const notifications = uniqueIds.map(userId => ({
                userId: userId,
                title: 'Resignation Pending Manager Approval',
                message: `TL approved resignation for ${employee.firstName} ${employee.lastName}. Pending your approval.`,
                type: 'info',
                isRead: false,
                link: '/resignation/approvals'
            }));
            await Notification.insertMany(notifications);
        } else {
            // Fallback: Notify Admin (HR) if no Department Manager found
            const admins = await User.find({ role: 'admin' });
            if (admins.length > 0) {
                const notifications = admins.map(admin => ({
                    userId: admin._id,
                    title: 'Resignation Pending (No Dept Mgr Found)',
                    message: `TL approved resignation for ${employee.firstName} ${employee.lastName}. No Department Manager found to approve. Routing to HR.`,
                    type: 'warning',
                    isRead: false,
                    link: '/resignation/approvals'
                }));
                await Notification.insertMany(notifications);
            }
        }

        // Notify Employee
        if (employee.userId) {
            await Notification.create({
                userId: employee.userId,
                title: 'Resignation TL Approved',
                message: 'Your Domain TL has approved your resignation. It is now pending Manager approval.',
                type: 'success',
                isRead: false,
                link: '/employee/resignation'
            });
        }

        res.status(200).json({ status: 'success', message: 'Resignation approved by TL', data: employee });

    } catch (error) {
        logger.error('TL Approve Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Reject Resignation by Domain TL
 * Endpoint: POST /api/resignation/tl/reject
 */
exports.rejectResignationByTL = async (req, res) => {
    try {
        const { employeeId, rejectionReason } = req.body;
        const employee = await Employee.findOne({ employeeId });

        if (!employee) {
            return res.status(404).json({ status: 'error', message: 'Employee not found' });
        }

        employee.status = 'Confirmed'; // Revert to Confirmed (Active)
        employee.resignationData.domainTLApprovalStatus = 'Rejected';
        employee.resignationData.rejectionReason = rejectionReason;
        employee.resignationData.domainTLActionDate = new Date();

        await employee.save();

        // Notify Employee
        if (employee.userId) {
            await Notification.create({
                userId: employee.userId,
                title: 'Resignation Rejected by TL',
                message: `Your resignation request was rejected by your Domain TL. Reason: ${rejectionReason}`,
                type: 'error',
                isRead: false,
                link: '/employee/resignation'
            });
        }

        res.status(200).json({ status: 'success', message: 'Resignation rejected by TL', data: employee });

    } catch (error) {
        logger.error('TL Reject Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Get Manager Resignations
 * Endpoint: GET /api/resignation/manager/list
 */
exports.getManagerResignations = async (req, res) => {
    try {
        // Fetch employees with status 'Resignation Submitted'. 
        // Ideally filter by manager's team. For now, returning all pending for testing/MVP.
        // Fetch employees with status 'Resignation Submitted'
        // AND (TL Approved OR TL Not Required)
        // AND Manager Pending
        // Find the Manager's department
        let mgrEmployee;
        if (req.user.employeeId) {
            mgrEmployee = await Employee.findById(req.user.employeeId);
        } else {
            mgrEmployee = await Employee.findOne({ userId: req.user.id });
        }

        // Fallback: Find by email if not found
        if (!mgrEmployee) {
            const user = await User.findById(req.user.id);
            if (user && user.email) {
                mgrEmployee = await Employee.findOne({ email: user.email });
            }
        }

        if (!mgrEmployee) {
            return res.status(404).json({ status: 'error', message: 'Manager Profile not found' });
        }

        const department = mgrEmployee.department;

        // Fetch employees with status 'Resignation Submitted'
        // AND (TL Approved OR TL Not Required)
        // AND Manager Pending
        // REMOVED Department filter to allow "Common Manager" to see all requests
        const employees = await Employee.find({
            status: 'Resignation Submitted',
            'resignationData.domainTLApprovalStatus': { $in: ['Approved', 'Not Required'] },
            'resignationData.managerApprovalStatus': 'Pending'
        }).select('firstName lastName employeeId department position domain resignationData');

        res.status(200).json({ status: 'success', data: employees });
    } catch (error) {
        logger.error('Get Manager Resignations Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Approve Resignation by Manager
 * Endpoint: POST /api/resignation/manager/approve
 */
exports.approveResignation = async (req, res) => {
    try {
        const { employeeId, lwd } = req.body;
        const employee = await Employee.findOne({ employeeId });

        if (!employee) {
            return res.status(404).json({ status: 'error', message: 'Employee not found' });
        }

        if (employee.status !== 'Resignation Submitted') {
            return res.status(400).json({ status: 'error', message: 'Invalid status for approval' });
        }

        if (req.user.role !== 'admin' && req.user.role !== 'hr' &&
            employee.resignationData.domainTLApprovalStatus !== 'Approved' &&
            employee.resignationData.domainTLApprovalStatus !== 'Not Required') {
            return res.status(400).json({ status: 'error', message: 'Domain TL approval is required before Manager approval.' });
        }

        // Auto-approve TL status if bypassed by Admin/HR
        if ((req.user.role === 'admin' || req.user.role === 'hr') && employee.resignationData.domainTLApprovalStatus === 'Pending') {
            employee.resignationData.domainTLApprovalStatus = 'Approved';
            employee.resignationData.domainTLComments = 'Auto-approved by Admin/Manager Override';
            employee.resignationData.domainTLActionDate = new Date();
        }

        // Update manager approval status
        employee.resignationData.managerApprovalStatus = 'Approved';
        employee.resignationData.managerActionDate = new Date();

        // Update requestedLWD if provided by Manager
        if (lwd) {
            const finalDate = new Date(lwd);
            employee.resignationData.requestedLWD = finalDate;
            employee.resignationData.finalLWD = finalDate;

            // Calculate days remaining
            const today = new Date();
            const diffTime = Math.abs(finalDate - today);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            employee.resignationData.daysRemaining = diffDays;

            // Calculate notice days (approx)
            const resignDate = new Date(employee.resignationData.resignationDate || today);
            const noticeTime = Math.abs(finalDate - resignDate);
            employee.resignationData.noticeDays = Math.ceil(noticeTime / (1000 * 60 * 60 * 24));
        }

        // Set Status to Notice Period directly - REMOVED: Let HR finalize this.
        // employee.status = 'Notice Period'; 

        await employee.save();

        // Notification: Notify HR
        await emailService.sendResignationNotification({
            type: 'RESIGNATION_APPROVED',
            employee,
            data: employee.resignationData
        });

        // Notify Admins (HR) In-App
        const admins = await User.find({ role: 'admin' });
        if (admins.length > 0) {
            const notifications = admins.map(admin => ({
                userId: admin._id,
                title: 'Resignation Manager Approved',
                message: `Manager has approved resignation for ${employee.firstName} ${employee.lastName}. Pending Final HR Approval.`,
                type: 'info',
                isRead: false,
                link: '/resignation/approvals'
            }));
            await Notification.insertMany(notifications);
        }

        // Notify Employee (In-App)
        if (employee.userId) {
            await Notification.create({
                userId: employee.userId,
                title: 'Resignation Manager Approved',
                message: `Your resignation has been approved by your Manager. It is now pending Final HR Approval.`,
                type: 'success',
                isRead: false,
                link: '/employee/resignation'
            });
        }

        res.status(200).json({ status: 'success', message: 'Resignation approved and Notice Period started', data: employee });

    } catch (error) {
        logger.error('Manager Approve Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Reject Resignation by Manager
 * Endpoint: POST /api/resignation/manager/reject
 */
exports.rejectResignation = async (req, res) => {
    try {
        const { employeeId, rejectionReason } = req.body;
        const employee = await Employee.findOne({ employeeId });

        if (!employee) {
            return res.status(404).json({ status: 'error', message: 'Employee not found' });
        }

        const prevStatus = employee.resignationData && employee.resignationData.noticeDays ? 'Notice Period' : 'Confirmed';

        employee.status = 'Confirmed';
        employee.resignationData.managerApprovalStatus = 'Rejected';
        employee.resignationData.rejectionReason = rejectionReason;
        employee.resignationData.managerActionDate = new Date();

        await employee.save();

        // Notification: Notify Employee
        await emailService.sendResignationNotification({
            type: 'RESIGNATION_REJECTED',
            employee,
            data: employee.resignationData
        });

        // Notify Employee (In-App)
        if (employee.userId) {
            await Notification.create({
                userId: employee.userId,
                title: 'Resignation Rejected',
                message: `Your resignation request was rejected. Reason: ${rejectionReason}`,
                type: 'error',
                type: 'error',
                isRead: false,
                link: '/employee/resignation'
            });
        }

        res.status(200).json({ status: 'success', message: 'Resignation rejected', data: employee });

    } catch (error) {
        logger.error('Manager Reject Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Get HR Resignations (Final Approval List)
 * Endpoint: GET /api/resignation/hr/list
 */
exports.getHRResignations = async (req, res) => {
    try {
        // Fetch employees with status 'Resignation Submitted'
        // STRICT FILTER: Only show requests that have been APPROVED BY MANAGER or NOT REQUIRED (Manager Resignation)
        // This ensures Admin only sees it for the Final "Notice Period" step.
        const employees = await Employee.find({
            status: 'Resignation Submitted',
            'resignationData.managerApprovalStatus': { $in: ['Approved', 'Not Required'] }
        }).select('firstName lastName employeeId department position domain resignationData');

        res.status(200).json({ status: 'success', data: employees });
    } catch (error) {
        logger.error('Get HR Resignations Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Final Approve by HR
 * Endpoint: POST /api/resignation/hr/approve
 */
exports.finalApproveResignation = async (req, res) => {
    try {
        const { employeeId, noticeDays, finalLWD, comments } = req.body;
        const employee = await Employee.findOne({ employeeId });

        if (!employee) {
            return res.status(404).json({ status: 'error', message: 'Employee not found' });
        }

        // Update resignation data with final details
        employee.resignationData.noticeDays = parseInt(noticeDays);
        employee.resignationData.finalLWD = new Date(finalLWD);
        employee.resignationData.hrComments = comments;

        // Calculate days remaining
        const today = new Date();
        const diffTime = Math.abs(new Date(finalLWD) - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        employee.resignationData.daysRemaining = diffDays;

        // Change status to 'Notice Period'
        employee.status = 'Notice Period';

        await employee.save();

        // Notification: Notify Employee via Email
        await emailService.sendResignationNotification({
            type: 'RESIGNATION_FINALIZED',
            employee,
            data: employee.resignationData
        });

        // Creates In-App Notification
        if (employee.userId) {
            await Notification.create({
                userId: employee.userId,
                title: 'Resignation Finalized',
                message: `Your resignation has been finalized. Your Last Working Day is set to ${new Date(finalLWD).toLocaleDateString()}.`,
                type: 'info',
                isRead: false,
                link: '/employee/resignation'
            });
        }

        res.status(200).json({ status: 'success', message: 'Resignation final approved. Employee is now on Notice Period.', data: employee });

    } catch (error) {
        logger.error('HR Final Approve Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Update Exit Clearance
 * Endpoint: POST /api/resignation/hr/clearance
 */
exports.updateExitClearance = async (req, res) => {
    try {
        const { employeeId, clearanceData } = req.body;
        // clearanceData e.g. { assetsReturned: true, financeCleared: true }

        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({ status: 'error', message: 'Employee not found' });
        }

        // Merge existing clearance with new data
        employee.resignationData.exitClearance = {
            ...employee.resignationData.exitClearance,
            ...clearanceData
        };

        // Check if all cleared? (Optional logic)

        await employee.save();

        res.status(200).json({ status: 'success', message: 'Exit clearance updated', data: employee.resignationData.exitClearance });

    } catch (error) {
        logger.error('Update Clearance Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Cancel Resignation by Employee
 * Endpoint: POST /api/resignation/cancel
 */
exports.cancelResignation = async (req, res) => {
    try {
        let employee;
        if (req.user.employeeId) {
            employee = await Employee.findById(req.user.employeeId);
        } else {
            employee = await Employee.findOne({ userId: req.user.id });
        }

        if (!employee) {
            return res.status(404).json({ status: 'error', message: 'Employee not found' });
        }

        if (employee.status !== 'Resignation Submitted' && employee.status !== 'Notice Period') {
            return res.status(400).json({ status: 'error', message: 'Cannot cancel resignation at this stage. Please contact HR.' });
        }

        // Reset Status
        employee.status = 'Confirmed';

        // Reset Resignation Data
        employee.resignationData = {
            reason: '',
            comments: '',
            managerApprovalStatus: 'Pending',
            resignationDate: null,
            requestedLWD: null
        };

        await employee.save();

        // Notify Admins (In-App)
        const admins = await User.find({ role: 'admin' });
        if (admins.length > 0) {
            const notifications = admins.map(admin => ({
                userId: admin._id,
                title: 'Resignation Cancelled',
                message: `${employee.firstName} ${employee.lastName} has cancelled their resignation request.`,
                type: 'warning',
                isRead: false,
                link: '/resignation/approvals'
            }));
            await Notification.insertMany(notifications);
        }

        res.status(200).json({ status: 'success', message: 'Resignation cancelled successfully', data: employee });

    } catch (error) {
        logger.error('Cancel Resignation Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Get Employees in Exit Process (Notice Period & Exit Process)
 * Endpoint: GET /api/resignation/hr/exit-list
 */
exports.getExitEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({
            status: { $in: ['Notice Period', 'Exit Process'] }
        }).select('firstName lastName employeeId department position status resignationData');

        res.status(200).json({ status: 'success', data: employees });
    } catch (error) {
        logger.error('Get Exit Employees Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Relieve Employee (Mark as Relieved)
 * Endpoint: POST /api/resignation/hr/relieve
 */
exports.relieveEmployee = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const employee = await Employee.findOne({ employeeId });

        if (!employee) {
            return res.status(404).json({ status: 'error', message: 'Employee not found' });
        }

        // Optional: Check if all clearances are done?
        // if (!employee.resignationData.exitClearance.assetsReturned ...)

        employee.status = 'Relieved';
        // employee.isActive = false; // Optionally deactivate account

        await employee.save();

        // Notification: Notify Employee
        await emailService.sendResignationNotification({
            type: 'EMPLOYEE_RELIEVED',
            employee,
            data: employee.resignationData
        });

        // Notify Employee (In-App)
        if (employee.userId) {
            await Notification.create({
                userId: employee.userId,
                title: 'You have been Relieved',
                message: 'You have been officially relieved from your duties. We wish you all the best!',
                type: 'success',
                isRead: false,
                link: '/employee/profile'
            });
        }

        res.status(200).json({ status: 'success', message: 'Employee successfully relieved', data: employee });

    } catch (error) {
        logger.error('Relieve Employee Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
