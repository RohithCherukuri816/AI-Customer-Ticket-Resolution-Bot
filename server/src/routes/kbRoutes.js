const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  voteHelpful,
} = require('../controllers/kbController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public or customer-accessible read endpoints
router.get('/', getArticles);
router.get('/:id', getArticleById);
router.post('/:id/vote', voteHelpful);

// Protected authoring endpoints (agent or admin)
router.post('/', protect, authorize('agent', 'admin'), createArticle);
router.put('/:id', protect, authorize('agent', 'admin'), updateArticle);
router.delete('/:id', protect, authorize('admin'), deleteArticle);

module.exports = router;
