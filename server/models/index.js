const User = require('./User');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Class = require('./Class');
const Attendance = require('./Attendance');
const Fee = require('./Fee');
const Exam = require('./Exam');
const Result = require('./Result');

// Define associations

// User associations
User.hasOne(Student, { foreignKey: 'userId', as: 'student' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Teacher, { foreignKey: 'userId', as: 'teacher' });
Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Class associations
Class.hasMany(Student, { foreignKey: 'classId', as: 'students' });
Student.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

Class.hasMany(Attendance, { foreignKey: 'classId', as: 'attendance' });
Attendance.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

Class.hasMany(Exam, { foreignKey: 'classId', as: 'exams' });
Exam.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

// Teacher associations
Teacher.hasMany(Class, { foreignKey: 'teacherId', as: 'classes' });
Class.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });

// Student associations
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendance' });
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Student.hasMany(Fee, { foreignKey: 'studentId', as: 'fees' });
Fee.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Student.hasMany(Result, { foreignKey: 'studentId', as: 'results' });
Result.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

// Exam associations
Exam.hasMany(Result, { foreignKey: 'examId', as: 'results' });
Result.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

module.exports = {
  User,
  Student,
  Teacher,
  Class,
  Attendance,
  Fee,
  Exam,
  Result
};
