const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const ActivityLog = require('../models/ActivityLog');
const AIEngine = require('../services/aiEngine');
const { emitNewTicket, emitTicketUpdated, emitNewMessage } = require('../services/socketService');

// @desc    Create a new ticket with automatic AI triage and response
// @route   POST /api/tickets
const createTicket = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const customerId = req.user._id;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    // 1. Run AI Analysis Pipeline
    const aiAnalysis = await AIEngine.processTicket(title, description);

    // Set priority: if user didn't specify high/urgent, use AI urgency
    let assignedPriority = priority || 'medium';
    if (!priority) {
      if (aiAnalysis.urgency === 'critical') assignedPriority = 'urgent';
      else if (aiAnalysis.urgency === 'high') assignedPriority = 'high';
      else if (aiAnalysis.urgency === 'low') assignedPriority = 'low';
    }

    // Determine initial status
    const initialStatus = aiAnalysis.autoResolveEligible ? 'resolved' : 'open';
    const resolutionStatus = aiAnalysis.autoResolveEligible ? 'auto_resolved' : 'assisted';

    // 2. Create Ticket Document
    const ticket = await Ticket.create({
      title,
      description,
      customer: customerId,
      category: category || aiAnalysis.category,
      priority: assignedPriority,
      status: initialStatus,
      tier: aiAnalysis.tier,
      aiConfidence: aiAnalysis.confidence,
      aiCategory: aiAnalysis.category,
      aiTier: aiAnalysis.tier,
      aiSentiment: aiAnalysis.sentiment,
      aiUrgency: aiAnalysis.urgency,
      aiSuggestedResponse: aiAnalysis.suggestedResponse,
      aiMatchedArticles: aiAnalysis.matchedArticles,
      aiResolutionStatus: resolutionStatus,
      tags: aiAnalysis.recommendedTags,
      resolvedAt: aiAnalysis.autoResolveEligible ? new Date() : null,
      resolutionSummary: aiAnalysis.autoResolveEligible ? 'Automatically resolved by AI resolution bot via FAQ match.' : '',
    });

    // 3. Create initial customer message in thread
    const customerMsg = await Message.create({
      ticket: ticket._id,
      sender: customerId,
      senderType: 'customer',
      senderName: req.user.name,
      text: description,
    });

    // 4. Create automated AI Bot response message in thread
    const botMsg = await Message.create({
      ticket: ticket._id,
      sender: null,
      senderType: 'ai_bot',
      senderName: 'ResolvAI Bot',
      text: aiAnalysis.suggestedResponse,
      aiConfidence: aiAnalysis.confidence,
      suggestedActions: aiAnalysis.autoResolveEligible
        ? [{ label: 'Confirm Resolution', action: 'resolve' }, { label: 'Reopen / Request Human Agent', action: 'escalate' }]
        : [{ label: 'Request Human Escalation', action: 'escalate' }],
    });

    // 5. Create Activity Logs
    await ActivityLog.create({
      ticket: ticket._id,
      user: customerId,
      action: 'TICKET_CREATED',
      details: `Customer submitted ticket #${ticket.ticketNumber}`,
    });

    await ActivityLog.create({
      ticket: ticket._id,
      user: null,
      action: 'AI_TRIAGE_EXECUTED',
      details: `AI categorized ticket as ${aiAnalysis.category} (${(aiAnalysis.confidence * 100).toFixed(0)}% confidence, ${aiAnalysis.tier.toUpperCase()})`,
    });

    if (aiAnalysis.autoResolveEligible) {
      await ActivityLog.create({
        ticket: ticket._id,
        user: null,
        action: 'AI_AUTO_RESOLVED',
        details: 'Ticket auto-resolved by AI bot based on high-confidence knowledge match.',
      });
    }

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'name email avatar')
      .populate('assignedAgent', 'name email avatar department');

    // Emit live WebSocket events
    emitNewTicket(populatedTicket);
    emitNewMessage(ticket._id, customerMsg);
    emitNewMessage(ticket._id, botMsg);

    res.status(201).json({
      success: true,
      data: populatedTicket,
      aiAnalysis,
    });
  } catch (error) {
    console.error('[TicketController] Error creating ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tickets with filtering, search, and role scoping
// @route   GET /api/tickets
const getTickets = async (req, res) => {
  try {
    const { status, priority, category, tier, search, assignedToMe } = req.query;
    const query = {};

    // Role-based visibility: customers only see their tickets
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (assignedToMe === 'true') {
      query.assignedAgent = req.user._id;
    }

    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (category && category !== 'all') query.category = category;
    if (tier && tier !== 'all') query.tier = tier;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tickets = await Ticket.find(query)
      .populate('customer', 'name email avatar')
      .populate('assignedAgent', 'name email avatar department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customer', 'name email avatar')
      .populate('assignedAgent', 'name email avatar department')
      .populate('aiMatchedArticles.articleId');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Role security: customer can only view own ticket
    if (req.user.role === 'customer' && ticket.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this ticket' });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ticket status, priority, tier
// @route   PATCH /api/tickets/:id
const updateTicket = async (req, res) => {
  try {
    const { status, priority, tier, resolutionSummary, assignedAgent } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const oldStatus = ticket.status;

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (tier) ticket.tier = tier;
    if (assignedAgent !== undefined) ticket.assignedAgent = assignedAgent || null;

    if (status === 'resolved' && oldStatus !== 'resolved') {
      ticket.resolvedAt = new Date();
      ticket.resolutionSummary = resolutionSummary || ticket.resolutionSummary || 'Resolved by support team.';
    }

    await ticket.save();

    await ActivityLog.create({
      ticket: ticket._id,
      user: req.user._id,
      action: 'TICKET_UPDATED',
      details: `${req.user.name} updated ticket: status=${ticket.status}, priority=${ticket.priority}`,
    });

    const updated = await Ticket.findById(ticket._id)
      .populate('customer', 'name email avatar')
      .populate('assignedAgent', 'name email avatar department');

    emitTicketUpdated(updated);

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign ticket to agent
// @route   POST /api/tickets/:id/assign
const assignTicket = async (req, res) => {
  try {
    const { agentId } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.assignedAgent = agentId || req.user._id;
    if (ticket.status === 'open') {
      ticket.status = 'in_progress';
    }
    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate('customer', 'name email avatar')
      .populate('assignedAgent', 'name email avatar department');

    await ActivityLog.create({
      ticket: ticket._id,
      user: req.user._id,
      action: 'AGENT_ASSIGNED',
      details: `Ticket assigned to ${populated.assignedAgent ? populated.assignedAgent.name : 'an agent'}`,
    });

    emitTicketUpdated(populated);

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit CSAT rating and customer feedback
// @route   POST /api/tickets/:id/csat
const submitCsat = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only ticket author can submit CSAT feedback' });
    }

    ticket.csatScore = score;
    ticket.csatFeedback = feedback || '';
    await ticket.save();

    await ActivityLog.create({
      ticket: ticket._id,
      user: req.user._id,
      action: 'CSAT_SUBMITTED',
      details: `Customer submitted CSAT rating: ${score}/5 stars`,
    });

    res.json({ success: true, message: 'Thank you for your feedback!', data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    AI real-time preview (as user is typing before submission)
// @route   POST /api/tickets/preview-ai
const previewAiTriage = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title && !description) {
      return res.json({ success: true, preview: null });
    }

    const preview = await AIEngine.processTicket(title || '', description || '');
    res.json({ success: true, preview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  assignTicket,
  submitCsat,
  previewAiTriage,
};
