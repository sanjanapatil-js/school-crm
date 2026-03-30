const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const classController = require('../controllers/classController');

router.get('/', authMiddleware, authorize('admin', 'teacher'), classController.getAllClasses);
router.get('/:id', authMiddleware, authorize('admin', 'teacher'), classController.getClassById);
router.post('/', authMiddleware, authorize('admin'), classController.createClass);
router.put('/:id', authMiddleware, authorize('admin'), classController.updateClass);
router.delete('/:id', authMiddleware, authorize('admin'), classController.deleteClass);

module.exports = router;
