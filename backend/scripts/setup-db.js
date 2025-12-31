const { sequelize, User, Event, Ticket } = require('../models');

async function setupDatabase() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connection successful');

    console.log('Syncing models...');
    await sequelize.sync({ alter: true });
    console.log('✓ Database tables created/updated');

    // Create a sample event for testing
    const [testUser] = await User.findOrCreate({
      where: { verychatId: 'test_user_001' },
      defaults: {
        phone: '+1234567890',
        walletAddress: '0x0000000000000000000000000000000000000000',
        kycVerified: true,
      },
    });
    console.log('✓ Test user created/found');

    const [testEvent] = await Event.findOrCreate({
      where: { name: 'Very Hackathon Kickoff' },
      defaults: {
        description: 'Join us for the official kickoff of the Very Network Hackathon! Meet fellow developers, learn about the ecosystem, and start building.',
        location: 'Virtual - Verychat Group',
        isVirtual: true,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        ticketPrice: 0.1,
        maxTickets: 100,
        category: 'meetup',
        organizerId: testUser.id,
        status: 'active',
      },
    });
    console.log('✓ Test event created/found');

    console.log('\n========================================');
    console.log('Database setup complete!');
    console.log('========================================');
    console.log(`Test User ID: ${testUser.id}`);
    console.log(`Test Event ID: ${testEvent.id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error.message);
    console.log('\nMake sure PostgreSQL is running and the database exists.');
    console.log('Create database with: createdb veryevents');
    process.exit(1);
  }
}

setupDatabase();
