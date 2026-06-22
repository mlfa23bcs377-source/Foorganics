const router = require('express').Router();
const protect = require('../middleware/auth');
const { getAll, create, update, remove } = require('../controllers/supplierController');

router.use(protect);
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
