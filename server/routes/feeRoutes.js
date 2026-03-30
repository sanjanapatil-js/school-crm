const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const feeController = require('../controllers/feeController');

router.get('/', authMiddleware, authorize('admin', 'teacher'), feeController.getAllFees);
router.get('/summary', authMiddleware, authorize('admin', 'teacher'), feeController.getFeeSummary);
router.get('/:id', authMiddleware, authorize('admin', 'teacher', 'student'), feeController.getFeeById);
router.post('/', authMiddleware, authorize('admin'), feeController.createFee);
router.put('/:id/payment', authMiddleware, authorize('admin'), feeController.recordPayment);

module.exports = router;
