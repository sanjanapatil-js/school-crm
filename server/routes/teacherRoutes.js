const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const teacherController = require('../controllers/teacherController');

router.get('/', authMiddleware, authorize('admin', 'teacher'), teacherController.getAllTeachers);
router.get('/:id', authMiddleware, authorize('admin', 'teacher'), teacherController.getTeacherById);
router.post('/', authMiddleware, authorize('admin'), teacherController.teacherValidation, validateRequest, teacherController.createTeacher);
router.put('/:id', authMiddleware, authorize('admin'), teacherController.updateTeacher);
router.delete('/:id', authMiddleware, authorize('admin'), teacherController.deleteTeacher);

module.exports = router;
