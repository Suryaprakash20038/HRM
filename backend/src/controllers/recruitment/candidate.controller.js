const Candidate = require('../../models/Recruitment/Candidate');
const JobDescription = require('../../models/Recruitment/JobDescription'); // Added for ATS matching
const mongoose = require('mongoose');
const { successResponse, errorResponse } = require('../../utils/response');
const emailService = require('../../services/email.service');
const { generateLetterPDF } = require('../../services/pdf.service');
const recruitmentService = require('../../services/recruitment.service');
const logger = require('../../utils/logger');
const fs = require('fs');
const path = require('path');
const GeneratedLetter = require('../../models/Recruitment/GeneratedLetter');

// Helper to Process Resume Data internally
const processMyResume = async (candidateData) => {
    try {
        if (candidateData.resumeBase64) {
            // Remove header (data:application/pdf;base64,) if present
            const parts = candidateData.resumeBase64.split(';base64,');
            const base64Data = parts.length > 1 ? parts.pop() : candidateData.resumeBase64;
            // Basic detection
            const mimeType = candidateData.resumeBase64.startsWith('data:image') ? 'image/png' : 'application/pdf'; // Rough fallback

            const buffer = Buffer.from(base64Data, 'base64');

            // 1. Extract Text
            const resumeText = await recruitmentService.extractTextFromResume(buffer, mimeType);
            candidateData.resumeText = resumeText;

            if (resumeText) {
                // 2. Analyze Resume
                const parsedData = recruitmentService.analyzeResume(resumeText);

                // Merge Parsed Data
                candidateData.extractedSkills = parsedData.extractedSkills;
                candidateData.extractedExperience = parsedData.extractedExperience;
                // Directly assign arrays from parsed data
                candidateData.projects = parsedData.projects || [];
                candidateData.certifications = parsedData.certifications || [];
                candidateData.companies = parsedData.companies || [];
                candidateData.internships = parsedData.internships || [];
                candidateData.isFresher = parsedData.isFresher;

                // 3. Find JD & Calculate Score
                if (candidateData.appliedFor) {
                    const jd = await JobDescription.findOne({
                        $or: [
                            { title: { $regex: new RegExp(`^${candidateData.appliedFor}$`, 'i') } },
                            { role: { $regex: new RegExp(`^${candidateData.appliedFor}$`, 'i') } },
                            { title: { $regex: new RegExp(candidateData.appliedFor, 'i') } }
                        ],
                        status: 'Active'
                    });

                    if (jd) {
                        const atsResult = recruitmentService.calculateATSScore(resumeText, jd, parsedData);
                        candidateData.atsScore = atsResult.score;
                        candidateData.atsScoreBreakdown = atsResult.breakdown;
                        candidateData.matchedSkills = atsResult.matchedSkills;
                        candidateData.missingSkills = atsResult.missingSkills;
                        candidateData.jobDescription = jd._id;
                        candidateData.status = candidateData.status === 'New' ? 'New' : candidateData.status; // Keep existing if not new
                    } else {
                        candidateData.atsScore = 0;
                        candidateData.status = 'JD Not Available';
                    }
                }
            }
        }
    } catch (e) {
        logger.error("Resume processing failed during manual save", e);
    }
};

