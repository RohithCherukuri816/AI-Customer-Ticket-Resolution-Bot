const express = require('express');
const router = express.Router();
const { register, login, getMe, listAgents, getDemoAccounts } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/agents', protect, listAgents);
router.get('/demo-accounts', getDemoAccounts);

module.exports = router;
