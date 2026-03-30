const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', authMiddleware, authorize('admin'), dashboardController.getDashboardStats);
router.get('/teacher', authMiddleware, authorize('teacher'), dashboardController.getTeacherDashboard);
router.get('/student', authMiddleware, authorize('student'), dashboardController.getStudentDashboard);

module.exports = router;
