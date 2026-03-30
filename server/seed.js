const { User, Student, Teacher, Class } = require('./models');
const { hashPassword } = require('./utils/auth');

const seedData = async () => {
  try {
    const existingAdmin = await User.findOne({ where: { email: 'admin@school.com' } });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const adminUser = await User.create({
      email: 'admin@school.com',
      password: await hashPassword('admin123'),
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '1234567890'
    });

    console.log('Admin user created:', adminUser.email);

    const classA = await Class.create({
      name: 'Class 10-A',
      grade: '10',
      section: 'A',
      academicYear: '2024-2025',
      capacity: 40
    });

    const teacherUser = await User.create({
      email: 'teacher@school.com',
      password: await hashPassword('teacher123'),
      role: 'teacher',
      firstName: 'John',
      lastName: 'Doe',
      phone: '9876543210'
    });

    const teacher = await Teacher.create({
      userId: teacherUser.id,
      employeeId: 'T001',
      department: 'Mathematics',
      qualification: 'M.Sc Mathematics',
      experience: 5,
      specialization: 'Algebra, Calculus'
    });

    await Class.update({ teacherId: teacher.id }, { where: { id: classA.id } });

    const studentUser = await User.create({
      email: 'student@school.com',
      password: await hashPassword('student123'),
      role: 'student',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '5555555555'
    });

    await Student.create({
      userId: studentUser.id,
      rollNumber: 'S001',
      dateOfBirth: new Date('2008-05-15'),
      gender: 'female',
      classId: classA.id,
      section: 'A',
      parentName: 'Robert Smith',
      parentPhone: '1111111111',
      parentEmail: 'parent@example.com'
    });

    console.log('Seed data created successfully!');
    console.log('Login credentials:');
    console.log('Admin: admin@school.com / admin123');
    console.log('Teacher: teacher@school.com / teacher123');
    console.log('Student: student@school.com / student123');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

module.exports = seedData;
