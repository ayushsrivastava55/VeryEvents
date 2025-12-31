const { sequelize } = require('./models');

async function clearDatabase() {
  try {
    console.log('Clearing database...');
    
    // Force sync will drop and recreate all tables
    await sequelize.sync({ force: true });
    console.log('Tables recreated.');
    
    console.log('✅ Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