exports.syncCandidatesFromGoogle = async (req, res) => {
    try {
        const { spreadsheetId, range } = req.body;
        if (!spreadsheetId) {
            return errorResponse(res, 'Spreadsheet ID is required', 400);
        }

        const result = await recruitmentService.syncCandidates(spreadsheetId, range || 'Form Responses 1!A1:Z');
        return successResponse(res, result, 'Sync completed');
    } catch (error) {
        logger.error('Sync Candidates Error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.createCandidate = async (req, res) => {
    try {
        const candidateData = req.body;
        // Default status to 'New' if not provided
        if (!candidateData.status) candidateData.status = 'New';

        // Process Resume if provided
        if (candidateData.resumeBase64) {
            await processMyResume(candidateData);
        }

        const candidate = await Candidate.create(candidateData);

        logger.info(`New candidate created: ${candidate.name} (${candidate.email})`);

        // Send Welcome/Application Received Email
        await emailService.sendCandidateStatusEmail(candidate);

        return successResponse(res, { candidate }, 'Candidate added successfully', 201);
    } catch (error) {
        logger.error('Create candidate error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ createdAt: -1 });
        return successResponse(res, { candidates }, 'Candidates retrieved successfully');
    } catch (error) {
        logger.error('Get candidates error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.updateCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const candidate = await Candidate.findById(id);
        if (!candidate) {
            return errorResponse(res, 'Candidate not found', 404);
        }

        const oldStatus = candidate.status;
        const newStatus = updateData.status;

        // Process Resume if changed
        if (updateData.resumeBase64) {
            await processMyResume(updateData);
        } else if (candidate.resumeText) {
            // FORCE RE-PARSE of existing text (to apply new parser improvements)
            const parsedData = recruitmentService.analyzeResume(candidate.resumeText);

            // Update Fields
            candidate.extractedSkills = parsedData.extractedSkills;
            candidate.extractedExperience = parsedData.extractedExperience;
            candidate.projects = parsedData.projects || [];
            candidate.certifications = parsedData.certifications || [];
            candidate.companies = parsedData.companies || [];
            candidate.internships = parsedData.internships || [];
            candidate.isFresher = parsedData.isFresher;

            // Re-calculate Score if Applied Role exists
            const appliedRole = updateData.appliedFor || candidate.appliedFor;
            if (appliedRole) {
                const jd = await JobDescription.findOne({
                    $or: [
                        { title: { $regex: new RegExp(`^${appliedRole}$`, 'i') } },
                        { role: { $regex: new RegExp(`^${appliedRole}$`, 'i') } },
                        { title: { $regex: new RegExp(appliedRole, 'i') } }
                    ],
                    status: 'Active'
                });
                if (jd) {
                    const atsResult = recruitmentService.calculateATSScore(candidate.resumeText, jd, parsedData);
                    candidate.atsScore = atsResult.score;
                    candidate.atsScoreBreakdown = atsResult.breakdown;
                    candidate.matchedSkills = atsResult.matchedSkills;
                    candidate.missingSkills = atsResult.missingSkills;
                }
            }
        }

        // Update fields
        Object.assign(candidate, updateData);
        await candidate.save();

        logger.info(`Candidate updated: ${candidate.name}`);

        // If status changed, send email
        if (newStatus && newStatus !== oldStatus) {
            logger.info(`Sending status update email to ${candidate.email} for status: ${newStatus}`);
            await emailService.sendCandidateStatusEmail(candidate);
        }

        return successResponse(res, { candidate }, 'Candidate updated successfully');

    } catch (error) {
        logger.error('Update candidate error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.deleteCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findByIdAndDelete(req.params.id);
        if (!candidate) {
            return errorResponse(res, 'Candidate not found', 404);
        }
        return successResponse(res, null, 'Candidate deleted successfully');
    } catch (error) {
        logger.error('Delete candidate error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.sendOfferLetter = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            templateId,
            designId, // New: Design ID
            letterType, // New: Letter Type (Offer, Appointment, etc)
            role,
            salary,
            joiningDate,
            expiryDate,
            interviewDate,
            interviewTime,
            interviewMode,
            interviewLink,
            interviewLocation,
            interviewRound,
            // Generic fields
            hrName,
            bodyContent,
            employeeName,
            designation,
            lastWorkingDay
        } = req.body;

        const candidate = await Candidate.findById(id);
        if (!candidate) {
            return errorResponse(res, 'Candidate not found', 404);
        }

        // --- NEW FLOW: FIXED DESIGN TEMPLATE ---
        if (designId) {
            logger.info(`Generating ${letterType} (${designId}) for ${candidate.name}`);

            const data = {
                designId,
                name: employeeName || candidate.name,
                email: candidate.email,
                role: designation || role || candidate.appliedFor,
                designation: designation || role || candidate.appliedFor,
                salary: salary || candidate.expectedSalary,
                joiningDate: joiningDate ? new Date(joiningDate).toLocaleDateString() : '',
                lastWorkingDay: lastWorkingDay ? new Date(lastWorkingDay).toLocaleDateString() : '',
                hrName: hrName || (req.user ? `${req.user.firstName} ${req.user.lastName}` : 'HR Manager'),
                bodyContent: bodyContent,

                // Interview Details
                interviewDate: interviewDate ? new Date(interviewDate).toLocaleDateString() : '',
                interviewTime,
                interviewMode,
                interviewLocation,
                interviewLink: interviewLink || interviewLocation // Fallback
            };

            // --- Experience / Relieving Logic ---
            if (letterType === 'Experience' || letterType === 'Relieving') {
                if (!joiningDate || !lastWorkingDay) {
                    // Although validated on frontend, double check here
                    console.warn("Generating Experience/Relieving letter without full dates");
                }

                // Calculate Duration
                if (joiningDate && lastWorkingDay) {
                    const start = new Date(joiningDate);
                    const end = new Date(lastWorkingDay);

                    let years = end.getFullYear() - start.getFullYear();
                    let months = end.getMonth() - start.getMonth();

                    if (months < 0 || (months === 0 && end.getDate() < start.getDate())) {
                        years--;
                        months += 12;
                    }

                    // Adjust months if days are negative (approximate)
                    if (end.getDate() < start.getDate()) {
                        months--;
                    }

                    // Format duration string
                    let durationStr = "";
                    if (years > 0) durationStr += `${years} Year${years > 1 ? 's' : ''} `;
                    if (months > 0) durationStr += `${months} Month${months !== 1 ? 's' : ''}`;

                    if (!durationStr) durationStr = "Less than a month";

                    data.experience_duration = durationStr.trim();
                    data.joining_date = start.toLocaleDateString(); // Ensure formatted date is passed
                    data.last_working_day = end.toLocaleDateString();
                }
            }

            // Generate PDF
            // Determine if designId is a Database Template ID (Mongo ID)
            let templateIdToPass = null;
            if (mongoose.Types.ObjectId.isValid(designId) && designId.match(/^[0-9a-fA-F]{24}$/)) {
                // It's a database template (Custom or Uploaded PDF)
                templateIdToPass = designId;
            }

            // Pass templateIdToPass (it handles fallback logic inside service if null)
            let pdfBuffer;
            try {
                pdfBuffer = await generateLetterPDF(templateIdToPass, data);
            } catch (err) {
                logger.error("PDF Generation Failed:", err);
                if (err.message.includes('401') || err.message.toLowerCase().includes('overlay')) {
                    return errorResponse(res, 'The uploaded PDF template is not accessible due to a permission update. Please DELETE this template and UPLOAD it again.', 400);
                }
                throw err;
            }

            // Send Email
            // Determine type for email subject/content
            const type = letterType || 'Offer';
            await emailService.sendOfferLetterEmail(candidate, {
                role: data.role,
                expiryDate: expiryDate || new Date().toISOString()
            }, pdfBuffer, type);

            // Update Status
            if (type.includes('Interview') || type.includes('Round')) {
                candidate.status = 'Interviewing';
                candidate.interviewDetails = {
                    date: interviewDate || null,
                    time: interviewTime,
                    mode: interviewMode,
                    location: interviewLocation,
                    round: interviewRound
                };
                await candidate.save();
            } else if (type.includes('Offer')) {
                candidate.status = 'Selected';
                // Also update offer details if available in new flow
                if (salary || joiningDate) {
                    candidate.offerDetails = {
                        ctc: salary || candidate.expectedSalary,
                        joiningDate: joiningDate || null,
                        sentAt: new Date()
                    };
                }
                await candidate.save();
            }

            return successResponse(res, null, `${type} generated and sent successfully`);
        }

        // --- OLD FLOW: DB TEMPLATES (Including Universal PDF Templates) ---
        const LetterTemplate = require('../../models/Recruitment/LetterTemplate');
        const template = await LetterTemplate.findById(templateId);

        if (!template) {
            // Check if it's a fixed design ID passed as templateId by mistake
            if (req.body.designId) {
                return errorResponse(res, 'Invalid configuration. Design ID provided but fell through to Template ID flow.', 400);
            }
            return errorResponse(res, 'Template not found', 404);
        }

        // For Universal templates, use the letterType from request; otherwise use template's type
        const effectiveLetterType = template.type === 'Universal' ? (letterType || 'Offer') : template.type;

        logger.info(`Generating Letter (${effectiveLetterType}) for ${candidate.name}`);

        // Prepare Data for PDF
        const data = {
            name: candidate.name,
            email: candidate.email,
            role: role || candidate.appliedFor,
            salary: salary || candidate.expectedSalary,
            joiningDate: joiningDate ? new Date(joiningDate).toLocaleDateString() : '',
            expiryDate: expiryDate ? new Date(expiryDate).toLocaleDateString() : '',
            interviewDate: interviewDate ? new Date(interviewDate).toLocaleDateString() : '',
            interviewTime: interviewTime || '',
            interviewMode: interviewMode || '',
            interviewLink: interviewLink || '',
            interviewLocation: interviewLocation || '',
            hrName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'HR Manager'
        };


        // Generate PDF Buffer (pass letterType for Universal templates)
        const pdfBuffer = await generateLetterPDF(templateId, data, effectiveLetterType);

        // --- NEW: Save Generated PDF Locally ---
        const generatedDir = path.join('uploads', 'generated');
        if (!fs.existsSync(generatedDir)) {
            fs.mkdirSync(generatedDir, { recursive: true });
        }

        const generatedFileName = `${effectiveLetterType.replace(/\s+/g, '_')}_${candidate.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        const generatedPath = path.join(generatedDir, generatedFileName);

        try {
            fs.writeFileSync(generatedPath, pdfBuffer);
            console.log('✅ Generated PDF Saved:', generatedPath);

            // --- NEW: Save History Record ---
            await GeneratedLetter.create({
                templateId: template._id,
                candidateId: candidate._id,
                letterType: effectiveLetterType,
                fieldsData: data,
                generatedPath: generatedPath,
                sentBy: req.user._id
            });

        } catch (saveErr) {
            console.error('Error saving generated PDF:', saveErr);
            // Non-critical, continue with sending email
        }

        // Send Email with Attachment (use effectiveLetterType for dynamic content)
        await emailService.sendOfferLetterEmail(candidate, {
            role: data.role,
            expiryDate: data.expiryDate || new Date().toISOString()
        }, pdfBuffer, effectiveLetterType);



        // Update Candidate Status based on Letter Type
        let statusChanged = false;
        if (effectiveLetterType === 'Interview Call' || effectiveLetterType === 'Next Round' || effectiveLetterType.toLowerCase().includes('interview')) {
            candidate.status = 'Interviewing';
            candidate.interviewDetails = {
                date: interviewDate || null,
                time: interviewTime,
                mode: interviewMode,
                link: interviewLink,
                location: interviewLocation,
                round: interviewRound
            };
            statusChanged = true;
        } else if (effectiveLetterType === 'Offer' || effectiveLetterType.toLowerCase().includes('offer')) {
            candidate.status = 'Selected';
            // Save Offer Details for frontend display
            candidate.offerDetails = {
                ctc: salary || candidate.expectedSalary, // Use raw salary, not data.ctc (which is missing)
                joiningDate: joiningDate || null
            };
            statusChanged = true;
        } else if (effectiveLetterType === 'Appointment') {
            // New: Mark Appointment as Sent
            candidate.appointmentDetails = {
                sent: true,
                sentAt: new Date(),
                ctc: salary || candidate.expectedSalary,
                joiningDate: joiningDate || null
            };
            // Note: We don't change status from 'Selected' as they are already selected
            statusChanged = true;
        } else if (effectiveLetterType === 'Rejection') {
            candidate.status = 'Rejected';
            statusChanged = true;
        }

        if (statusChanged) {
            await candidate.save(); // Mongoose will handle schema updates if fields are defined schema-less or strict: false
        }

        return successResponse(res, null, `${effectiveLetterType} generated and sent successfully`);
    } catch (error) {
        logger.error('Send Letter Error:', error);
        console.error('Full Error Trace:', error); // Log stack trace
        return errorResponse(res, error.message || 'Internal Server Error', 500);
    }
};
