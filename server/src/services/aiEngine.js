/**
 * AI Engine for Ticket Resolution & Classification
 * Combines NLP categorization, sentiment analysis, urgency detection, 
 * and Retrieval-Augmented Generation (RAG) over the Knowledge Base.
 */

const KnowledgeBase = require('../models/KnowledgeBase');

// Category lexicons with weighted keyword vectors
const CATEGORY_KEYWORDS = {
  'Account & Authentication': [
    'password', 'reset', 'login', 'signin', 'sign in', 'logout', '2fa', 'mfa', 
    'auth', 'authentication', 'credential', 'locked', 'otp', 'verification', 
    'session', 'token', 'forgot password', 'access denied', 'unauthorized'
  ],
  'Billing & Payments': [
    'billing', 'payment', 'invoice', 'credit card', 'charge', 'refund', 'receipt',
    'subscription', 'plan', 'upgrade', 'downgrade', 'pricing', 'stripe', 'paypal',
    'bank', 'overcharged', 'renewal', 'currency', 'tax', 'balance'
  ],
  'Technical & Infrastructure': [
    'error', 'bug', 'crash', 'exception', 'stack trace', 'api', 'server', '500', 
    '404', 'timeout', 'latency', 'slow', 'down', 'outage', 'database', 'connection refused',
    'endpoint', 'sdk', 'deployment', 'failed to load', 'broken', 'docker', 'memory'
  ],
  'Feature Requests': [
    'feature', 'request', 'suggest', 'enhancement', 'roadmap', 'wish', 'would like',
    'can you add', 'integration', 'export', 'dark mode', 'support for', 'improvement',
    'new option', 'plugin', 'webhook'
  ],
  'Security & Compliance': [
    'security', 'vulnerability', 'breach', 'leak', 'hacked', 'suspicious', 'audit',
    'gdpr', 'compliance', 'malware', 'phishing', 'exploit', 'unauthorized access',
    'ssl', 'certificate', 'encrypt', 'penetration', 'cve'
  ],
  'General Support': [
    'help', 'question', 'how to', 'guide', 'documentation', 'info', 'inquiry',
    'contact', 'support', 'assist', 'onboarding', 'tutorial', 'getting started'
  ]
};

// Urgency keywords
const URGENCY_TRIGGERS = {
  critical: [
    'production down', 'system down', 'outage', 'data breach', 'leak', 
    'data loss', 'critical', 'emergency', 'asap', 'broken completely', 'unusable'
  ],
  high: [
    'urgent', 'severe', 'blocking', 'blocked', 'cannot work', 'immediate', 
    'overcharged', 'charged twice', 'deadline', 'broken'
  ],
  medium: [
    'problem', 'issue', 'not working', 'failing', 'slow', 'warning', 'error'
  ],
  low: [
    'question', 'clarification', 'wondering', 'minor', 'feedback', 'cosmetic'
  ]
};

// Sentiment indicators
const SENTIMENT_PATTERNS = {
  frustrated: [
    'ridiculous', 'unacceptable', 'terrible', 'worst', 'angry', 'fed up', 
    'frustrated', 'wasting my time', 'horrible', 'cancel my subscription', 'sue'
  ],
  negative: [
    'disappointed', 'unhappy', 'annoying', 'hate', 'bad', 'poor', 'fail', 
    'broken', 'useless', 'wrong', 'difficult'
  ],
  positive: [
    'great', 'thank', 'thanks', 'appreciate', 'love', 'helpful', 'awesome', 
    'wonderful', 'good', 'pleased'
  ]
};

