const Recruitment = require('../../models/Recruitment/Recruitment');
const { successResponse, errorResponse } = require('../../utils/response');
const logger = require('../../utils/logger');

exports.getAllJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, department } = req.query;
        const query = {};

        if (status) query.status = status;
        if (department) query.department = department;

        const jobs = await Recruitment.find(query)
            .populate('postedBy', 'firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Recruitment.countDocuments(query);

        return successResponse(res, {
            jobs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, 'Job postings retrieved successfully');

    } catch (error) {
        logger.error('Get all jobs error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.getJobById = async (req, res) => {
    try {
        const job = await Recruitment.findById(req.params.id)
            .populate('postedBy', 'firstName lastName email');

        if (!job) {
            return errorResponse(res, 'Job posting not found', 404);
        }

        return successResponse(res, { job }, 'Job posting retrieved successfully');

    } catch (error) {
        logger.error('Get job by ID error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.createJob = async (req, res) => {
    try {
        const jobData = { ...req.body, postedBy: req.user.id };
        const job = await Recruitment.create(jobData);

        logger.info(`New job posted: ${job.jobTitle}`);

        return successResponse(res, { job }, 'Job posted successfully', 201);

    } catch (error) {
        logger.error('Create job error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.updateJob = async (req, res) => {
    try {
        const job = await Recruitment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!job) {
            return errorResponse(res, 'Job posting not found', 404);
        }

        logger.info(`Job updated: ${job.jobTitle}`);

        return successResponse(res, { job }, 'Job updated successfully');

    } catch (error) {
        logger.error('Update job error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const job = await Recruitment.findByIdAndUpdate(
            req.params.id,
            { status: 'Closed' },
            { new: true }
        );

        if (!job) {
            return errorResponse(res, 'Job posting not found', 404);
        }

        logger.info(`Job closed: ${job.jobTitle}`);

        return successResponse(res, { job }, 'Job closed successfully');

    } catch (error) {
        logger.error('Delete job error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.applyForJob = async (req, res) => {
    try {
        const { applicantName, email, phone, resume } = req.body;

        const job = await Recruitment.findById(req.params.id);

        if (!job) {
            return errorResponse(res, 'Job posting not found', 404);
        }

        if (job.status === 'Closed') {
            return errorResponse(res, 'This job posting is closed', 400);
        }

        job.applicants.push({
            applicantName,
            email,
            phone,
            resume,
            applicationStatus: 'Applied'
        });

        await job.save();

        logger.info(`New application for job: ${job.jobTitle}`);

        return successResponse(res, { job }, 'Application submitted successfully', 201);

    } catch (error) {
        logger.error('Apply for job error:', error);
        return errorResponse(res, error.message, 500);
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { jobId, applicantId } = req.params;
        const { applicationStatus } = req.body;

        const job = await Recruitment.findById(jobId);

        if (!job) {
            return errorResponse(res, 'Job posting not found', 404);
        }

        const applicant = job.applicants.id(applicantId);

        if (!applicant) {
            return errorResponse(res, 'Applicant not found', 404);
        }

        applicant.applicationStatus = applicationStatus;
        await job.save();

        logger.info(`Application status updated: ${applicationStatus}`);

        return successResponse(res, { job }, 'Application status updated successfully');

    } catch (error) {
        logger.error('Update application status error:', error);
        return errorResponse(res, error.message, 500);
    }
};
