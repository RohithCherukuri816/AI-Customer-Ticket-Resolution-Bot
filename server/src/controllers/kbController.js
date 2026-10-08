const KnowledgeBase = require('../models/KnowledgeBase');

// @desc    Get all KB articles with filter
// @route   GET /api/kb
const getArticles = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const articles = await KnowledgeBase.find(query).sort({ helpfulCount: -1, createdAt: -1 });

    res.json({ success: true, count: articles.length, data: articles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single KB article by ID
// @route   GET /api/kb/:id
const getArticleById = async (req, res) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    res.json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new KB article
// @route   POST /api/kb
const createArticle = async (req, res) => {
  try {
    const { title, category, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const tagsArray = Array.isArray(tags) ? tags : (tags || '').split(',').map((t) => t.trim()).filter(Boolean);

    const article = await KnowledgeBase.create({
      title,
      category: category || 'General Support',
      content,
      tags: tagsArray,
    });

    res.status(201).json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update KB article
// @route   PUT /api/kb/:id
const updateArticle = async (req, res) => {
  try {
    const article = await KnowledgeBase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete KB article
// @route   DELETE /api/kb/:id
const deleteArticle = async (req, res) => {
  try {
    const article = await KnowledgeBase.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Vote article helpful or unhelpful
// @route   POST /api/kb/:id/vote
const voteHelpful = async (req, res) => {
  try {
    const { helpful } = req.body;
    const article = await KnowledgeBase.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    if (helpful) {
      article.helpfulCount += 1;
    } else {
      article.unhelpfulCount += 1;
    }

    await article.save();
    res.json({ success: true, helpfulCount: article.helpfulCount, unhelpfulCount: article.unhelpfulCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  voteHelpful,
};
