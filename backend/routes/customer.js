const router = require('express').Router();
const customerProtect = require('../middleware/customerAuth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/customerController');

// Public route — no auth required
router.get('/track/:identifier', ctrl.trackOrder);

// All routes below require customer auth
router.use(customerProtect);

router.get('/me', ctrl.getProfile);
router.put('/me', ctrl.updateProfile);
router.put('/me/password', ctrl.changePassword);
router.post('/me/profile-image', upload.single('image'), ctrl.uploadProfileImage);

router.get('/me/addresses', ctrl.getProfile);
router.post('/me/addresses', ctrl.addAddress);
router.put('/me/addresses/:addressId', ctrl.updateAddress);
router.delete('/me/addresses/:addressId', ctrl.deleteAddress);

router.get('/me/dashboard', ctrl.getDashboardStats);
router.get('/me/orders', ctrl.getMyOrders);
router.get('/me/orders/:id', ctrl.getMyOrderById);

module.exports = router;
