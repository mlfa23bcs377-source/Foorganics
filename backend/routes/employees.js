const router = require('express').Router();
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/employeeController');

router.use(protect);

router.get('/stats', ctrl.getStats);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/upload-profile-image', upload.single('image'), ctrl.uploadProfileImage);
router.delete('/upload-profile-image', ctrl.deleteProfileImage);

module.exports = router;
