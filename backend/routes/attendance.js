const router = require('express').Router();
const protect = require('../middleware/auth');
const ctrl = require('../controllers/attendanceController');

router.use(protect);

router.get('/report/monthly', ctrl.getMonthlyReport);
router.get('/report/employee/:employeeId', ctrl.getEmployeeReport);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
