const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('midterm', 'final', 'quiz', 'assignment', 'practical', 'other'),
    allowNull: false
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  examDate: {
    type: DataTypes.DATE
  },
  startTime: {
    type: DataTypes.TIME
  },
  endTime: {
    type: DataTypes.TIME
  },
  maxMarks: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 100.00
  },
  passMarks: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 40.00
  },
  academicYear: {
    type: DataTypes.STRING
  },
  instructions: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'exams',
  timestamps: true
});

module.exports = Exam;
