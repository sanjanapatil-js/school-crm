const { Exam, Class, Result, Student, User } = require('../models');
const { Op } = require('sequelize');

const getAllExams = async (req, res) => {
  try {
    const { classId, type, academicYear, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (classId) whereClause.classId = classId;
    if (type) whereClause.type = type;
    if (academicYear) whereClause.academicYear = academicYear;

    const { count, rows: exams } = await Exam.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'grade', 'section']
        },
        {
          model: Result,
          as: 'results',
          include: [
            {
              model: Student,
              as: 'student',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['firstName', 'lastName']
                }
              ]
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['examDate', 'DESC']]
    });

    res.json({
      success: true,
      data: exams,
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

const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [
        {
          model: Class,
          as: 'class'
        },
        {
          model: Result,
          as: 'results',
          include: [
            {
              model: Student,
              as: 'student',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['firstName', 'lastName']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createExam = async (req, res) => {
  try {
    const exam = await Exam.create(req.body);

    const result = await Exam.findByPk(exam.id, {
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'grade', 'section']
        }
      ]
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    await Exam.update(req.body, { where: { id: req.params.id } });

    const updated = await Exam.findByPk(req.params.id, {
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'grade', 'section']
        }
      ]
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    await Result.destroy({ where: { examId: req.params.id } });
    await Exam.destroy({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam
};
