const router = require('express').Router();
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/productController');

// Public routes
router.get('/listed', ctrl.getListed);
router.get('/listed/:id', ctrl.getListedById);

// Protected routes
router.use(protect);
router.get('/stats', ctrl.getStats);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.patch('/:id/toggle-listed', ctrl.toggleListed);
router.post('/upload-image', upload.single('image'), ctrl.uploadImage);
router.delete('/upload-image', ctrl.deleteImage);

module.exports = router;
