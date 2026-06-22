const router = require('express').Router();
const protect = require('../middleware/auth');
const { login, getMe } = require('../controllers/authController');

router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
