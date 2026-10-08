/**
 * Centralized Application Constants & Operational Enums
 */

module.exports = {
  ROLES: {
    ADMIN: 'admin',
    AGENT: 'agent',
    CUSTOMER: 'customer',
  },

  TICKET_STATUS: {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
  },

  TICKET_PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },

  RESOLUTION_TIERS: {
    TIER_1: 'tier_1', // Auto-resolvable via AI & RAG
    TIER_2: 'tier_2', // Assisted (Agent + AI Copilot)
    TIER_3: 'tier_3', // Escalated complex/outage issue
  },

  CATEGORIES: [
    'Account & Authentication',
    'Billing & Payments',
    'Technical & Infrastructure',
    'Feature Requests',
    'Security & Compliance',
    'General Support',
  ],

  SENTIMENTS: ['positive', 'neutral', 'negative', 'frustrated'],
  URGENCIES: ['low', 'medium', 'high', 'critical'],
};
