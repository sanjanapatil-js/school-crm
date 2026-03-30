const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fee = sequelize.define('Fee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  feeType: {
    type: DataTypes.ENUM('tuition', 'exam', 'library', 'transport', 'sports', 'other'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  dueDate: {
    type: DataTypes.DATE
  },
  paidDate: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'cheque', 'online')
  },
  transactionId: {
    type: DataTypes.STRING
  },
  academicYear: {
    type: DataTypes.STRING
  },
  month: {
    type: DataTypes.STRING
  },
  remarks: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'fees',
  timestamps: true
});

module.exports = Fee;
