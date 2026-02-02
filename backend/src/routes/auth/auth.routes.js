const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/auth.controller');
const { validateRegistration, validateLogin } = require('../../validators/auth.validator');
const authMiddleware = require('../../middleware/auth.middleware');

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
