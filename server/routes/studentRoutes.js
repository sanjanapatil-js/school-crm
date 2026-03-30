const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const studentController = require('../controllers/studentController');

router.get('/', authMiddleware, authorize('admin', 'teacher'), studentController.getAllStudents);
router.get('/:id', authMiddleware, authorize('admin', 'teacher', 'student'), studentController.getStudentById);
router.post('/', authMiddleware, authorize('admin'), studentController.studentValidation, validateRequest, studentController.createStudent);
router.put('/:id', authMiddleware, authorize('admin'), studentController.updateStudent);
router.delete('/:id', authMiddleware, authorize('admin'), studentController.deleteStudent);

module.exports = router;
