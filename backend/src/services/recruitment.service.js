const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const mongoose = require('mongoose');
const Tesseract = require('tesseract.js'); // OCR
const fs = require('fs');
const path = require('path');

const JobDescription = require('../models/Recruitment/JobDescription');
const Candidate = require('../models/Recruitment/Candidate');
const googleService = require('./google.service');
const storageService = require('./storage.service');
const logger = require('../utils/logger');

// --- Resume Parsing ---

/**
 * Extract text from Resume Buffer based on MimeType
 * @param {Buffer} buffer 
 * @param {string} mimeType 
 * @returns {Promise<string>}
 */
const extractTextFromResume = async (buffer, mimeType) => {
    try {
        if (mimeType === 'application/pdf') {
            const data = await pdfParse(buffer);
            let text = data.text;

            // OCR Fallback for Scanned PDFs
            if (!text || text.trim().length < 50) {
                logger.info('Short text detected in PDF. Attempting OCR with Tesseract...');

                try {
                    // Write buffer to temp file for PDF processing
                    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
                    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

                    const tempFile = path.join(tempDir, `ocr_${Date.now()}.pdf`);
                    fs.writeFileSync(tempFile, buffer);

                    let ocrText = '';

                    // Dynamic import for pdf-to-img (ESM)
                    const { pdf } = await import('pdf-to-img');

                    // Convert PDF to images (scale 2.0 for better accuracy)
                    // Note: This relies on system 'pdftoppm' (Poppler)
                    const document = await pdf(tempFile, { scale: 2.0 });

                    let pageCount = 0;
                    for await (const image of document) {
                        pageCount++;
                        if (pageCount > 2) break; // Limit pages for performance

                        logger.info(`OCR Processing Page ${pageCount}...`);
                        const result = await Tesseract.recognize(image, 'eng');
                        ocrText += result.data.text + '\n';
                    }

                    // Cleanup
                    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

                    if (ocrText.trim().length > 50) {
                        logger.info(`OCR Success! Extracted ${ocrText.length} characters.`);
                        return ocrText;
                    } else {
                        logger.warn('OCR produced little or no text. (Check Poppler installation if on Windows)');
                    }

                } catch (ocrError) {
                    logger.error(`OCR Failed: ${ocrError.message}`);
                    logger.warn('For Scanned PDFs on Windows, "Poppler" is required in system PATH.');
                }
                return ''; // Return empty if OCR fails
            }
            return text;
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // docx
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else if (mimeType && mimeType.startsWith('image/')) {
            // Native Tesseract support for Images
            logger.info('Image resume detected. Running OCR...');
            const result = await Tesseract.recognize(buffer, 'eng');
            return result.data.text;
        } else {
            logger.warn('Unsupported resume format for text extraction:', mimeType);
            return '';
        }
    } catch (error) {
        logger.error('Error extracting text from resume:', error);
        return '';
    }
};

// --- Resume Parsing & Analysis ---

/**
 * Parsed Resume Data Structure
 * @typedef {Object} ParsedResume
 * @property {string[]} skills
 * @property {number} experienceYears
 * @property {Object[]} companies
 * @property {Object[]} projects
 * @property {Object[]} certifications
 * @property {Object[]} internships
 * @property {boolean} isFresher
 */

/**
 * Analyze Resume Text to Extract Structured Data
 * @param {string} text 
 * @returns {ParsedResume}
 */
const analyzeResume = (text) => {
    if (!text) return null;
    const cleanText = text.replace(/\r\n/g, '\n');
    const lowerText = cleanText.toLowerCase();

    // 1. Defining Section Keywords
    const sections = {
        skills: ['technical skills', 'skills', 'core competencies', 'technologies', 'skill set', 'tech stack'],
        experience: ['work experience', 'professional experience', 'experience', 'work history', 'employment history', 'career summary', 'employment'],
        projects: ['projects', 'academic projects', 'key projects', 'project details', 'personal projects'],
        education: ['education', 'academic qualifications', 'qualifications', 'academic background'],
        certifications: ['certifications', 'courses', 'certificates', 'achievements', 'awards', 'certification'],
        internships: ['internships', 'industrial training', 'internship', 'summer internship']
    };

    /**
     * Advanced Section Segmentation Strategy:
     * 1. Find ALL occurrences of ALL section headers.
     * 2. Store them as { key: 'experience', index: 120, label: 'Work Experience' }.
     * 3. Sort by index.
     * 4. The content of a section matches the text between its index and the next section's index.
     */

    const foundSections = [];
    const allKeys = Object.entries(sections); // [['skills', []], ...]

    allKeys.forEach(([sectionKey, keywords]) => {
        keywords.forEach(keyword => {
            // Match keyword at start of line or preceded by newlines
            // Using a slightly more relaxed regex to catch headers that might not be perfect
            const regex = new RegExp(`(^|\\n)\\s*${keyword}\\s*[:\\-]?\\s*(\\n|$)`, 'gi');
            let match;
            while ((match = regex.exec(cleanText)) !== null) {
                // We found a potential header
                // Verify it's not part of a sentence? e.g. "I have experience in..."
                const matchLen = match[0].trim().length;
                if (matchLen < 60) {
                    foundSections.push({
                        key: sectionKey,
                        index: match.index,
                        raw: match[0],
                        debug: match[0].trim()
                    });
                }
            }
        });
    });


    // Validating intersections and overlaps: if "Project" and "Key Projects" both match at same index, pick longest
    // Actually, we just sort them. Small overlaps shouldn't matter if we handle logic right.
    foundSections.sort((a, b) => a.index - b.index);

    // Filter duplicates/overlaps (greedy approach: if two start near same spot, take first or longest)
    const uniqueSections = [];
    if (foundSections.length > 0) {
        uniqueSections.push(foundSections[0]);
        for (let i = 1; i < foundSections.length; i++) {
            const prev = uniqueSections[uniqueSections.length - 1];
            const curr = foundSections[i];
            // If current starts within previous's range (heuristic overlap)
            if (curr.index < prev.index + prev.raw.length) {
                // keep the one with longer keyword maybe? or just skip
                continue;
            }
            uniqueSections.push(curr);
        }
    }

    // Now extract content
    const extractedData = {};
    uniqueSections.forEach((section, i) => {
        const start = section.index + section.raw.length;
        const end = (i < uniqueSections.length - 1) ? uniqueSections[i + 1].index : cleanText.length;
        const content = cleanText.substring(start, end).trim();

        // Append if multiple headers map to same key (e.g. Experience repeated?)
        // Usually resumes have one block. We'll verify.
        if (extractedData[section.key]) {
            extractedData[section.key] += '\n' + content;
        } else {
            extractedData[section.key] = content;
        }
    });

    // --- Helper Parsing Logic for Blocks ---

    // Experience Years Extraction (Looking globally first as it's often at top)
    let experienceYears = 0;
    const expMatch = cleanText.match(/Total\s*Experience\s*[:\-]?\s*(\d+(\.\d+)?)/i) ||
        cleanText.match(/(\d+(\.\d+)?)\+?\s*Years\s*of\s*Experience/i);
    if (expMatch) experienceYears = parseFloat(expMatch[1]);


    // Skills Parsing
    let extractedSkills = [];
    if (extractedData.skills) {
        const cleanBlock = extractedData.skills.replace(/Languages[:\-]|Tools[:\-]|Frameworks[:\-]|Database[:\-]|Web Technologies[:\-]/gi, '');
        extractedSkills = cleanBlock
            .split(/[,•\n|]/)
            .map(s => s.trim())
            .filter(s => s && s.length > 1 && s.length < 35 && !/^\d+$/.test(s) && !/skill|experience/i.test(s));
    }

    // Projects Parsing
    const projects = [];
    if (extractedData.projects) {
        const lines = extractedData.projects.split('\n').map(l => l.trim()).filter(l => l);
        let currentProject = null;
        logger.info(`Analyzing Projects Block: ${extractedData.projects.substring(0, 100)}...`);

        lines.forEach(line => {
            // Heuristic: check if line is a bullet point
            const isBullet = /^[•\-\*o\u2022\u2023\u25E6\u2043\u2219\u27A2]/.test(line);

            // Project Title Candidates:
            // 1. Not a bullet AND length > 2 AND has letters
            // 2. IS a bullet BUT contains a colon (e.g. "* Project Name: Description")
            // 3. IS a bullet BUT is short and Title Cased (heuristic)

            let isPotentialTitle = false;
            if (!isBullet && line.length > 2 && /[a-zA-Z]/.test(line)) {
                isPotentialTitle = true;
            } else if (isBullet && line.includes(':') && line.length < 100) {
                isPotentialTitle = true;
            } else if (isBullet && line.length < 50 && !line.includes('.')) {
                // Heuristic: bullet + short text + no period (usually not a sentence) -> might be title
                isPotentialTitle = true;
            }

            if (isPotentialTitle) {
                // Cleanup: Remove bullet if present
                let titleClean = line.replace(/^[•\-\*o\u2022\u2023\u25E6\u2043\u2219\u27A2]\s*/, '').trim();

                // Remove Date from end if present (e.g. Dec 2022 - Jan 2023)
                titleClean = titleClean.replace(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})\s*[-–to]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|Present|Current)/gi, '').trim();

                // Remove Tech Stack separator like " — Python..."
                const separatorMatch = titleClean.match(/ [—–\-:] /);
                if (separatorMatch) {
                    titleClean = titleClean.split(separatorMatch[0])[0].trim();
                }

                if (titleClean.length > 2 && titleClean.length < 100) {
                    if (currentProject) projects.push(currentProject);
                    currentProject = { title: titleClean, description: '' };
                } else if (currentProject) {
                    // Was a bullet but turned out to be noise/description ? 
                    // Treat as description
                    const descPart = line.replace(/^[•\-\*o\u2022\u2023\u25E6\u2043\u2219\u27A2]\s*/, '');
                    currentProject.description += (currentProject.description ? ' \n' : '') + descPart;
                }
            } else if (currentProject) {
                const descPart = line.replace(/^[•\-\*o\u2022\u2023\u25E6\u2043\u2219\u27A2]\s*/, '');
                currentProject.description += (currentProject.description ? ' ' : '') + descPart;
            }
        });
        if (currentProject) projects.push(currentProject);
    }
    logger.info(`Extracted ${projects.length} projects.`);

    // Experience Companies Parsing
    const companies = [];
    if (extractedData.experience) {
        // Regex for dates
        const dateRegex = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*['’]?\d{2,4}|\d{1,2}\/\d{4}|\d{4})\s*[-–to]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*['’]?\d{2,4}|\d{1,2}\/\d{4}|\d{4}|Present|Current|Now)/gi;

        let match;
        const matches = [];
        while ((match = dateRegex.exec(extractedData.experience)) !== null) {
            matches.push({ index: match.index, duration: match[0], end: match.index + match[0].length });
        }

        // Mapping matches to text blocks preceding them
        matches.forEach((m, i) => {
            const rangeStart = (i === 0) ? 0 : matches[i - 1].end;
            const blockBefore = extractedData.experience.substring(rangeStart, m.index).trim();
            const lines = blockBefore.split('\n').filter(l => l.trim().length > 0);

            let company = "Unknown Company";
            let role = "Unknown Role";

            if (lines.length > 0) {
                // If there are multiple lines, assume standard format: Company \n Role
                // Check last few lines
                const lastLine = lines[lines.length - 1];
                const secondLast = lines.length > 1 ? lines[lines.length - 2] : null;

                if (secondLast && secondLast.split(' ').length < 10) { // Check if it's likely a name (short)
                    company = secondLast;
                    role = lastLine;
                } else {
                    // Single line logic
                    const separator = lastLine.match(/ [—–\-|] /);
                    if (separator) {
                        const parts = lastLine.split(separator[0]);
                        role = parts[0].trim();
                        company = parts[1].trim();
                    } else {
                        // Try to guess based on keywords
                        if (/developer|engineer|intern|trainee|manager|lead|consultant/i.test(lastLine)) {
                            role = lastLine;
                            company = secondLast || ""; // Try to grab previous line if possible
                        } else {
                            company = lastLine;
                            role = "";
                        }
                    }
                }
            }

            // New fallback: If company is empty/unknown but we have text AFTER the date, look ahead!
            // Sometimes: Date \n Company \n Role
            if ((company === "Unknown Company" || !company) && extractedData.experience.length > m.end) {
                const blockAfter = extractedData.experience.substring(m.end, m.end + 100).split('\n')[0].trim();
                if (blockAfter && blockAfter.length < 50) {
                    // Only swap if we really failed before
                    if (role === "Unknown Role") {
                        role = "Role/Company (See Description)";
                    }
                    // Actually, parsing lookahead is tricky without iterating forward. 
                    // Let's stick to lookbehind improvements for now.
                }
            }

            // Clean up
            if (role) role = role.replace(/[—–\-]/g, '').trim();
            if (company) company = company.replace(/[—–\-]/g, '').trim();

            companies.push({
                name: company.substring(0, 60),
                role: role.substring(0, 60),
                duration: m.duration,
                domain: "Unknown"
            });
        });
    }

    // Internships aggregation (Fallback to Experience companies if specific block missing or empty)
    const internships = [];
    // 1. Dedicated Section
    if (extractedData.internships) {
        extractedData.internships.split('\n').filter(l => l.trim().length > 3).forEach(line => {
            if (!/internship|page|training/i.test(line)) {
                internships.push({ company: line.substring(0, 80), domain: "Internship", duration: "See Resume" });
            }
        });
    }

    // 2. Scan extracted companies for "Intern" keyword
    companies.forEach(comp => {
        if (/intern|trainee|fresher|student|apprentice|fellow/i.test(comp.role) ||
            /intern|trainee|fresher|student|apprentice|fellow/i.test(comp.name)) {

            const exists = internships.some(i => i.company === comp.name || (comp.name === "" && i.company === comp.role));
            if (!exists) {
                internships.push({
                    company: comp.name || comp.role,
                    domain: comp.role,
                    duration: comp.duration
                });
            }
        }
    });


    // Certifications
    const certifications = [];
    if (extractedData.certifications) {
        extractedData.certifications.split('\n').map(l => l.trim()).filter(l => l.length > 5 && l.length < 100).forEach(l => {
            // Check for dash separator for Issuer
            const separator = l.match(/ [—–-] /);
            let name = l;
            let issuer = '';

            if (separator) {
                const parts = l.split(separator[0]);
                name = parts[0].trim();
                issuer = parts[1].trim();
            }

            certifications.push({ name: name, issuer: issuer, year: '' });
        });
    }

    // Fresher Calculation
    let isFresher = false;
    if (lowerText.includes('fresher')) isFresher = true;
    if (experienceYears === 0) {
        // If we found 'real' companies (not internships), user might not be fresher
        // But if Exp years says 0, likely they are listed but small duration? 
        // Let's trust experienceYears first. If 0, then fresher unless specific override.
        // Also check if extracted companies look like full time? 
        // For safety, 0 exp = fresher is good default.
        isFresher = true;
    }
    // If explicitly has internships but 0 exp
    if (internships.length > 0 && experienceYears === 0) isFresher = true;

    return {
        extractedSkills: [...new Set(extractedSkills)].slice(0, 20),
        extractedExperience: experienceYears,
        companies: companies.slice(0, 10),
        projects: projects.slice(0, 8),
        certifications: certifications.slice(0, 8),
        internships: internships.slice(0, 5),
        isFresher
    };
};


