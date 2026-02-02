const express = require('express');
const router = express.Router();
const ticketController = require('../../controllers/ticket/ticket.controller');
const protect = require('../../middleware/auth.middleware');
const { upload } = require('../../middleware/upload.middleware');

// Apply auth middleware to all routes
router.use(protect);

// Create Ticket
router.post('/', upload.single('attachment'), ticketController.createTicket);

// List My Tickets (Created by me or Mentioned in)
router.get('/my-tickets', ticketController.getEmployeeTickets);

// List Colleagues for Mentioning
router.get('/colleagues', ticketController.getDepartmentColleagues);

// Admin: Get All Tickets
router.get('/all', ticketController.getAllTickets);

// Get Ticket Details
router.get('/:id', ticketController.getTicketDetails);

// Add Reply
router.post('/:id/reply', upload.single('attachment'), ticketController.addTicketReply);

// Admin: Update Ticket Status/Assign
router.put('/:id/status', ticketController.updateTicketStatus);

// Delete Ticket
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;
