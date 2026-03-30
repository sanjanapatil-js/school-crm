const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  rollNumber: {
    type: DataTypes.STRING,
    unique: true
  },
  dateOfBirth: {
    type: DataTypes.DATE
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other')
  },
  classId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  section: {
    type: DataTypes.STRING
  },
  admissionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  parentName: {
    type: DataTypes.STRING
  },
  parentPhone: {
    type: DataTypes.STRING
  },
  parentEmail: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'students',
  timestamps: true
});

module.exports = Student;
