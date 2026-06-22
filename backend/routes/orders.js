const router = require('express').Router();
const protect = require('../middleware/auth');
const ctrl = require('../controllers/orderController');

// Public - customers place orders
router.post('/', ctrl.create);

// Protected - admin operations
router.use(protect);
router.get('/dashboard-stats', ctrl.getDashboardStats);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.patch('/:id/status', ctrl.updateStatus);
router.patch('/:id/mark-paid', ctrl.markPaid);

module.exports = router;