class AIEngine {
  /**
   * Tokenize and normalize input text
   */
  static tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }

  /**
   * Classify ticket category based on weighted keyword match
   */
  static classifyCategory(title, description) {
    const fullText = `${title || ''} ${description || ''}`.toLowerCase();
    const scores = {};

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      scores[category] = 0;
      for (const kw of keywords) {
        if (fullText.includes(kw)) {
          // Extra weight if keyword is found in title
          const titleWeight = (title || '').toLowerCase().includes(kw) ? 2.5 : 1.0;
          scores[category] += kw.split(' ').length * 1.5 * titleWeight;
        }
      }
    }

    // Determine highest score
    let bestCategory = 'General Support';
    let highestScore = 0;
    let totalScore = 0;

    for (const [cat, score] of Object.entries(scores)) {
      totalScore += score;
      if (score > highestScore) {
        highestScore = score;
        bestCategory = cat;
      }
    }

    const confidence = totalScore > 0 ? Math.min(0.98, Math.max(0.65, highestScore / (totalScore + 1) + 0.35)) : 0.60;

    return {
      category: bestCategory,
      confidence: parseFloat(confidence.toFixed(2)),
      scores
    };
  }

  /**
   * Analyze ticket urgency
   */
  static detectUrgency(title, description) {
    const fullText = `${title || ''} ${description || ''}`.toLowerCase();

    for (const kw of URGENCY_TRIGGERS.critical) {
      if (fullText.includes(kw)) return 'critical';
    }
    for (const kw of URGENCY_TRIGGERS.high) {
      if (fullText.includes(kw)) return 'high';
    }
    for (const kw of URGENCY_TRIGGERS.medium) {
      if (fullText.includes(kw)) return 'medium';
    }
    return 'low';
  }

  /**
   * Analyze customer sentiment
   */
  static detectSentiment(text) {
    const lower = (text || '').toLowerCase();

    for (const kw of SENTIMENT_PATTERNS.frustrated) {
      if (lower.includes(kw)) return 'frustrated';
    }
    for (const kw of SENTIMENT_PATTERNS.negative) {
      if (lower.includes(kw)) return 'negative';
    }
    for (const kw of SENTIMENT_PATTERNS.positive) {
      if (lower.includes(kw)) return 'positive';
    }
    return 'neutral';
  }

  /**
   * Classify ticket resolution tier:
   * Tier 1: Auto-resolvable standard issue (Password reset, FAQ, simple inquiry)
   * Tier 2: Assisted (Moderate complexity, payment queries, configuration help)
   * Tier 3: Complex / Escalated (Server outages, critical security, high churn risk)
   */
  static determineTier(category, urgency, sentiment, confidence) {
    if (urgency === 'critical' || category === 'Security & Compliance' || sentiment === 'frustrated') {
      return 'tier_3';
    }
    if (confidence >= 0.82 && ['Account & Authentication', 'General Support'].includes(category) && urgency !== 'high') {
      return 'tier_1';
    }
    return 'tier_2';
  }

  /**
   * Retrieval-Augmented Generation (RAG):
   * Search knowledge base for articles matching the ticket context
   */
  static async searchKnowledgeBase(query, limit = 3) {
    const tokens = this.tokenize(query);
    if (tokens.length === 0) return [];

    try {
      const articles = await KnowledgeBase.find({ isActive: true });
      if (!articles || articles.length === 0) return [];

      const scored = articles.map((article) => {
        const docText = `${article.title} ${article.category} ${article.content} ${(article.tags || []).join(' ')}`.toLowerCase();
        let matchScore = 0;

        for (const token of tokens) {
          if (docText.includes(token)) {
            matchScore += 1;
            // Title boost
            if (article.title.toLowerCase().includes(token)) {
              matchScore += 2;
            }
          }
        }

        // Tag matching boost
        if (article.tags && article.tags.length > 0) {
          for (const tag of article.tags) {
            if (tokens.includes(tag.toLowerCase())) {
              matchScore += 3;
            }
          }
        }

        const normalizedScore = matchScore / (tokens.length + 2);
        return {
          article,
          score: parseFloat(normalizedScore.toFixed(3))
        };
      });

      return scored
        .filter((item) => item.score > 0.15)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('[AI Engine] RAG search error:', error.message);
      return [];
    }
  }

  /**
   * Generate an automated AI response based on retrieved RAG documents
   */
  static generateResponse(title, description, matchedDocs, tier, sentiment) {
    let greeting = 'Hello! Thank you for reaching out to support.';
    if (sentiment === 'frustrated' || sentiment === 'negative') {
      greeting = 'Hello. We understand your frustration and are here to help resolve this promptly.';
    }

    if (matchedDocs && matchedDocs.length > 0) {
      const topDoc = matchedDocs[0].article;
      let solutionBody = `\n\nBased on your query regarding "${title}", here is the recommended resolution:\n\n`;
      solutionBody += `### ${topDoc.title}\n`;
      solutionBody += `${topDoc.content}\n\n`;

      if (matchedDocs.length > 1) {
        solutionBody += `**Related Helpful Articles:**\n`;
        matchedDocs.slice(1).forEach((doc, idx) => {
          solutionBody += `- ${doc.article.title} (Category: ${doc.article.category})\n`;
        });
        solutionBody += `\n`;
      }

      if (tier === 'tier_1') {
        solutionBody += `Did this solve your problem? You can mark this ticket as resolved, or reply if you need any additional assistance!`;
      } else {
        solutionBody += `Our AI has routed this ticket to our specialized support team. An agent will review this shortly with full context.`;
      }

      return `${greeting}${solutionBody}`;
    }

    // Fallback response when no direct FAQ article is found
    if (tier === 'tier_3') {
      return `${greeting}\n\nWe have identified your issue as **high priority / complex**. Our senior technical engineering team has been notified and is investigating the matter immediately. We will update you here as soon as we make progress.`;
    }

    return `${greeting}\n\nWe have received your ticket regarding "${title}". Our support team has been assigned and is reviewing the details. In the meantime, please feel free to provide any screenshots or error logs to assist faster resolution.`;
  }

  /**
   * Run Full AI Ticket Analysis Pipeline
   */
  static async processTicket(title, description) {
    const classification = this.classifyCategory(title, description);
    const urgency = this.detectUrgency(title, description);
    const sentiment = this.detectSentiment(description || title);
    const tier = this.determineTier(classification.category, urgency, sentiment, classification.confidence);

    const ragMatches = await this.searchKnowledgeBase(`${title} ${description}`);
    const suggestedResponse = this.generateResponse(title, description, ragMatches, tier, sentiment);

    // Auto-resolve if high confidence Tier 1 and excellent match
    const canAutoResolve = tier === 'tier_1' && ragMatches.length > 0 && ragMatches[0].score >= 0.45;

    return {
      category: classification.category,
      confidence: classification.confidence,
      urgency,
      sentiment,
      tier,
      matchedArticles: ragMatches.map((m) => ({
        articleId: m.article._id,
        title: m.article.title,
        score: m.score
      })),
      suggestedResponse,
      autoResolveEligible: canAutoResolve,
      recommendedTags: [
        classification.category.split(' ')[0].toLowerCase(),
        urgency,
        tier.replace('_', '-')
      ]
    };
  }

  /**
   * Agent Copilot: Summarize ticket conversation
   */
  static summarizeConversation(ticket, messages = []) {
    const customerMsgs = messages.filter((m) => m.senderType === 'customer').map((m) => m.text);
    const summary = `**Ticket Summary (${ticket.ticketNumber})**:
- **Subject**: ${ticket.title}
- **Category**: ${ticket.category} | **Urgency**: ${ticket.aiUrgency || ticket.priority}
- **Customer Concern**: ${ticket.description.slice(0, 150)}${ticket.description.length > 150 ? '...' : ''}
- **Messages Count**: ${messages.length} exchanges
- **Current Status**: ${ticket.status.toUpperCase()}`;
    return summary;
  }

  /**
   * Agent Copilot: Rewrite or assist agent reply with tone adjustment
   */
  static rewriteAgentReply(originalText, tone = 'professional') {
    if (!originalText) return '';

    if (tone === 'empathetic') {
      return `Thank you for your patience while we looked into this. I completely understand how inconvenient this must be. ${originalText} Please let me know if there's anything else I can clarify for you!`;
    }
    if (tone === 'concise') {
      return `Hi there, here is the update regarding your issue: ${originalText}. Let us know if you need more info.`;
    }
    // Professional default
    return `Dear Customer,\n\nThank you for reaching out to our support team. Regarding your inquiry:\n\n${originalText}\n\nBest regards,\nCustomer Support Operations`;
  }
}

module.exports = AIEngine;
