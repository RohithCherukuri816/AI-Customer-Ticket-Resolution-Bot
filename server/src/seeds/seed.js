const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const KnowledgeBase = require('../models/KnowledgeBase');
const ActivityLog = require('../models/ActivityLog');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Cleaning existing collections...');

    await User.deleteMany({});
    await Ticket.deleteMany({});
    await Message.deleteMany({});
    await KnowledgeBase.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('[Seeder] Seeding Demo Users...');
    // Create users (passwords will be hashed automatically by User model pre-save)
    const admin = await User.create({
      name: 'Sarah Jenkins (Admin)',
      email: 'admin@support.ai',
      password: 'password123',
      role: 'admin',
      department: 'Platform Operations',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });

    const agent = await User.create({
      name: 'Bob Miller (Support Lead)',
      email: 'agent@support.ai',
      password: 'password123',
      role: 'agent',
      department: 'Tier-2 Technical Support',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });

    const customerAlice = await User.create({
      name: 'Alice Walker',
      email: 'alice@customer.com',
      password: 'password123',
      role: 'customer',
      department: 'Enterprise Client',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    });

    const customerDavid = await User.create({
      name: 'David Chen',
      email: 'david@company.io',
      password: 'password123',
      role: 'customer',
      department: 'Standard Client',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    });

    console.log('[Seeder] Seeding Knowledge Base articles (migrated & enriched from docs)...');
    const articlesData = [
      {
        title: 'Account Access & Password Reset Guide',
        category: 'Account & Authentication',
        content: `To reset your account password:\n1. Navigate to the login portal and click "Forgot Password".\n2. Provide your registered email address.\n3. Check your inbox for the secure reset link (valid for 24 hours).\n4. If your account is temporarily locked due to multiple attempts, wait 30 minutes or submit a verification ticket.`,
        tags: ['password', 'reset', 'login', 'auth', 'locked', 'credentials'],
        views: 342,
        helpfulCount: 89,
      },
      {
        title: 'Two-Factor Authentication (2FA) Setup & Recovery',
        category: 'Account & Authentication',
        content: `Setting up 2FA enhances your workspace security.\n- Go to Settings > Security > Enable Two-Factor Authentication.\n- Scan the QR code using Google Authenticator, 1Password, or Authy.\n- Save your 10 backup codes in a safe place. If you lost your device, use a backup code or contact our security desk for identity verification.`,
        tags: ['2fa', 'mfa', 'security', 'authenticator', 'otp', 'verification'],
        views: 215,
        helpfulCount: 54,
      },
      {
        title: 'Billing Cycle, Invoicing, and Payment Methods',
        category: 'Billing & Payments',
        content: `Invoices are generated on the 1st of each month. We support Visa, Mastercard, AMEX, and corporate ACH transfers.\n- To download PDF invoices, visit Workspace Settings > Billing & Plans > Invoice History.\n- To update your corporate credit card, click "Edit Payment Method". Changes apply immediately to subsequent charges.`,
        tags: ['billing', 'payment', 'invoice', 'credit card', 'receipt', 'subscription'],
        views: 480,
        helpfulCount: 120,
      },
      {
        title: 'Refund Policy & Duplicate Charge Resolution',
        category: 'Billing & Payments',
        content: `If you were inadvertently charged twice or experienced billing discrepancies:\n1. Provide the transaction ID or last 4 digits of your card.\n2. Inadvertent charges are automatically refunded within 3-5 business days upon verification.\n3. Annual plan cancellations within 14 days are eligible for a prorated refund.`,
        tags: ['refund', 'overcharged', 'duplicate charge', 'billing', 'dispute'],
        views: 189,
        helpfulCount: 45,
      },
      {
        title: 'API Rate Limits, 429 Errors, and Status 500 Debugging',
        category: 'Technical & Infrastructure',
        content: `Standard REST API tiers allow up to 120 requests/minute per API key.\n- If receiving HTTP 429 Too Many Requests, implement exponential backoff.\n- If receiving HTTP 500 Internal Server Error, inspect your payload JSON syntax and check our live status page (status.acme.io).\n- For higher limits, enterprise accounts can request dedicated throughput quotas.`,
        tags: ['api', 'rate limit', '429', '500 error', 'timeout', 'bug', 'server'],
        views: 610,
        helpfulCount: 195,
      },
      {
        title: 'Webhook Integration & Retry Policies',
        category: 'Technical & Infrastructure',
        content: `Webhooks deliver real-time events to your endpoint.\n- We sign all webhook payloads with HMAC SHA256 using your webhook secret in the X-Signature header.\n- Your endpoint must return HTTP 200 within 5 seconds. Failed deliveries will retry 5 times with exponential backoff (1m, 5m, 15m, 1h, 6h).`,
        tags: ['webhook', 'hmac', 'integration', 'payload', 'event', 'timeout'],
        views: 310,
        helpfulCount: 78,
      },
      {
        title: 'Requesting New Features & Roadmap Voting',
        category: 'Feature Requests',
        content: `We welcome community feedback! You can submit feature requests directly through this portal.\n- Please explain your use-case and expected outcome.\n- Our product engineering team reviews community submissions weekly and tags them with Planned, In-Progress, or Completed.`,
        tags: ['feature', 'roadmap', 'request', 'feedback', 'enhancement'],
        views: 140,
        helpfulCount: 32,
      },
      {
        title: 'Data Privacy, GDPR Compliance, and Exporting Logs',
        category: 'Security & Compliance',
        content: `Our platform is SOC2 Type II and GDPR compliant. All data is encrypted at rest (AES-256) and in transit (TLS 1.3).\n- To request a full data export or account erasure pursuant to GDPR Article 17, submit a compliance ticket.\n- All security vulnerability disclosures are handled with highest urgency under our Responsible Disclosure policy.`,
        tags: ['security', 'gdpr', 'compliance', 'data export', 'privacy', 'vulnerability'],
        views: 290,
        helpfulCount: 88,
      },
    ];

    const kbDocs = await KnowledgeBase.insertMany(articlesData);

    console.log('[Seeder] Seeding realistic sample tickets with AI triage...');

    // Ticket 1: Tier 1 - Auto-Resolved password reset
    const t1 = await Ticket.create({
      ticketNumber: 'TICK-9021-1001',
      title: 'Cannot reset password link expired',
      description: 'I clicked the reset password link yesterday but when I opened it today it says expired. Can you help me reset my account password?',
      customer: customerAlice._id,
      assignedAgent: null,
      category: 'Account & Authentication',
      priority: 'low',
      status: 'resolved',
      tier: 'tier_1',
      aiConfidence: 0.94,
      aiCategory: 'Account & Authentication',
      aiTier: 'tier_1',
      aiSentiment: 'neutral',
      aiUrgency: 'low',
      aiResolutionStatus: 'auto_resolved',
      aiSuggestedResponse: 'Hello! Thank you for reaching out. Based on your query regarding "Cannot reset password link expired", here is the recommended resolution:\n\nPassword reset links automatically expire after 24 hours for account security. Please navigate to the login portal and click "Forgot Password" again to receive a fresh secure link.\n\nDid this solve your problem? You can mark this ticket as resolved!',
      aiMatchedArticles: [{ articleId: kbDocs[0]._id, title: kbDocs[0].title, score: 0.88 }],
      resolvedAt: new Date(Date.now() - 3600000 * 2),
      resolutionSummary: 'Auto-resolved by AI bot via Knowledge Base match.',
      csatScore: 5,
      csatFeedback: 'Super fast instant response! Reset link worked right away.',
      tags: ['account', 'password', 'tier-1'],
    });

    await Message.create({
      ticket: t1._id,
      sender: customerAlice._id,
      senderType: 'customer',
      senderName: 'Alice Walker',
      text: t1.description,
    });

    await Message.create({
      ticket: t1._id,
      sender: null,
      senderType: 'ai_bot',
      senderName: 'ResolvAI Bot',
      text: t1.aiSuggestedResponse,
      aiConfidence: 0.94,
    });

    // Ticket 2: Tier 2 - In progress billing inquiry
    const t2 = await Ticket.create({
      ticketNumber: 'TICK-9022-2002',
      title: 'Charged twice on monthly subscription renewal',
      description: 'Hi team, checking my statement and I see two charges of $49 for invoice INV-8821. Could you check and refund the extra charge please?',
      customer: customerDavid._id,
      assignedAgent: agent._id,
      category: 'Billing & Payments',
      priority: 'high',
      status: 'in_progress',
      tier: 'tier_2',
      aiConfidence: 0.91,
      aiCategory: 'Billing & Payments',
      aiTier: 'tier_2',
      aiSentiment: 'frustrated',
      aiUrgency: 'high',
      aiResolutionStatus: 'assisted',
      aiSuggestedResponse: 'Hello. We understand your concern and are here to help resolve this promptly. We have routed this ticket to our billing specialist team for immediate review.',
      aiMatchedArticles: [{ articleId: kbDocs[3]._id, title: kbDocs[3].title, score: 0.79 }],
      tags: ['billing', 'duplicate charge', 'refund', 'tier-2'],
    });

    await Message.create({
      ticket: t2._id,
      sender: customerDavid._id,
      senderType: 'customer',
      senderName: 'David Chen',
      text: t2.description,
    });

    await Message.create({
      ticket: t2._id,
      sender: null,
      senderType: 'ai_bot',
      senderName: 'ResolvAI Bot',
      text: 'Hello David. We understand your concern regarding duplicate charges. Our AI has cross-checked your invoice history and escalated this to Bob Miller from Billing. Your refund request is being processed.',
      aiConfidence: 0.91,
    });

    await Message.create({
      ticket: t2._id,
      sender: agent._id,
      senderType: 'agent',
      senderName: 'Bob Miller (Support Lead)',
      text: 'Hi David! I investigated our payment gateway logs. The second charge was a pending authorization pre-hold that failed settlement. I have initiated an immediate void so it will drop off your card within 24-48 hours.',
    });

    // Ticket 3: Tier 3 - Open critical technical issue
    const t3 = await Ticket.create({
      ticketNumber: 'TICK-9023-3003',
      title: 'Production API returning 500 errors on batch webhook export',
      description: 'Our production environment is failing with HTTP 500 on endpoint /v1/export/batch. Production is down for our analytics pipeline, urgent assistance needed asap!',
      customer: customerAlice._id,
      assignedAgent: agent._id,
      category: 'Technical & Infrastructure',
      priority: 'urgent',
      status: 'open',
      tier: 'tier_3',
      aiConfidence: 0.89,
      aiCategory: 'Technical & Infrastructure',
      aiTier: 'tier_3',
      aiSentiment: 'frustrated',
      aiUrgency: 'critical',
      aiResolutionStatus: 'escalated',
      aiSuggestedResponse: 'We have identified your issue as high priority / complex. Our senior technical engineering team has been notified and is investigating immediately.',
      aiMatchedArticles: [{ articleId: kbDocs[4]._id, title: kbDocs[4].title, score: 0.72 }],
      tags: ['api', '500 error', 'urgent', 'tier-3', 'outage'],
    });

    await Message.create({
      ticket: t3._id,
      sender: customerAlice._id,
      senderType: 'customer',
      senderName: 'Alice Walker',
      text: t3.description,
    });

    await Message.create({
      ticket: t3._id,
      sender: null,
      senderType: 'ai_bot',
      senderName: 'ResolvAI Bot',
      text: '🚨 Critical Priority Detected: ResolvAI has flagged this ticket for Tier-3 Emergency Escalation. Senior Support Lead Bob Miller has been paged.',
      aiConfidence: 0.89,
    });

    // Seed Activity Logs
    await ActivityLog.create({
      ticket: t1._id,
      user: customerAlice._id,
      action: 'TICKET_CREATED',
      details: 'Alice Walker opened ticket #TICK-9021-1001',
    });
    await ActivityLog.create({
      ticket: t1._id,
      user: null,
      action: 'AI_AUTO_RESOLVED',
      details: 'Ticket #TICK-9021-1001 resolved automatically in 1.8s with 94% confidence.',
    });
    await ActivityLog.create({
      ticket: t2._id,
      user: agent._id,
      action: 'AGENT_ASSIGNED',
      details: 'Bob Miller assigned to ticket #TICK-9022-2002',
    });
    await ActivityLog.create({
      ticket: t3._id,
      user: null,
      action: 'EMERGENCY_ESCALATION',
      details: 'AI triaged ticket #TICK-9023-3003 as Critical Tier-3 and alerted engineering team.',
    });

    console.log('[Seeder] Database seeded successfully with demo data!');
    console.log('=====================================================');
    console.log('Demo Accounts:');
    console.log('Admin:    admin@support.ai   / password123');
    console.log('Agent:    agent@support.ai   / password123');
    console.log('Customer: alice@customer.com / password123');
    console.log('=====================================================');

    if (require.main === module) {
      await closeDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seeder] Error during seed:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedData();
}

module.exports = { seedData };

