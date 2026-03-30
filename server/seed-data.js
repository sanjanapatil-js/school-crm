const seedData = require('./seed');
const sequelize = require('./config/database');

const runSeed = async () => {
  try {
    await sequelize.authenticate();
    await seedData();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
