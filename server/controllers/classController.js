const { Class, Teacher, Student } = require('../models');
const { Op } = require('sequelize');

const getAllClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { grade: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: classes } = await Class.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: require('../models').User,
              as: 'user',
              attributes: ['firstName', 'lastName']
            }
          ]
        },
        {
          model: Student,
          as: 'students'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['grade', 'ASC'], ['section', 'ASC']]
    });

    res.json({
      success: true,
      data: classes,
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

const getClassById = async (req, res) => {
  try {
    const classItem = await Class.findByPk(req.params.id, {
      include: [
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: require('../models').User,
              as: 'user',
              attributes: ['firstName', 'lastName']
            }
          ]
        },
        {
          model: Student,
          as: 'students',
          include: [
            {
              model: require('../models').User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email']
            }
          ]
        }
      ]
    });

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({ success: true, data: classItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createClass = async (req, res) => {
  try {
    const classItem = await Class.create(req.body);
    
    const result = await Class.findByPk(classItem.id, {
      include: [
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: require('../models').User,
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

const updateClass = async (req, res) => {
  try {
    const classItem = await Class.findByPk(req.params.id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await Class.update(req.body, { where: { id: req.params.id } });

    const updated = await Class.findByPk(req.params.id, {
      include: [
        {
          model: Teacher,
          as: 'teacher',
          include: [
            {
              model: require('../models').User,
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

const deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findByPk(req.params.id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await Class.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
};
