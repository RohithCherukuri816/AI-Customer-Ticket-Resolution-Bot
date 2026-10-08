const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  assignTicket,
  submitCsat,
  previewAiTriage,
} = require('../controllers/ticketController');
const { getTicketMessages, sendMessage, aiCopilotAssist } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createTicket);
router.get('/', getTickets);
router.post('/preview-ai', previewAiTriage);
router.get('/:id', getTicketById);
router.patch('/:id', updateTicket);
router.post('/:id/assign', assignTicket);
router.post('/:id/csat', submitCsat);

// Conversation & AI Copilot on tickets
router.get('/:id/messages', getTicketMessages);
router.post('/:id/messages', sendMessage);
router.post('/:id/ai-copilot', aiCopilotAssist);

module.exports = router;
