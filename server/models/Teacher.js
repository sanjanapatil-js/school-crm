const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Teacher = sequelize.define('Teacher', {
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
  employeeId: {
    type: DataTypes.STRING,
    unique: true
  },
  department: {
    type: DataTypes.STRING
  },
  qualification: {
    type: DataTypes.STRING
  },
  experience: {
    type: DataTypes.INTEGER
  },
  joinDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  specialization: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'teachers',
  timestamps: true
});

module.exports = Teacher;