// --- ATS Scoring ---

/**
 * Calculate ATS Score
 * @param {string} resumeText 
 * @param {Object} jd 
 * @param {ParsedResume} parsedData
 * @returns {Object} Score details
 */
const calculateATSScore = (resumeText, jd, parsedData) => {
    if (!resumeText || !jd) {
        return { score: 0, breakdown: {}, matchedSkills: [], missingSkills: [] };
    }

    const text = resumeText.toLowerCase();

    // 1. Skills Match (40%)
    const matchedSkills = [];
    const missingSkills = [];
    const jdSkills = jd.requiredSkills || [];

    jdSkills.forEach(skill => {
        if (text.includes(skill.toLowerCase())) {
            matchedSkills.push(skill);
        } else {
            missingSkills.push(skill);
        }
    });

    const skillsScoreRaw = jdSkills.length > 0 ? (matchedSkills.length / jdSkills.length) : 0;
    const skillsScore = Math.round(skillsScoreRaw * 100);

    // 2. Experience Match (25%) - Logic varies for Fresher
    let expScore = 0;
    const requiredExp = jd.experienceRequired || 0; // Assuming JD has this field, or 0

    if (parsedData.isFresher) {
        // For freshers, experience "relevance" is judged by Internship presence
        if (parsedData.internships.length > 0) expScore = 100;
        else expScore = 50; // Base score for being a fresher if position allows
    } else {
        // Experienced
        if (parsedData.extractedExperience >= requiredExp) expScore = 100;
        else expScore = Math.round((parsedData.extractedExperience / (requiredExp || 1)) * 100);
    }

    // 3. Domain Match (10%)
    // Check if JD Title words appear in Resume
    let domainScore = 0;
    const jdKeywords = jd.title.split(' ').filter(w => w.length > 3);
    const matchedKeywords = jdKeywords.filter(w => text.includes(w.toLowerCase()));
    domainScore = Math.round((matchedKeywords.length / jdKeywords.length) * 100);

    // 4. Projects (15%)
    let projectScore = 0;
    if (parsedData.projects.length > 0) projectScore = 100;
    else if (parsedData.isFresher) projectScore = 0; // Critical for freshers
    else projectScore = 50; // Less critical for senior roles if they have exp

    // 5. Certifications (10%)
    let certScore = 0;
    if (parsedData.certifications.length > 0) certScore = 100;

    // Weighted Total
    // Skills 40, Exp 25, Domain 10, Proj 15, Cert 10
    const totalScore = Math.round(
        (skillsScore * 0.40) +
        (expScore * 0.25) +
        (domainScore * 0.10) +
        (projectScore * 0.15) +
        (certScore * 0.10)
    );

    return {
        score: totalScore,
        breakdown: {
            skillsMatch: skillsScore,
            experienceRelevance: expScore,
            domainMatch: domainScore,
            projectScore: projectScore,
            certificationScore: certScore
        },
        matchedSkills,
        missingSkills
    };
};

