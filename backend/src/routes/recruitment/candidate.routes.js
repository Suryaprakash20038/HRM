const express = require('express');
const router = express.Router();
const candidateController = require('../../controllers/recruitment/candidate.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', candidateController.createCandidate);
router.get('/', candidateController.getAllCandidates);
router.put('/:id', candidateController.updateCandidate);
router.delete('/:id', candidateController.deleteCandidate);
router.post('/:id/offer', candidateController.sendOfferLetter);

// Google Sync
router.post('/sync/google', candidateController.syncCandidatesFromGoogle);

module.exports = router;
