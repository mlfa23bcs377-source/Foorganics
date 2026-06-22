const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/salaryController');
const protect = require('../middleware/auth');

router.use(protect);
router.post('/bulk-create', ctrl.bulkCreateForMonth);
router.route('/').get(ctrl.getAll).post(ctrl.create);
router.route('/:id').put(ctrl.update);

module.exports = router;
