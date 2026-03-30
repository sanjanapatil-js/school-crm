const { User, Student, Teacher, Class, Attendance, Fee, Exam, Result } = require('../models');
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.count();
    const totalTeachers = await Teacher.count();
    const totalClasses = await Class.count();
    const totalUsers = await User.count();

    const today = new Date().toISOString().split('T')[0];
    const presentToday = await Attendance.count({
      where: { date: today, status: 'present' }
    });
    const absentToday = await Attendance.count({
      where: { date: today, status: 'absent' }
    });

    const pendingFees = await Fee.sum('amount', {
      where: {
        status: { [Op.in]: ['pending', 'partial'] }
      }
    });

    const collectedFees = await Fee.sum('paidAmount', {
      where: {
        status: { [Op.in]: ['paid', 'partial'] }
      }
    });

    const upcomingExams = await Exam.findAll({
      where: {
        examDate: { [Op.gte]: new Date() }
      },
      order: [['examDate', 'ASC']],
      limit: 5,
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'grade', 'section']
        }
      ]
    });

    const recentStudents = await Student.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        counts: {
          students: totalStudents,
          teachers: totalTeachers,
          classes: totalClasses,
          users: totalUsers
        },
        attendance: {
          present: presentToday,
          absent: absentToday,
          total: presentToday + absentToday
        },
        fees: {
          pending: pendingFees || 0,
          collected: collectedFees || 0
        },
        upcomingExams,
        recentStudents
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.teacher?.id;
    
    const classes = await Class.findAll({
      where: { teacherId },
      include: [
        {
          model: Student,
          as: 'students',
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

    const today = new Date().toISOString().split('T')[0];
    const classIds = classes.map(c => c.id);
    
    const attendanceMarked = await Attendance.count({
      where: { 
        classId: { [Op.in]: classIds },
        date: today
      }
    });

    const upcomingExams = await Exam.findAll({
      where: {
        classId: { [Op.in]: classIds },
        examDate: { [Op.gte]: new Date() }
      },
      order: [['examDate', 'ASC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        classes,
        attendanceMarked,
        upcomingExams
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.student?.id;

    const attendance = await Attendance.findAll({
      where: { studentId },
      order: [['date', 'DESC']],
      limit: 30
    });

    const attendanceSummary = {
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      total: attendance.length
    };

    const fees = await Fee.findAll({
      where: { studentId },
      order: [['dueDate', 'DESC']]
    });

    const feeSummary = {
      total: fees.reduce((sum, f) => sum + parseFloat(f.amount), 0),
      paid: fees.reduce((sum, f) => sum + parseFloat(f.paidAmount), 0),
      pending: fees.reduce((sum, f) => sum + (parseFloat(f.amount) - parseFloat(f.paidAmount)), 0)
    };

    const results = await Result.findAll({
      where: { studentId },
      include: [
        {
          model: Exam,
          as: 'exam',
          include: [
            {
              model: Class,
              as: 'class',
              attributes: ['name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    const upcomingExams = await Exam.findAll({
      where: {
        classId: req.user.student?.classId,
        examDate: { [Op.gte]: new Date() }
      },
      order: [['examDate', 'ASC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        attendance: attendanceSummary,
        fees: feeSummary,
        results,
        upcomingExams
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getTeacherDashboard,
  getStudentDashboard
};
