const Project = require('../../models/Project/Project');
const Employee = require('../../models/Employee/Employee');
const User = require('../../models/User/User');
const { successResponse, errorResponse } = require('../../utils/response');
const { sendProjectAssignmentEmail } = require('../../services/email.service');
const { sendNotification } = require('../../services/notification.service');
const logger = require('../../utils/logger');

// Get all projects
exports.getAllProjects = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, department, search } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }

        if (department) {
            query.department = department;
        }

        if (search) {
            query.projectName = { $regex: search, $options: 'i' };
        }

        const projects = await Project.find(query)
            .populate('manager', 'firstName lastName email profileImage position')
            .populate('teamLead', 'firstName lastName email profileImage position')
            .populate('teamMembers', 'firstName lastName email profileImage position')
            .populate('createdBy', 'firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Project.countDocuments(query);

        return successResponse(res, {
            projects,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, 'Projects retrieved successfully');

    } catch (error) {
        logger.error('Get all projects error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('manager', 'firstName lastName email profileImage position')
            .populate('teamLead', 'firstName lastName email profileImage position')
            .populate('teamMembers', 'firstName lastName email profileImage position')
            .populate('createdBy', 'firstName lastName')
            .populate('statusHistory.updatedBy', 'firstName lastName')
            .populate('progressHistory.updatedBy', 'firstName lastName')
            .populate('modules.files.uploadedBy', 'firstName lastName');

        if (!project) {
            return errorResponse(res, 'Project not found', 404);
        }

        return successResponse(res, { project }, 'Project retrieved successfully');

    } catch (error) {
        logger.error('Get project by ID error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Create project
exports.createProject = async (req, res) => {
    try {
        const projectData = {
            ...req.body,
            createdBy: req.user.id,
            statusHistory: [{
                status: req.body.status || 'Planning',
                updatedBy: req.user.id,
                comment: 'Project created'
            }],
            progressHistory: [{
                progress: req.body.progress || 0,
                updatedBy: req.user.id,
                comment: 'Initial progress'
            }]
        };

        const project = await Project.create(projectData);

        // Populate the project for email
        await project.populate([
            { path: 'manager', select: 'firstName lastName email' },
            { path: 'teamLead', select: 'firstName lastName email' },
            { path: 'teamMembers', select: 'firstName lastName email' }
        ]);

        // Send email notifications to all team members
        try {
            // Send to manager
            await sendProjectAssignmentEmail(project, project.manager, 'Manager');
            // Notification
            if (project.manager && project.manager.userId) {
                await sendNotification({ userId: project.manager.userId, title: 'New Project Assigned', message: `You are assigned as Manager for project ${project.projectName}`, type: 'info', link: '/employee/projects' });
            }

            // Send to team lead
            await sendProjectAssignmentEmail(project, project.teamLead, 'Team Lead');
            // Notification
            if (project.teamLead && project.teamLead.userId) {
                await sendNotification({ userId: project.teamLead.userId, title: 'New Project Assigned', message: `You are assigned as Team Lead for project ${project.projectName}`, type: 'info', link: '/employee/projects' });
            }

            // Send to team members
            if (project.teamMembers && project.teamMembers.length > 0) {
                for (const member of project.teamMembers) {
                    await sendProjectAssignmentEmail(project, member, 'Team Member');
                    if (member.userId) {
                        await sendNotification({ userId: member.userId, title: 'New Project Assigned', message: `You are assigned to project ${project.projectName}`, type: 'info', link: '/employee/projects' });
                    }
                }
            }

            logger.info(`Project assignment emails sent for: ${project.projectName}`);
        } catch (emailError) {
            logger.error('Email sending error:', emailError);
            // Don't fail the request if email fails
        }

        logger.info(`New project created: ${project.projectName}`);

        return successResponse(res, { project }, 'Project created successfully and notifications sent', 201);

    } catch (error) {
        logger.error('Create project error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Update project
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return errorResponse(res, 'Project not found', 404);
        }

        // Track status changes
        if (req.body.status && req.body.status !== project.status) {
            project.statusHistory.push({
                status: req.body.status,
                updatedBy: req.user.id,
                comment: req.body.statusComment || 'Status updated'
            });
        }

        // Track progress changes
        if (req.body.progress !== undefined && req.body.progress !== project.progress) {
            project.progressHistory.push({
                progress: req.body.progress,
                updatedBy: req.user.id,
                comment: req.body.progressComment || 'Progress updated'
            });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (key !== 'statusComment' && key !== 'progressComment') {
                project[key] = req.body[key];
            }
        });

        project.lastUpdatedBy = req.user.id;
        await project.save();

        await project.populate([
            { path: 'manager', select: 'firstName lastName email profileImage position userId' },
            { path: 'teamLead', select: 'firstName lastName email profileImage position userId' },
            { path: 'teamMembers', select: 'firstName lastName email profileImage position userId' },
            { path: 'createdBy', select: 'firstName lastName' }
        ]);

        // Notify Team (Manager, Lead, Members)
        try {
            const updater = await User.findById(req.user.id).select('firstName lastName');
            const updaterName = updater ? `${updater.firstName} ${updater.lastName}` : 'Admin';
            const message = `Project '${project.projectName}' updated by ${updaterName}. Status: ${project.status}`;

            // Helper to send if not self
            const send = async (uId, link) => {
                if (uId && uId.toString() !== req.user.id) {
                    await sendNotification({ userId: uId, title: 'Project Updated', message, type: 'info', link });
                }
            };

            if (project.manager && project.manager.userId) await send(project.manager.userId, '/employee/projects');
            if (project.teamLead && project.teamLead.userId) await send(project.teamLead.userId, '/employee/projects');
            if (project.teamMembers && project.teamMembers.length > 0) {
                for (const member of project.teamMembers) {
                    if (member.userId) await send(member.userId, '/employee/projects');
                }
            }
        } catch (e) { logger.error('Notification error', e); }

        logger.info(`Project updated: ${project.projectName}`);

        return successResponse(res, { project }, 'Project updated successfully');

    } catch (error) {
        logger.error('Update project error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Delete project (soft delete - set to Cancelled)
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            {
                status: 'Cancelled',
                lastUpdatedBy: req.user.id,
                $push: {
                    statusHistory: {
                        status: 'Cancelled',
                        updatedBy: req.user.id,
                        comment: 'Project cancelled/deleted'
                    }
                }
            },
            { new: true }
        );

        if (!project) {
            return errorResponse(res, 'Project not found', 404);
        }

        logger.info(`Project cancelled: ${project.projectName}`);

        return successResponse(res, { project }, 'Project cancelled successfully');

    } catch (error) {
        logger.error('Delete project error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Get unique departments from employees
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Employee.distinct('department');

        return successResponse(res, { departments }, 'Departments retrieved successfully');

    } catch (error) {
        logger.error('Get departments error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Get employees by department
exports.getEmployeesByDepartment = async (req, res) => {
    try {
        const { department } = req.params;

        const employees = await Employee.find({
            department,
            isActive: true
        }).select('firstName lastName email profileImage position employeeId');

        return successResponse(res, { employees }, 'Employees retrieved successfully');

    } catch (error) {
        logger.error('Get employees by department error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Get employee's projects
exports.getMyProjects = async (req, res) => {
    try {
        let employeeId = req.user.employeeId;
        let employee;

        // 1. Try finding by employeeId from token
        if (employeeId) {
            employee = await Employee.findById(employeeId);
        }

        // 2. If not found, try finding by userId (link in DB)
        if (!employee) {
            employee = await Employee.findOne({ userId: req.user.id });
        }

        // 3. Fallback: Try finding by email
        if (!employee) {
            const user = await User.findById(req.user.id);
            if (user && user.email) {
                employee = await Employee.findOne({ email: user.email });
                logger.info(`Looking up employee by email: ${user.email}`);
            }
        }

        if (!employee) {
            logger.warn(`No employee profile found for user ${req.user.id}`);
            return successResponse(res, { projects: [] }, 'No employee profile found. Please contact admin to create your employee profile.');
        }

        employeeId = employee._id;
        logger.info(`Found employee: ${employee.firstName} ${employee.lastName} (${employeeId})`);

        logger.info(`Fetching projects for employee: ${employeeId}`);

        const projects = await Project.find({
            $or: [
                { manager: employeeId },
                { teamLead: employeeId },
                { teamMembers: employeeId }
            ]
        })
            .populate('manager', 'firstName lastName email profileImage position')
            .populate('teamLead', 'firstName lastName email profileImage position')
            .populate('teamMembers', 'firstName lastName email profileImage position')
            .populate('modules.assignedTo', 'firstName lastName profileImage')
            .sort({ createdAt: -1 });

        logger.info(`Found ${projects.length} projects for employee ${employeeId}`);

        // Add role information for each project
        const projectsWithRole = projects.map(project => {
            let role = 'Team Member';
            if (project.manager && project.manager._id.toString() === employeeId.toString()) {
                role = 'Manager';
            } else if (project.teamLead && project.teamLead._id.toString() === employeeId.toString()) {
                role = 'Team Lead';
            }

            return {
                ...project.toObject(),
                userRole: role
            };
        });

        return successResponse(res, {
            projects: projectsWithRole,
            currentEmployeeId: employeeId
        }, 'Projects retrieved successfully');

    } catch (error) {
        logger.error('Get my projects error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Update project status/progress (for employees)
exports.updateProjectProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, progress, comment } = req.body;
        let employeeId = req.user.employeeId;

        // If employeeId is not in token, try to get it from Employee collection
        if (!employeeId) {
            // First try by userId
            let employee = await Employee.findOne({ userId: req.user.id });

            // If not found by userId, try by email
            if (!employee) {
                const user = await User.findById(req.user.id);
                if (user && user.email) {
                    employee = await Employee.findOne({ email: user.email });
                }
            }

            if (!employee) {
                return errorResponse(res, 'Employee profile not found', 404);
            }

            employeeId = employee._id;
        }

        const project = await Project.findById(id);

        if (!project) {
            return errorResponse(res, 'Project not found', 404);
        }

        // Check if user is part of the project
        const isManager = project.manager.toString() === employeeId.toString();
        const isTeamLead = project.teamLead.toString() === employeeId.toString();
        const isTeamMember = project.teamMembers.some(member => member.toString() === employeeId.toString());

        if (!isManager && !isTeamLead && !isTeamMember) {
            return errorResponse(res, 'You are not authorized to update this project', 403);
        }

        // Update status if provided
        if (status && status !== project.status) {
            project.status = status;
            project.statusHistory.push({
                status,
                updatedBy: employeeId,
                comment: comment || 'Status updated by team member'
            });
        }

        // Update progress if provided
        if (progress !== undefined && progress !== project.progress) {
            project.progress = progress;
            project.progressHistory.push({
                progress,
                updatedBy: employeeId,
                comment: comment || 'Progress updated by team member'
            });
        }

        project.lastUpdatedBy = employeeId;
        await project.save();

        await project.populate([
            { path: 'manager', select: 'firstName lastName email profileImage position userId' },
            { path: 'teamLead', select: 'firstName lastName email profileImage position userId' },
            { path: 'teamMembers', select: 'firstName lastName email profileImage position userId' }
        ]);

        // Notify Admin and Team
        try {
            const updater = await Employee.findById(employeeId).select('firstName lastName');
            const updaterName = updater ? `${updater.firstName} ${updater.lastName}` : 'Team Member';
            const message = `Project '${project.projectName}' updated by ${updaterName}. Status: ${project.status}`;

            // Notify Admin
            const admins = await User.find({ role: 'admin' });
            for (const admin of admins) {
                if (admin._id.toString() !== req.user.id) {
                    await sendNotification({ userId: admin._id, title: 'Project Updated', message, type: 'info', link: '/projects' });
                }
            }

            // Helper for Team
            const send = async (uId) => {
                if (uId && uId.toString() !== req.user.id) {
                    await sendNotification({ userId: uId, title: 'Project Updated', message, type: 'info', link: '/employee/projects' });
                }
            };

            if (project.manager && project.manager.userId) await send(project.manager.userId);
            if (project.teamLead && project.teamLead.userId) await send(project.teamLead.userId);
            if (project.teamMembers && project.teamMembers.length > 0) {
                for (const member of project.teamMembers) {
                    if (member.userId) await send(member.userId);
                }
            }
        } catch (e) { logger.error('Notification error', e); }

        logger.info(`Project progress updated: ${project.projectName}`);

        return successResponse(res, { project }, 'Project updated successfully');

    } catch (error) {
        logger.error('Update project progress error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Add module to project
exports.addModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { moduleName, description, assignedTo, status, dueDate, moduleUrl } = req.body;

        const project = await Project.findById(id);

        if (!project) {
            return errorResponse(res, 'Project not found', 404);
        }

        const files = req.files ? req.files.map(file => ({
            fileName: file.originalname,
            fileUrl: file.path, // Cloudinary URL or local path
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedBy: req.user.id
        })) : [];

        project.modules.push({
            moduleName,
            description,
            moduleUrl,
            assignedTo,
            status: status || 'Pending',
            dueDate,
            files: files
        });

        await project.save();

        // Populate to return full details
        await project.populate('modules.assignedTo', 'firstName lastName profileImage');

        // Notify assigned employee
        if (assignedTo) {
            const Employee = require('../../models/Employee/Employee');
            const employee = await Employee.findById(assignedTo);
            if (employee && employee.userId) {
                await sendNotification({
                    userId: employee.userId,
                    title: 'New Module Assigned',
                    message: `You have been assigned to module '${moduleName}' in project '${project.projectName}'`,
                    type: 'info',
                    link: '/employee/projects'
                });
            }
        }

        logger.info(`Module added to project: ${project.projectName}`);

        return successResponse(res, { project }, 'Module added successfully');

    } catch (error) {
        logger.error('Add module error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Update module in project
exports.updateModule = async (req, res) => {
    try {
        const { id, moduleId } = req.params;
        const { moduleName, description, assignedTo, status, dueDate, moduleUrl } = req.body;

        const project = await Project.findById(id);

        if (!project) {
            return errorResponse(res, 'Project not found', 404);
        }

        const module = project.modules.id(moduleId);

        if (!module) {
            return errorResponse(res, 'Module not found', 404);
        }

        if (moduleName) module.moduleName = moduleName;
        if (description) module.description = description;
        if (moduleUrl) module.moduleUrl = moduleUrl;
        if (assignedTo) module.assignedTo = assignedTo;
        if (status) module.status = status;
        if (dueDate) module.dueDate = dueDate;

        await project.save();

        // Populate
        await project.populate('modules.assignedTo', 'firstName lastName profileImage');

        logger.info(`Module updated in project: ${project.projectName}`);

        return successResponse(res, { project }, 'Module updated successfully');

    } catch (error) {
        logger.error('Update module error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// Upload file to module
exports.uploadModuleFile = async (req, res) => {
    try {
        const { id, moduleId } = req.params;
        const project = await Project.findById(id);

        if (!project) {
            return errorResponse(res, 'Project not found', 404);
        }

        const module = project.modules.id(moduleId);

        if (!module) {
            return errorResponse(res, 'Module not found', 404);
        }

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                module.files.push({
                    fileName: file.originalname,
                    fileUrl: file.path,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    uploadedBy: req.user.id
                });
            });
        }

        await project.save();

        logger.info(`File uploaded to module in project: ${project.projectName}`);

        return successResponse(res, { project }, 'File uploaded successfully');

    } catch (error) {
        logger.error('Upload module file error:', error);
        return errorResponse(res, error.message, 500);
    }
};
