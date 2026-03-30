const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const attendanceController = require('../controllers/attendanceController');

router.get('/', authMiddleware, authorize('admin', 'teacher'), attendanceController.getAttendance);
router.post('/', authMiddleware, authorize('admin', 'teacher'), attendanceController.markAttendance);
router.post('/bulk', authMiddleware, authorize('admin', 'teacher'), attendanceController.bulkMarkAttendance);
router.get('/summary/:studentId', authMiddleware, authorize('admin', 'teacher', 'student'), attendanceController.getStudentAttendanceSummary);

module.exports = router;
