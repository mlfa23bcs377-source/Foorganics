const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/financeController');
const protect = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', ctrl.getDashboard);
router.get('/revenue', ctrl.getRevenue);
router.get('/profit', ctrl.getProfit);
router.get('/reports', ctrl.getReports);

module.exports = router;
