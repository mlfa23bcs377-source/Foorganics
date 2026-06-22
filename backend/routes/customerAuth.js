const router = require('express').Router();
const customerProtect = require('../middleware/customerAuth');
const ctrl = require('../controllers/customerAuthController');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', customerProtect, ctrl.getMe);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);

module.exports = router;
