const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false
  },
  section: {
    type: DataTypes.STRING
  },
  teacherId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  academicYear: {
    type: DataTypes.STRING
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  roomNumber: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'classes',
  timestamps: true
});

module.exports = Class;