// --- Orchestration ---

/**
 * Process a Single Candidate from Google Form Data
 * @param {Object} formData 
 */
const processCandidateFromGoogle = async (formData) => {
    try {
        let candidate = await Candidate.findOne({ email: formData.email });
        let candidateId = candidate ? candidate._id : new mongoose.Types.ObjectId();

        let isNewCandidate = !candidate;
        let isResumeChanged = false;
        let isRoleChanged = false;

        // 1. Job Description Match
        let jd = await JobDescription.findOne({
            $or: [
                { title: { $regex: new RegExp(`^${formData.appliedRole}$`, 'i') } },
                { role: { $regex: new RegExp(`^${formData.appliedRole}$`, 'i') } },
                { title: { $regex: new RegExp(formData.appliedRole, 'i') } },
                { role: { $regex: new RegExp(formData.appliedRole, 'i') } }
            ],
            status: 'Active'
        });

        if (candidate && candidate.appliedFor !== formData.appliedRole) {
            isRoleChanged = true;
        }

        // 2. Resume Handling
        let resumeFilename = candidate ? candidate.resume : null;
        let resumeText = candidate ? candidate.resumeText : '';
        let resumeDriveFileId = null;

        const driveFileId = googleService.extractDriveFileId(formData.resumeLink);
        let shouldDownload = false;

        if (driveFileId) {
            resumeDriveFileId = driveFileId;
            if (isNewCandidate) {
                shouldDownload = true;
            } else {
                if (candidate.resumeDriveFileId !== driveFileId) {
                    shouldDownload = true;
                } else if (!fs.existsSync(path.join(process.cwd(), 'uploads/resumes', `${candidate._id}-resume.pdf`))) {
                    shouldDownload = true;
                }
            }
        }

        if (shouldDownload && driveFileId) {
            try {
                const fileBuffer = await googleService.downloadFile(driveFileId);
                if (fileBuffer) {
                    resumeText = await extractTextFromResume(fileBuffer, 'application/pdf');
                    const targetFileName = `${candidateId}-resume.pdf`;
                    const resumeFileObj = {
                        originalname: 'google_resume.pdf',
                        buffer: fileBuffer,
                        mimetype: 'application/pdf',
                        size: fileBuffer.length
                    };
                    const savedFile = await storageService.uploadFile(resumeFileObj, 'uploads/resumes', targetFileName);
                    resumeFilename = savedFile.fileName;
                    isResumeChanged = true;
                }
            } catch (err) {
                logger.error(`Failed to download/process resume for ${formData.email}: ${err.message}`);
            }
        }

        // 3. Analysis & ATS Calculation
        let atsResult = {
            score: candidate ? candidate.atsScore : 0,
            breakdown: candidate ? candidate.atsScoreBreakdown : {},
            matchedSkills: candidate ? candidate.matchedSkills : [],
            missingSkills: candidate ? candidate.missingSkills : []
        };
        let parsedResumeData = {
            extractedSkills: [],
            extractedExperience: 0,
            projects: [],
            certifications: [],
            companies: [],
            internships: [],
            isFresher: false
        };

        // CONDITIONAL RE-ANALYSIS: Only re-analyze if resume changed OR candidate is new OR role changed
        // This prevents overwriting existing parsed data during auto-sync
        const shouldReanalyze = isNewCandidate || isResumeChanged || isRoleChanged;

        if (resumeText && shouldReanalyze) {
            logger.info(`Analyzing Resume & Recalculating ATS Score for ${formData.email} (Reason: ${isNewCandidate ? 'New Candidate' : isResumeChanged ? 'Resume Changed' : 'Role Changed'})...`);

            // Analyze
            parsedResumeData = analyzeResume(resumeText);

            // Score
            if (jd) {
                atsResult = calculateATSScore(resumeText, jd, parsedResumeData);
            }
        } else if (candidate && !shouldReanalyze) {
            // Preserve existing parsed data if no changes detected
            logger.info(`Preserving existing parsed data for ${formData.email} (No changes detected)`);
            parsedResumeData = {
                extractedSkills: candidate.extractedSkills || [],
                extractedExperience: candidate.extractedExperience || 0,
                projects: candidate.projects || [],
                certifications: candidate.certifications || [],
                companies: candidate.companies || [],
                internships: candidate.internships || [],
                isFresher: candidate.isFresher || false
            };
            atsResult = {
                score: candidate.atsScore || 0,
                breakdown: candidate.atsScoreBreakdown || {},
                matchedSkills: candidate.matchedSkills || [],
                missingSkills: candidate.missingSkills || []
            };
        }

        // 4. Create or Update Object construction
        const candidateData = {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            experience: Math.max(formData.experience || 0, parsedResumeData.extractedExperience || 0, (candidate ? candidate.experience : 0) || 0),
            linkedin: formData.linkedin || (candidate ? candidate.linkedin : ''),
            appliedFor: formData.appliedRole,
            source: formData.source || 'Google Form',
            currentSalary: formData.currentCTC || (candidate ? candidate.currentSalary : ''),
            expectedSalary: formData.expectedCTC || (candidate ? candidate.expectedSalary : ''),
            resume: resumeFilename,
            resumeLink: formData.resumeLink,
            resumeDriveFileId: resumeDriveFileId,
            resumeText: resumeText,

            // ATS Fields
            atsScore: atsResult.score || 0,
            atsScoreBreakdown: atsResult.breakdown,
            matchedSkills: atsResult.matchedSkills,
            missingSkills: atsResult.missingSkills,

            // Parsed Fields
            extractedSkills: parsedResumeData.extractedSkills,
            extractedExperience: parsedResumeData.extractedExperience,
            projects: parsedResumeData.projects,
            certifications: parsedResumeData.certifications,
            companies: parsedResumeData.companies,
            internships: parsedResumeData.internships,
            isFresher: parsedResumeData.isFresher,

            jobDescription: jd ? jd._id : null,
            googleFormResponseId: formData.responseId,
            status: candidate ? candidate.status : (jd ? 'New' : 'JD Not Available')
        };

        if (candidate) {
            Object.assign(candidate, candidateData);
            await candidate.save();
            logger.info(`Updated candidate: ${candidate.email}`);
            return candidate;
        } else {
            const newCandidate = new Candidate({
                _id: candidateId,
                ...candidateData
            });
            await newCandidate.save();
            logger.info(`Created new candidate: ${newCandidate.email}`);
            return newCandidate;
        }

    } catch (error) {
        logger.error(`Error processing candidate ${formData.email}:`, error);
        return null; // Don't throw to allow sync loop to continue
    }
};

