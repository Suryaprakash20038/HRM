const express = require('express');
const router = express.Router();
const mediaController = require('../../controllers/media/media.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { upload } = require('../../middleware/upload.middleware');

// All routes are protected
router.use(authMiddleware);

// Use upload middleware for creating posts (single file, field name 'image')
router.post('/', upload.single('image'), mediaController.createPost);

router.get('/', mediaController.getAllPosts); // Admin view
router.get('/my-posts', mediaController.getMyPosts); // Employee view
router.get('/stats', mediaController.getStats); // Admin stats

// Delete routes (Admin only)
router.delete('/:id', mediaController.deletePost); // Delete single post
router.delete('/all/clear', mediaController.deleteAllPosts); // Delete all posts

module.exports = router;
