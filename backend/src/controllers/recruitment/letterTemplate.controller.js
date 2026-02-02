const LetterTemplate = require('../../models/Recruitment/LetterTemplate');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Get all templates
exports.getAllTemplates = async (req, res) => {
    try {
        const templates = await LetterTemplate.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: templates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create new template
exports.createTemplate = async (req, res) => {
    try {
        const { name, type, subject, bodyContent, variables } = req.body;

        const newTemplate = await LetterTemplate.create({
            name,
            type,
            subject,
            bodyContent,
            variables,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, message: 'Template created successfully', data: newTemplate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Upload and convert PDF template (LOCALLY)
exports.uploadTemplate = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // 1. Prepare Local Path
        const templatesDir = path.join('uploads', 'templates');
        if (!fs.existsSync(templatesDir)) {
            fs.mkdirSync(templatesDir, { recursive: true });
        }

        const fileName = `template-${Date.now()}${path.extname(req.file.originalname)}`;
        const localPath = path.join(templatesDir, fileName);

        // 2. Move file to templates directory
        try {
            // If file is already in a temp location (from multer), move it
            fs.copyFileSync(req.file.path, localPath);
            fs.unlinkSync(req.file.path); // Remove temp file
        } catch (moveErr) {
            console.error("Move Error:", moveErr);
            // Fallback - maybe it's already there or something, but better fail safely
            throw new Error("Failed to save template locally");
        }

        console.log('✅ Local Template Saved:', localPath);

        // 3. Create Template Record (Universal/Generic PDF Template)
        const newTemplate = await LetterTemplate.create({
            name: `Company Letterhead ${new Date().toLocaleDateString()} ${Date.now().toString().slice(-4)}`,
            type: 'Universal', // Universal template for all letter types
            subject: 'Universal Letter Template',
            bodyContent: 'Universal PDF Template - Can be used for all letter types. Title will be added automatically.',
            variables: [],
            isFixedPdf: true,
            localPath: localPath, // 🔥 Save Local Path
            pdfUrl: null,  // Cloudinary URL (legacy/unused)
            publicId: null,
            resourceType: 'local',
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, message: 'PDF uploaded locally as fixed template', data: newTemplate });

    } catch (error) {
        console.error("Template Upload Error:", error);
        // Cleanup
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Failed to process PDF: ' + error.message });
    }
};

// Update template
exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const template = await LetterTemplate.findById(id);
        if (!template) return res.status(404).json({ success: false, message: 'Template not found' });

        if (template.isLocked && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'This template is locked and can only be edited by Admin.' });
        }

        const updatedTemplate = await LetterTemplate.findByIdAndUpdate(id, updates, { new: true });
        res.status(200).json({ success: true, message: 'Template updated', data: updatedTemplate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Preview template (Stream file)
exports.previewTemplate = async (req, res) => {
    try {
        const template = await LetterTemplate.findById(req.params.id);
        if (!template || !template.localPath) {
            return res.status(404).json({ success: false, message: 'Template file not found' });
        }

        if (!fs.existsSync(template.localPath)) {
            return res.status(404).json({ success: false, message: 'Physical file missing on server' });
        }

        // Stream file to response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${template.name}.pdf"`);

        const fileStream = fs.createReadStream(template.localPath);
        fileStream.pipe(res);

    } catch (error) {
        console.error("Preview Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
    try {
        const template = await LetterTemplate.findById(req.params.id);
        if (template && template.localPath && fs.existsSync(template.localPath)) {
            // Delete local file
            fs.unlinkSync(template.localPath);
        }

        await LetterTemplate.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Template deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DIRECT UPLOAD & SEND (No Template Creation)
exports.uploadAndSendDirect = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { employeeId, letterType } = req.query;
        if (!employeeId) return res.status(400).json({ success: false, message: 'Employee ID required' });

        const Employee = require('../../models/Employee/Employee');
        const emailService = require('../../services/email.service');
        const cloudinary = require('cloudinary').v2;
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

        // 1. Upload to Cloudinary directly
        const uploadToCloudinary = (buffer) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'employee_letters',
                        resource_type: 'raw',
                        public_id: `${letterType || 'DirectUpload'}_${employee.employeeId}_${Date.now()}`,
                        format: 'pdf'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(buffer);
            });
        };

        // Read file buffer (since multer saved it to disk temporarily or memory)
        // If multer storage is disk:
        const fileBuffer = fs.readFileSync(req.file.path);

        // Upload
        const result = await uploadToCloudinary(fileBuffer);

        // 2. Save Reference
        const letterEntry = {
            name: `${letterType || 'Letter'} - ${new Date().toLocaleDateString()} (Uploaded)`,
            type: letterType || 'Manual Upload',
            url: result.secure_url,
            generatedAt: new Date()
        };

        await Employee.findByIdAndUpdate(employeeId, {
            $push: { employeeLetters: letterEntry }
        });

        // 3. Send Email
        await emailService.sendOfferLetterEmail(
            { name: `${employee.firstName} ${employee.lastName}`, email: employee.email },
            { role: employee.position },
            fileBuffer,
            letterType || 'Letter'
        );

        // Cleanup temp file
        if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.status(200).json({ success: true, message: 'PDF Sent and Saved successfully', url: result.secure_url });

    } catch (error) {
        console.error("Direct Send Error:", error);
        if (req.file && req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: 'Failed to send PDF: ' + error.message });
    }
};
