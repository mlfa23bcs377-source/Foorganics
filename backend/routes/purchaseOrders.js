const router = require('express').Router();
const protect = require('../middleware/auth');
const { getAll, create, receive } = require('../controllers/purchaseOrderController');

router.use(protect);
router.get('/', getAll);
router.post('/', create);
router.patch('/:id/receive', receive);

module.exports = router;