/**
 * Sync Candidates from Google Sheet
 * @param {string} spreadsheetId 
 * @param {string} range 
 */
const syncCandidates = async (spreadsheetId, range) => {
    try {
        let targetRange = range;

        // 1. Resolve Sheet Name if range is generic
        if (!targetRange || targetRange.includes('Form Responses 1')) {
            try {
                const metadata = await googleService.getSheetMetadata(spreadsheetId);
                if (metadata && metadata.sheets && metadata.sheets.length > 0) {
                    const formSheet = metadata.sheets.find(s => s.properties.title.includes("Form Responses"));
                    if (formSheet) {
                        targetRange = `${formSheet.properties.title}!A1:Z`;
                    } else {
                        targetRange = `${metadata.sheets[0].properties.title}!A1:Z`;
                    }
                    logger.info(`Resolved Sheet Range: ${targetRange}`);
                }
            } catch (metaError) {
                logger.warn('Failed to fetch metadata, trying default range:', metaError.message);
            }
        }

        const rows = await googleService.getSheetData(spreadsheetId, targetRange || 'Form Responses 1!A1:Z');
        if (!rows || !rows.length) return { count: 0, message: 'No data found in sheet' };

        // 2. Dynamic Column Mapping
        const headers = rows[0].map(h => h.toLowerCase().trim());
        logger.info('Sheet Headers Detected:', headers);

        const findCol = (exactName, keywords) => {
            const idx = headers.indexOf(exactName.toLowerCase());
            if (idx !== -1) return idx;
            return headers.findIndex(h => keywords.some(k => h.includes(k)));
        };

        const map = {
            email: findCol('email', ['email', 'e-mail']),
            name: findCol('name', ['name', 'candidate']),
            phone: findCol('phone number', ['phone', 'mobile']),
            role: findCol('applying for role', ['applying for role', 'role', 'position']),
            experience: findCol('experience (years)', ['experience', 'exp']),
            linkedin: findCol('linkedin profile url', ['linkedin', 'profile']),
            resume: findCol('upload your resume / cv', ['upload your resume', 'resume', 'cv']),
            currentCTC: findCol('current ctc', ['current ctc', 'current salary']),
            expectedCTC: findCol('expected ctc', ['expected ctc', 'expected salary']),
            source: findCol('source', ['source'])
        };

        const parseCTC = (val) => {
            if (!val) return 0;
            const str = val.toString().toUpperCase().replace(/,/g, '');
            let num = parseFloat(str) || 0;
            if (str.includes('LPA') || str.includes('LAKH')) {
                num = num * 100000;
            }
            return num;
        };

        const parseExperience = (val) => {
            if (!val) return 0;
            const str = val.toString().toLowerCase();
            if (str.includes('fresh')) return 0;
            const num = parseFloat(str) || 0;
            if (num > 50) return 0;
            return num;
        };

        let count = 0;
        const sheetEmails = new Set();

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const email = row[map.email];
            if (!email) continue;

            sheetEmails.add(email.toLowerCase());

            const formData = {
                fullName: row[map.name] || 'Unknown',
                phone: row[map.phone] || '',
                email: email,
                experience: parseExperience(row[map.experience]),
                linkedin: row[map.linkedin] || '',
                appliedRole: row[map.role] || 'General',
                source: row[map.source] || 'Google Form',
                currentCTC: parseCTC(row[map.currentCTC]),
                expectedCTC: parseCTC(row[map.expectedCTC]),
                resumeLink: row[map.resume] || '',
                responseId: `${email}_${row[map.role] || 'role'}`
            };

            const result = await processCandidateFromGoogle(formData);
            if (result) count++;
        }

        // const sheetEmailList = Array.from(sheetEmails);
        // // REMOVED AUTOMATIC DELETION AS PER USER REQUEST
        // // The system should NOT delete candidates if they are missing from the sheet.
        // // Deletion should only be manual.
        // /* 
        // const deletionResult = await Candidate.deleteMany({
        //     source: 'Google Form',
        //     email: { $nin: sheetEmailList }
        // });

        // if (deletionResult.deletedCount > 0) {
        //     logger.info(`Synced Deletion: Removed ${deletionResult.deletedCount} candidates that were deleted from Google Sheet.`);
        // } 
        // */

        return { count, message: `Synced ${count} candidates from '${targetRange.split('!')[0]}'` };

    } catch (error) {
        logger.error('Sync Candidates Logic Error:', error);
        throw error;
    }
};

module.exports = {
    extractTextFromResume,
    calculateATSScore,
    processCandidateFromGoogle,
    syncCandidates,
    analyzeResume
};
