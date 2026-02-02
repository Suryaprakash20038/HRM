const express = require('express');
const router = express.Router();
const resignationController = require('../../controllers/resignation/resignation.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { upload } = require('../../middleware/upload.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Employee: Submit Resignation
router.post('/submit', upload.single('resignationLetter'), resignationController.submitResignation);

// Employee: Cancel Resignation
router.post('/cancel', resignationController.cancelResignation);

// Manager: Get Pending Resignations
router.get('/manager/list', resignationController.getManagerResignations);

// Domain TL: Get Pending Resignations
router.get('/tl/list', resignationController.getTLResignations);

// Domain TL: Approve Resignation
router.post('/tl/approve', resignationController.approveResignationByTL);

// Domain TL: Reject Resignation
router.post('/tl/reject', resignationController.rejectResignationByTL);

// Manager: Approve Resignation
router.post('/manager/approve', resignationController.approveResignation);

// Manager: Reject Resignation
router.post('/manager/reject', resignationController.rejectResignation);

// HR: Get Final Approval List
router.get('/hr/list', resignationController.getHRResignations);

// HR: Final Approve
// HR: Final Approve
router.post('/hr/approve', resignationController.finalApproveResignation);

// HR: Update Exit Clearance
router.post('/hr/clearance', resignationController.updateExitClearance);

// HR: Get Employees in Exit Process/Notice Period
router.get('/hr/exit-list', resignationController.getExitEmployees);

// HR: Mark as Relieved
router.post('/hr/relieve', resignationController.relieveEmployee);

module.exports = router;
