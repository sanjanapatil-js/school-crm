const { User, Student, Teacher } = require('../models');
const { generateToken, hashPassword, comparePassword } = require('../utils/auth');
const { body } = require('express-validator');
const { Op } = require('sequelize');

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().isLength({ min: 6 })
];

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    await User.update({ lastLogin: new Date() }, { where: { id: user.id } });

    const token = generateToken(user.id);

    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ where: { userId: user.id } });
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ where: { userId: user.id } });
    }

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'student') {
      profile = await Student.findOne({ 
        where: { userId: user.id },
        include: ['class']
      });
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ 
        where: { userId: user.id },
        include: ['classes']
      });
    }

    res.json({
      success: true,
      user: {
        ...user.toJSON(),
        profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await User.update({ password: hashedPassword }, { where: { id: user.id } });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginValidation,
  login,
  getProfile,
  changePassword
};
