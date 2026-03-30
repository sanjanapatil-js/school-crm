const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const resultController = require('../controllers/resultController');

router.get('/', authMiddleware, authorize('admin', 'teacher', 'student'), resultController.getAllResults);
router.get('/report/:studentId', authMiddleware, authorize('admin', 'teacher', 'student'), resultController.getStudentReport);
router.post('/', authMiddleware, authorize('admin', 'teacher'), resultController.createResult);
router.put('/:id', authMiddleware, authorize('admin', 'teacher'), resultController.updateResult);
router.delete('/:id', authMiddleware, authorize('admin'), resultController.deleteResult);

module.exports = router;
