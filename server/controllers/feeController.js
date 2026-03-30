const { Fee, Student, User } = require('../models');
const { Op } = require('sequelize');

const getAllFees = async (req, res) => {
  try {
    const { studentId, status, feeType, academicYear, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (studentId) whereClause.studentId = studentId;
    if (status) whereClause.status = status;
    if (feeType) whereClause.feeType = feeType;
    if (academicYear) whereClause.academicYear = academicYear;

    const { count, rows: fees } = await Fee.findAndCountAll({
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
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['dueDate', 'DESC']]
    });

    res.json({
      success: true,
      data: fees,
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

const getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email']
            }
          ]
        }
      ]
    });

    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    res.json({ success: true, data: fee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFee = async (req, res) => {
  try {
    const fee = await Fee.create(req.body);

    const result = await Fee.findByPk(fee.id, {
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
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const recordPayment = async (req, res) => {
  try {
    const { paidAmount, paymentMethod, transactionId, paidDate } = req.body;
    const fee = await Fee.findByPk(req.params.id);

    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    const totalPaid = parseFloat(fee.paidAmount) + parseFloat(paidAmount);
    let status = 'partial';
    if (totalPaid >= fee.amount) status = 'paid';

    await Fee.update(
      { 
        paidAmount: totalPaid, 
        paymentMethod, 
        transactionId, 
        paidDate,
        status 
      },
      { where: { id: req.params.id } }
    );

    const updated = await Fee.findByPk(req.params.id, {
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
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeeSummary = async (req, res) => {
  try {
    const { studentId } = req.query;
    const whereClause = studentId ? { studentId } : {};

    const fees = await Fee.findAll({ where: whereClause });

    const summary = {
      totalAmount: fees.reduce((sum, f) => sum + parseFloat(f.amount), 0),
      totalPaid: fees.reduce((sum, f) => sum + parseFloat(f.paidAmount), 0),
      pendingAmount: fees.reduce((sum, f) => sum + (parseFloat(f.amount) - parseFloat(f.paidAmount)), 0),
      byStatus: {
        paid: fees.filter(f => f.status === 'paid').length,
        pending: fees.filter(f => f.status === 'pending').length,
        partial: fees.filter(f => f.status === 'partial').length,
        overdue: fees.filter(f => f.status === 'overdue').length
      }
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllFees,
  getFeeById,
  createFee,
  recordPayment,
  getFeeSummary
};
