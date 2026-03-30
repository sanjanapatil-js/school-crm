const { Result, Exam, Student, User } = require('../models');
const { Op } = require('sequelize');

const calculateGrade = (marks, maxMarks, passMarks) => {
  const percentage = (marks / maxMarks) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  if (marks >= passMarks) return 'E';
  return 'F';
};

const getAllResults = async (req, res) => {
  try {
    const { examId, studentId, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (examId) whereClause.examId = examId;
    if (studentId) whereClause.studentId = studentId;

    const { count, rows: results } = await Result.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Exam,
          as: 'exam',
          include: [
            {
              model: require('../models').Class,
              as: 'class',
              attributes: ['name', 'grade', 'section']
            }
          ]
        },
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
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: results,
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

const createResult = async (req, res) => {
  try {
    const { examId, studentId, marksObtained, remarks } = req.body;

    const existing = await Result.findOne({ where: { examId, studentId } });
    if (existing) {
      return res.status(400).json({ message: 'Result already exists for this student and exam' });
    }

    const exam = await Exam.findByPk(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const grade = calculateGrade(marksObtained, exam.maxMarks, exam.passMarks);
    const isPassed = marksObtained >= exam.passMarks;

    const result = await Result.create({
      examId,
      studentId,
      marksObtained,
      grade,
      remarks,
      isPassed
    });

    const fullResult = await Result.findByPk(result.id, {
      include: [
        {
          model: Exam,
          as: 'exam',
          include: [
            {
              model: require('../models').Class,
              as: 'class',
              attributes: ['name', 'grade', 'section']
            }
          ]
        },
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
    });

    res.status(201).json({ success: true, data: fullResult });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateResult = async (req, res) => {
  try {
    const { marksObtained, remarks } = req.body;
    const result = await Result.findByPk(req.params.id, {
      include: [{ model: Exam, as: 'exam' }]
    });

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    const exam = result.exam;
    const grade = calculateGrade(marksObtained, exam.maxMarks, exam.passMarks);
    const isPassed = marksObtained >= exam.passMarks;

    await Result.update(
      { marksObtained, remarks, grade, isPassed },
      { where: { id: req.params.id } }
    );

    const updated = await Result.findByPk(req.params.id, {
      include: [
        {
          model: Exam,
          as: 'exam',
          include: [
            {
              model: require('../models').Class,
              as: 'class',
              attributes: ['name', 'grade', 'section']
            }
          ]
        },
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
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteResult = async (req, res) => {
  try {
    const result = await Result.findByPk(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    await Result.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentReport = async (req, res) => {
  try {
    const { studentId, academicYear } = req.query;

    const whereClause = { studentId };
    if (academicYear) {
      whereClause['$exam.academicYear$'] = academicYear;
    }

    const results = await Result.findAll({
      where: whereClause,
      include: [
        {
          model: Exam,
          as: 'exam',
          include: [
            {
              model: require('../models').Class,
              as: 'class',
              attributes: ['name', 'grade', 'section']
            }
          ]
        },
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
    });

    const summary = {
      totalExams: results.length,
      passed: results.filter(r => r.isPassed).length,
      failed: results.filter(r => !r.isPassed).length,
      averageMarks: results.length > 0 
        ? (results.reduce((sum, r) => sum + parseFloat(r.marksObtained), 0) / results.length).toFixed(2)
        : 0,
      results: results
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllResults,
  createResult,
  updateResult,
  deleteResult,
  getStudentReport
};
