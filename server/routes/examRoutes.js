const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const examController = require('../controllers/examController');

router.get('/', authMiddleware, authorize('admin', 'teacher', 'student'), examController.getAllExams);
router.get('/:id', authMiddleware, authorize('admin', 'teacher', 'student'), examController.getExamById);
router.post('/', authMiddleware, authorize('admin', 'teacher'), examController.createExam);
router.put('/:id', authMiddleware, authorize('admin', 'teacher'), examController.updateExam);
router.delete('/:id', authMiddleware, authorize('admin'), examController.deleteExam);

module.exports = router;
