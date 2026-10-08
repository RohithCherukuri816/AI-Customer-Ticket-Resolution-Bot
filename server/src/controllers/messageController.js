const Message = require('../models/Message');
const Ticket = require('../models/Ticket');
const AIEngine = require('../services/aiEngine');
const { emitNewMessage, emitTicketUpdated } = require('../services/socketService');

// @desc    Get all messages for a ticket
// @route   GET /api/tickets/:id/messages
const getTicketMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ ticket: id })
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message on a ticket
// @route   POST /api/tickets/:id/messages
const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, isInternalNote } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const senderType = req.user.role === 'customer' ? 'customer' : 'agent';

    const message = await Message.create({
      ticket: id,
      sender: req.user._id,
      senderType,
      senderName: req.user.name,
      text: text.trim(),
      isInternalNote: Boolean(isInternalNote),
    });

    // If ticket was closed or resolved and customer replies, reopen it
    if (senderType === 'customer' && ['resolved', 'closed'].includes(ticket.status)) {
      ticket.status = 'open';
      await ticket.save();
      emitTicketUpdated(ticket);
    }

    const populatedMsg = await Message.findById(message._id).populate('sender', 'name email avatar role');

    emitNewMessage(id, populatedMsg);

    res.status(201).json({ success: true, data: populatedMsg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Agent AI Copilot: Generate contextual draft reply or summary
// @route   POST /api/tickets/:id/ai-copilot
const aiCopilotAssist = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, tone, customPrompt } = req.body;
    // action: 'draft_reply' | 'summarize' | 'rewrite'

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const messages = await Message.find({ ticket: id }).sort({ createdAt: 1 });

    let result = '';

    if (action === 'summarize') {
      result = AIEngine.summarizeConversation(ticket, messages);
    } else if (action === 'rewrite') {
      result = AIEngine.rewriteAgentReply(customPrompt || '', tone || 'professional');
    } else {
      // draft_reply: search knowledge base + synthesize draft
      const kbMatches = await AIEngine.searchKnowledgeBase(`${ticket.title} ${ticket.description}`, 2);
      result = AIEngine.generateResponse(ticket.title, ticket.description, kbMatches, ticket.tier, ticket.aiSentiment);
      if (tone && tone !== 'professional') {
        result = AIEngine.rewriteAgentReply(result, tone);
      }
    }

    res.json({
      success: true,
      action,
      tone,
      result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTicketMessages,
  sendMessage,
  aiCopilotAssist,
};
