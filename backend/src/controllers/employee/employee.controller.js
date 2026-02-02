const Employee = require('../../models/Employee/Employee');
const User = require('../../models/User/User');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');
const { generateEmployeeId } = require('../../utils/idGenerator');

exports.getEmployeeStats = async (req, res) => {
    try {
        const stats = await Employee.aggregate([
            {
                $group: {
                    _id: { $toLower: "$status" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = {
            intern: 0,
            probation: 0,
            confirmed: 0,
            resignationSubmitted: 0,
            noticePeriod: 0,
            relieved: 0,
            terminated: 0
        };

        stats.forEach(item => {
            const statusKey = item._id === 'resignation submitted' ? 'resignationSubmitted' :
                item._id === 'notice period' ? 'noticePeriod' :
                    item._id;
            if (formattedStats.hasOwnProperty(statusKey)) {
                formattedStats[statusKey] = item.count;
            }
        });

        return successResponse(res, formattedStats, 'Employee stats retrieved successfully');
    } catch (error) {
        logger.error('Get employee stats error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getAllEmployees = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, department, status } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } }
            ];
        }
        if (department) {
            query.department = department;
        }
        if (status !== undefined && status !== '') {
            if (status === 'active' || status === 'inactive') {
                query.isActive = status === 'active';
            } else {
                // Filter by employment status (Probation, Confirmed, etc.)
                query.status = status;
            }
        }
        const employees = await Employee.find(query)
            .populate('shift', 'shiftName shiftType startTime endTime')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });
        const total = await Employee.countDocuments(query);
        return successResponse(res, {
            employees,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, 'Employees retrieved successfully');
    } catch (error) {
        logger.error('Get all employees error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate('userId', 'email role')
            .populate('shift', 'shiftName shiftType startTime endTime');
        if (!employee) {
            return errorResponse(res, 'Employee not found', 404);
        }
        return successResponse(res, { employee }, 'Employee retrieved successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

exports.getMyProfile = async (req, res) => {
    try {
        let employee;

        // 1. Try finding by employeeId from token (most reliable)
        if (req.user.employeeId) {
            employee = await Employee.findById(req.user.employeeId)
                .populate('userId', 'email role')
                .populate('shift', 'shiftName shiftType startTime endTime');
        }

        // 2. If not found, try finding by userId (link in DB)
        if (!employee) {
            employee = await Employee.findOne({ userId: req.user.id })
                .populate('userId', 'email role')
                .populate('shift', 'shiftName shiftType startTime endTime');
        }

        // 3. Fallback: Try finding by email (Project module logic)
        if (!employee) {
            const user = await User.findById(req.user.id);
            if (user && user.email) {
                // Exact match lookup as per Project module
                employee = await Employee.findOne({ email: user.email })
                    .populate('shift', 'shiftName shiftType startTime endTime');
            }
        }

        if (!employee) {
            return errorResponse(res, 'Employee profile not found', 404);
        }

        return successResponse(res, { employee }, 'Employee profile retrieved successfully');
    } catch (error) {
        logger.error('Get my profile error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.createEmployee = async (req, res) => {
    try {
        const employeeData = { ...req.body };

        // Auto-generate employeeId if not provided
        // Auto-generate employeeId if not provided
        if (!employeeData.employeeId) {
            employeeData.employeeId = await generateEmployeeId();
        }

        // Check if employeeId already exists
        const existingEmployee = await Employee.findOne({ employeeId: employeeData.employeeId });
        if (existingEmployee) {
            return errorResponse(res, 'Employee ID already exists', 400);
        }

        // Check if email already exists in Employee collection
        const existingEmail = await Employee.findOne({ email: employeeData.email });
        if (existingEmail) {
            return errorResponse(res, 'Email already registered as employee', 400);
        }

        // Handle profile image from FormData
        console.log('Files received:', req.files);
        console.log('Body received:', req.body);

        // Check if Department already has a Manager (if this employee is being set as Manager)
        if (employeeData.position && employeeData.position.toLowerCase() === 'manager') {
            const existingManager = await Employee.findOne({
                department: employeeData.department,
                position: { $regex: /^manager$/i },
                isActive: true
            });
            if (existingManager) {
                return errorResponse(res, 'Manager exists for this department', 400);
            }
        }

        if (req.files && req.files.profileImage) {
            employeeData.profileImage = req.files.profileImage[0].path;
        }

        // Handle document uploads and existing URLs
        if (req.files || Object.keys(req.body).some(key => [
            'tenthMarksheet', 'twelfthMarksheet', 'degreeCertificate',
            'consolidatedMarksheet', 'provisionalCertificate', 'aadharCard',
            'panCard', 'resume'
        ].includes(key))) {
            employeeData.documents = employeeData.documents || {};
            const docFields = [
                'tenthMarksheet', 'twelfthMarksheet', 'degreeCertificate',
                'consolidatedMarksheet', 'provisionalCertificate', 'aadharCard',
                'panCard', 'resume'
            ];

            docFields.forEach(field => {
                // Handle new file upload
                if (req.files && req.files[field]) {
                    console.log(`Processing document: ${field}`, req.files[field][0].path);
                    employeeData.documents[field] = req.files[field][0].path;
                }
                // Handle existing URL from body
                else if (req.body[field]) {
                    // Check if it's an empty object (which causes CastError)
                    if (typeof req.body[field] === 'object' && Object.keys(req.body[field]).length === 0) {
                        // Do not add to documents
                    } else {
                        employeeData.documents[field] = req.body[field];
                    }
                }
            });
        }

        // Handle Bank Details
        if (req.body.bank_accountNumber) {
            employeeData.bankDetails = {
                accountNumber: req.body.bank_accountNumber,
                accountHolderName: req.body.bank_accountHolderName,
                ifscCode: req.body.bank_ifscCode,
                branchName: req.body.bank_branchName
            };
        }

        // Create or Link User Account
        let user = await User.findOne({ email: employeeData.email });
        if (!user) {
            // Generate random secure password (8 chars)
            const randomPassword = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 10).toString() + '!';

            // Create new user with random password
            user = await User.create({
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email,
                password: randomPassword,
                role: 'employee'
            });
            logger.info(`New user account created for employee: ${employeeData.email}`);

            // Send Welcome Email with credentials
            try {
                const nodemailer = require('nodemailer');
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: employeeData.email,
                    subject: 'Welcome to HRM System - Your Login Credentials',
                    text: `Hello ${employeeData.firstName},\n\nYour employee account has been successfully created.\n\nHere are your login credentials:\n\nEmail: ${employeeData.email}\nTemporary Password: ${randomPassword}\n\nPlease logging in, we recommend you change your password.\n\nRegards,\nHR Team`
                };

                await transporter.sendMail(mailOptions);
                logger.info(`Welcome email sent to ${employeeData.email}`);
            } catch (emailError) {
                logger.error('Failed to send welcome email:', emailError);
                // We don't verify connection here to not block flow, but logged error will help debug
            }
        }

        // Link User ID to Employee
        employeeData.userId = user._id;

        const employee = await Employee.create(employeeData);
        logger.info(`New employee created: ${employee.employeeId}`);
        return successResponse(res, { employee }, 'Employee created successfully', 201);
    } catch (error) {
        logger.error('Create employee error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Handle profile image from FormData
        console.log('Update Files received:', req.files);
        console.log('Update Body received:', req.body);

        // Check if Department already has a Manager (if this employee is being set as Manager)
        if (updateData.position && updateData.position.toLowerCase() === 'manager') {
            let targetDepartment = updateData.department;

            // If department not provided in update, fetch from existing employee
            if (!targetDepartment) {
                const existingEmployee = await Employee.findById(req.params.id);
                if (!existingEmployee) {
                    return errorResponse(res, 'Employee not found', 404);
                }
                targetDepartment = existingEmployee.department;
            }

            const existingManager = await Employee.findOne({
                department: targetDepartment,
                position: { $regex: /^manager$/i },
                isActive: true,
                _id: { $ne: req.params.id } // Exclude current employee
            });
            if (existingManager) {
                return errorResponse(res, 'Manager exists for this department', 400);
            }
        }

        if (req.files && req.files.profileImage) {
            updateData.profileImage = req.files.profileImage[0].path;
        }

        // Handle document uploads and existing URLs
        if (req.files || Object.keys(req.body).some(key => [
            'tenthMarksheet', 'twelfthMarksheet', 'degreeCertificate',
            'consolidatedMarksheet', 'provisionalCertificate', 'aadharCard',
            'panCard', 'resume'
        ].includes(key))) {
            // Fetch existing employee to preserve existing documents
            const existingEmployee = await Employee.findById(req.params.id);
            if (!existingEmployee) {
                return errorResponse(res, 'Employee not found', 404);
            }

            // Initialize documents with existing ones or empty object
            const currentDocuments = existingEmployee.documents ? existingEmployee.documents.toObject() : {};

            // We will build the new documents object based on current + updates
            updateData.documents = { ...currentDocuments };

            const docFields = [
                'tenthMarksheet', 'twelfthMarksheet', 'degreeCertificate',
                'consolidatedMarksheet', 'provisionalCertificate', 'aadharCard',
                'panCard', 'resume'
            ];

            docFields.forEach(field => {
                // Handle new file upload
                if (req.files && req.files[field]) {
                    console.log(`Processing update document: ${field}`, req.files[field][0].path);
                    updateData.documents[field] = req.files[field][0].path;
                }
                // Handle existing URL from body
                else if (req.body[field]) {
                    if (typeof req.body[field] === 'string' && req.body[field].trim() !== '') {
                        updateData.documents[field] = req.body[field];
                    }
                }
            });

            // Remove top-level document fields from updateData to avoid duplication/conflicts
            docFields.forEach(field => {
                delete updateData[field];
            });
        }

        // Handle Bank Details
        if (req.body.bank_accountNumber) {
            updateData.bankDetails = {
                accountNumber: req.body.bank_accountNumber,
                accountHolderName: req.body.bank_accountHolderName,
                ifscCode: req.body.bank_ifscCode,
                branchName: req.body.bank_branchName
            };
        }

        // Emergency contact fields are already in the correct format from frontend
        // No need to transform them

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        // Sync Profile Image to User if updated
        if (employee && employee.userId && updateData.profileImage) {
            await User.findByIdAndUpdate(employee.userId, {
                profilePicture: updateData.profileImage
            });
        }
        if (!employee) {
            return errorResponse(res, 'Employee not found', 404);
        }
        logger.info(`Employee updated: ${employee.employeeId}`);
        return successResponse(res, { employee }, 'Employee updated successfully');
    } catch (error) {
        logger.error('Update employee error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        // Find the employee first to get userId
        const employeeToDelete = await Employee.findById(req.params.id);

        if (!employeeToDelete) {
            return errorResponse(res, 'Employee not found', 404);
        }

        // Hard delete the employee
        await Employee.findByIdAndDelete(req.params.id);

        // Also delete the associated User account if it exists
        if (employeeToDelete.userId) {
            await User.findByIdAndDelete(employeeToDelete.userId);
            logger.info(`Associated User account deleted for employee: ${employeeToDelete.employeeId}`);
        } else if (employeeToDelete.email) {
            // Fallback: try to find user by email
            await User.findOneAndDelete({ email: employeeToDelete.email });
        }

        logger.info(`Employee permanently deleted: ${employeeToDelete.employeeId}`);
        return successResponse(res, null, 'Employee permanently deleted');
    } catch (error) {
        logger.error('Delete employee error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, 'No file uploaded', 400);
        }
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { profileImage: req.file.path },
            { new: true }
        );
        if (!employee) {
            return errorResponse(res, 'Employee not found', 404);
        }

        // Sync to User Model for usage in Chat/Auth
        if (employee.userId) {
            await User.findByIdAndUpdate(employee.userId, {
                profilePicture: req.file.path
            });
        }

        return successResponse(res, { employee }, 'Profile image uploaded successfully');
    } catch (error) {
        logger.error('Upload profile image error:', error);
        return errorResponse(res, error.message, 500);
    }
};

const { generateLetterPDF } = require('../../services/pdf.service');
const GeneratedLetter = require('../../models/Recruitment/GeneratedLetter');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

exports.generateLetter = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            templateId,
            designId,
            letterType,
            // Overrides
            employeeName,
            designation,
            joiningDate,
            lastWorkingDay,
            bodyContent,
            hrName
        } = req.body;

        const employee = await Employee.findById(id);
        if (!employee) {
            return errorResponse(res, 'Employee not found', 404);
        }

        // Prepare Data
        const data = {
            designId,
            name: employeeName || `${employee.firstName} ${employee.lastName}`,
            email: employee.email,
            role: designation || employee.position,
            designation: designation || employee.position,
            joiningDate: joiningDate ? new Date(joiningDate).toLocaleDateString() : (employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : ''),
            lastWorkingDay: lastWorkingDay ? new Date(lastWorkingDay).toLocaleDateString() : '',
            hrName: hrName || (req.user ? `${req.user.firstName} ${req.user.lastName}` : 'HR Manager'),
            bodyContent: bodyContent || '',
            // Calc fields
            experience_duration: '', // Specific logic below
            current_date: new Date().toLocaleDateString()
        };

        // Experience Duration Calculation
        if (data.joiningDate && data.lastWorkingDay) {
            const start = new Date(joiningDate || employee.joiningDate);
            const end = new Date(lastWorkingDay);

            let years = end.getFullYear() - start.getFullYear();
            let months = end.getMonth() - start.getMonth();

            if (months < 0 || (months === 0 && end.getDate() < start.getDate())) {
                years--;
                months += 12;
            }
            if (end.getDate() < start.getDate()) {
                months--;
            }

            let durationStr = "";
            if (years > 0) durationStr += `${years} Year${years > 1 ? 's' : ''} `;
            if (months > 0) durationStr += `${months} Month${months !== 1 ? 's' : ''}`;

            if (!durationStr) durationStr = "Less than a month";
            data.experience_duration = durationStr.trim();
        }

        // Generate PDF
        let templateIdToPass = null;
        if (mongoose.Types.ObjectId.isValid(designId) && designId.match(/^[0-9a-fA-F]{24}$/)) {
            templateIdToPass = designId;
        }

        const pdfBuffer = await generateLetterPDF(templateIdToPass, data);

        // 1. Upload to Cloudinary (Wrapped in Promise)
        const cloudinary = require('cloudinary').v2;

        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'employee_letters',
                        resource_type: 'raw', // Important for PDF
                        public_id: `${letterType.replace(/\s+/g, '_')}_${employee.employeeId}_${Date.now()}`,
                        format: 'pdf'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                // Fix: Direct write instead of pipe to avoid chunk type errors
                uploadStream.end(pdfBuffer);
            });
        };

        try {
            // Await Upload
            const result = await uploadToCloudinary();

            // 2. Update Employee Record
            const letterEntry = {
                name: `${letterType} - ${new Date().toLocaleDateString()}`,
                type: letterType,
                url: result.secure_url,
                generatedAt: new Date()
            };

            await Employee.findByIdAndUpdate(id, {
                $push: { employeeLetters: letterEntry }
            });

            logger.info(`Letter saved to employee profile: ${employee.employeeId}`);

            // 3. Send Email
            const emailService = require('../../services/email.service');
            await emailService.sendOfferLetterEmail(
                { name: data.name, email: data.email },
                { role: data.role },
                pdfBuffer,
                letterType
            );
            logger.info(`Letter emailed to employee: ${data.email}`);

            // Return Success JSON
            return successResponse(res, { url: result.secure_url }, 'Letter generated, saved, and emailed successfully.');

        } catch (processError) {
            console.error("Error in processing letter:", processError);
            return errorResponse(res, "Failed to process letter: " + processError.message, 500);
        }

    } catch (error) {
        logger.error('Generate Employee Letter Error:', error);
        return errorResponse(res, error.message, 500);
    }
};