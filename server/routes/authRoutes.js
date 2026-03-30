const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const authController = require('../controllers/authController');

router.post('/login', authController.loginValidation, validateRequest, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
