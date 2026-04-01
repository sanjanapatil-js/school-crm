const { User, Student, Class } = require('../models');
const { hashPassword } = require('../utils/auth');
const { body } = require('express-validator');
const { Op } = require('sequelize');

const studentValidation = [
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('rollNumber').optional().trim()
];

const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, classId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    const userWhere = {};

    if (search) {
      userWhere[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (classId) {
      whereClause.classId = classId;
    }

    const { count, rows: students } = await Student.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          where: userWhere,
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'isActive']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'grade', 'section']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'DESC']]
    });

    res.json({
      success: true,
      data: students,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          model: Class,
          as: 'class'
        }
      ]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStudent = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address, ...studentData } = req.body;

    console.log('Creating student with email:', email);
    console.log('Password received:', password ? 'Yes (length: ' + password.length + ')' : 'No');

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await hashPassword(password || 'password123');
    console.log('Password hashed successfully');

    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'student',
      firstName,
      lastName,
      phone,
      address
    });

    console.log('User created with ID:', user.id);

    const student = await Student.create({
      userId: user.id,
      ...studentData
    });

    const result = await Student.findByPk(student.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          model: Class,
          as: 'class'
        }
      ]
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, isActive, ...studentData } = req.body;
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await User.update(
      { firstName, lastName, phone, address, isActive },
      { where: { id: student.userId } }
    );

    await Student.update(studentData, { where: { id: req.params.id } });

    const updated = await Student.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          model: Class,
          as: 'class'
        }
      ]
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.destroy({ where: { id: req.params.id } });
    await User.destroy({ where: { id: student.userId } });

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  studentValidation,
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
