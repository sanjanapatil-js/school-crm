const express = require('express');
const router = express.Router();
const seedData = require('../seed');

router.get('/', async (req, res) => {
  try {
    await seedData();
    res.json({ 
      success: true, 
      message: 'Database seeded successfully!',
      credentials: {
        admin: { email: 'admin@school.com', password: 'admin123' },
        teacher: { email: 'teacher@school.com', password: 'teacher123' },
        student: { email: 'student@school.com', password: 'student123' }
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error seeding database', 
      error: error.message 
    });
  }
});

module.exports = router;
