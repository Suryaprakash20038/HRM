const express = require('express');
const router = express.Router();
const conversationController = require('../../controllers/Chat/conversation.controller');
const messageController = require('../../controllers/Chat/message.controller');
const userController = require('../../controllers/Chat/user.controller');
const { uploadFile } = require('../../controllers/Chat/upload.controller');
const auth = require('../../middleware/auth.middleware');

// All routes require authentication
router.use(auth);

// ===== USER ROUTES =====

// Search users
router.get('/users/search', userController.searchUsers);

// Get online users
router.get('/users/online', userController.getOnlineUsers);

// Get all users
router.get('/users', userController.getAllUsers);

// ===== CONVERSATION ROUTES =====

// Get all conversations
router.get('/conversations', conversationController.getConversations);

// Create new conversation
router.post('/conversations', conversationController.createConversation);

// Get conversation by ID
router.get('/conversations/:id', conversationController.getConversationById);

// Update conversation
router.put('/conversations/:id', conversationController.updateConversation);

// Delete conversation
router.delete('/conversations/:id', conversationController.deleteConversation);

// Add participants to conversation
router.post('/conversations/:id/participants', conversationController.addParticipants);

// Remove participant from conversation
router.delete('/conversations/:id/participants/:userId', conversationController.removeParticipant);

// Make participant admin
router.put('/conversations/:id/participants/:userId/admin', conversationController.makeParticipantAdmin);

// Mark conversation as read
router.put('/conversations/:id/read', conversationController.markAsRead);

// Search conversations
router.get('/conversations/search', conversationController.searchConversations);

// ===== MESSAGE ROUTES =====

// Get messages for a conversation
router.get('/conversations/:id/messages', messageController.getMessages);

// Send a message
router.post('/conversations/:id/messages', messageController.sendMessage);

// Update a message
router.put('/messages/:id', messageController.updateMessage);

// Delete a message
router.delete('/messages/:id', messageController.deleteMessage);

// Add reaction to message
router.post('/messages/:id/reactions', messageController.addReaction);

// Remove reaction from message
router.delete('/messages/:id/reactions/:emoji', messageController.removeReaction);

// Search messages in a conversation
router.get('/conversations/:id/messages/search', messageController.searchMessages);

// Mark all messages as read
router.put('/conversations/:id/messages/read-all', messageController.markAllAsRead);

// ===== FILE UPLOAD ROUTE =====

// Upload file
router.post('/upload', uploadFile);

module.exports = router;
