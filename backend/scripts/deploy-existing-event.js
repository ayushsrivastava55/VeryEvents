const { sequelize, User, Event } = require('../models');
const { deployEventContract } = require('../services/web3Service');

async function fixAndDeploy() {
  await sequelize.sync();

  // Get the user
  const user = await User.findOne();
  const event = await Event.findByPk('4401546a-5926-41c7-a647-645fbb389427');

  if (!event) {
    console.log('Event not found');
    return;
  }

  console.log('Event found:', event.name);

  // Assign organizer if not set
  if (!event.organizerId) {
    event.organizerId = user.id;
    await event.save();
    console.log('✅ Assigned organizer to event');
  }

  // Deploy contract
  console.log('🚀 Deploying EventTicket contract...');
  console.log('Event details:', {
    name: event.name,
    date: event.date,
    price: event.ticketPrice,
    maxTickets: event.maxTickets
  });

  const result = await deployEventContract(
    event.name,
    event.date,
    parseFloat(event.ticketPrice),
    event.maxTickets
  );

  console.log('✅ Contract deployed:', result.contractAddress);
  console.log('Transaction hash:', result.txHash);

  // Update event
  event.contractAddress = result.contractAddress;
  event.status = 'active';
  await event.save();

  console.log('✅ Event updated with contract address');
  console.log('View on VeryScan:', `https://veryscan.io/address/${result.contractAddress}`);

  await sequelize.close();
  process.exit(0);
}

fixAndDeploy().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
