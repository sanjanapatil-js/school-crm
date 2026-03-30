const { Attendance, Student, User, Class } = require('../models');
const { Op } = require('sequelize');

const getAttendance = async (req, res) => {
  try {
    const { classId, studentId, date, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (classId) whereClause.classId = classId;
    if (studentId) whereClause.studentId = studentId;
    if (date) whereClause.date = date;
    if (startDate && endDate) {
      whereClause.date = { [Op.between]: [startDate, endDate] };
    }

    const { count, rows: attendance } = await Attendance.findAndCountAll({
      where: whereClause,
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
        },
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'grade', 'section']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      data: attendance,
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

const markAttendance = async (req, res) => {
  try {
    const { studentId, classId, date, status, remarks } = req.body;

    const existing = await Attendance.findOne({
      where: { studentId, date }
    });

    if (existing) {
      await Attendance.update(
        { status, remarks, markedBy: req.user.id },
        { where: { id: existing.id } }
      );
      const updated = await Attendance.findByPk(existing.id, {
        include: [
          {
            model: Student,
            as: 'student',
            include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }]
          }
        ]
      });
      return res.json({ success: true, data: updated, message: 'Attendance updated' });
    }

    const attendance = await Attendance.create({
      studentId,
      classId,
      date,
      status,
      remarks,
      markedBy: req.user.id
    });

    const result = await Attendance.findByPk(attendance.id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }]
        }
      ]
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkMarkAttendance = async (req, res) => {
  try {
    const { classId, date, attendanceList } = req.body;

    const results = [];
    for (const record of attendanceList) {
      const existing = await Attendance.findOne({
        where: { studentId: record.studentId, date }
      });

      if (existing) {
        await Attendance.update(
          { status: record.status, remarks: record.remarks, markedBy: req.user.id },
          { where: { id: existing.id } }
        );
        results.push({ ...existing.toJSON(), status: record.status });
      } else {
        const created = await Attendance.create({
          studentId: record.studentId,
          classId,
          date,
          status: record.status,
          remarks: record.remarks,
          markedBy: req.user.id
        });
        results.push(created);
      }
    }

    res.json({ success: true, data: results, message: 'Bulk attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentAttendanceSummary = async (req, res) => {
  try {
    const { studentId, startDate, endDate } = req.query;

    const whereClause = { studentId };
    if (startDate && endDate) {
      whereClause.date = { [Op.between]: [startDate, endDate] };
    }

    const attendance = await Attendance.findAll({ where: whereClause });

    const summary = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length,
      leave: attendance.filter(a => a.status === 'leave').length
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAttendance,
  markAttendance,
  bulkMarkAttendance,
  getStudentAttendanceSummary
};
