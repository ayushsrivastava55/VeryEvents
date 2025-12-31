const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { ethers } = require('ethers');
const { sequelize, User, Event, Ticket } = require('./models');
const web3Service = require('./services/web3Service');

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Verychat API config
const VERY_PROJECT_ID = process.env.VERY_PROJECT_ID;
const VERY_API_BASE = process.env.VERY_API_BASE || 'https://gapi.veryapi.io';
const JWT_SECRET = process.env.JWT_SECRET || 'veryevents_secret_key';

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findByPk(decoded.userId);
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes - VeryChat API Integration (using official GAPI endpoints)

// Step 1: Request verification code via VeryChat
app.post('/api/auth/request-code', async (req, res) => {
  const { handleId } = req.body;
  
  if (!handleId) {
    return res.status(400).json({ error: 'handleId is required' });
  }

  try {
    const response = await axios.post(`${VERY_API_BASE}/auth/request-verification-code`, {
      projectId: VERY_PROJECT_ID,
      handleId: handleId.startsWith('@') ? handleId.slice(1) : handleId,
    });
    
    console.log('Verification code requested for:', handleId);
    res.json({ 
      success: true, 
      message: 'Verification code sent via VeryChat',
      statusCode: response.data.statusCode 
    });
  } catch (error) {
    console.error('Error requesting code:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to send verification code',
      message: error.response?.data?.message || error.message
    });
  }
});

// Step 2: Verify code only (no tokens) - for simple possession check
app.post('/api/auth/verify-code', async (req, res) => {
  const { handleId, verificationCode } = req.body;
  
  if (!handleId || !verificationCode) {
    return res.status(400).json({ error: 'handleId and verificationCode are required' });
  }

  try {
    const response = await axios.post(`${VERY_API_BASE}/auth/verify-code`, {
      projectId: VERY_PROJECT_ID,
      handleId: handleId.startsWith('@') ? handleId.slice(1) : handleId,
      verificationCode: parseInt(verificationCode),
    });
    
    res.json({ 
      success: true, 
      message: response.data.message,
      statusCode: response.data.statusCode 
    });
  } catch (error) {
    console.error('Error verifying code:', error.response?.data || error.message);
    res.status(error.response?.status || 401).json({ 
      error: 'Invalid or expired verification code',
      message: error.response?.data?.message || error.message
    });
  }
});

// Step 3: Verify code and get tokens (actual login)
app.post('/api/auth/login', async (req, res) => {
  const { handleId, verificationCode, walletAddress } = req.body;
  
  if (!handleId || !verificationCode) {
    return res.status(400).json({ error: 'handleId and verificationCode are required' });
  }

  try {
    // Get tokens from VeryChat API
    const response = await axios.post(`${VERY_API_BASE}/auth/get-tokens`, {
      projectId: VERY_PROJECT_ID,
      handleId: handleId.startsWith('@') ? handleId.slice(1) : handleId,
      verificationCode: parseInt(verificationCode),
    });

    console.log('VeryChat API response:', JSON.stringify(response.data, null, 2));

    // Check if response has the expected structure
    if (!response.data || response.data.statusCode !== 200) {
      return res.status(401).json({ 
        error: 'Login failed',
        message: response.data?.message || 'Invalid verification code'
      });
    }

    // VeryChat returns profileId/profileName at ROOT level (not nested in user object)
    const { accessToken, refreshToken, profileId, profileName, profileImage } = response.data;

    // Validate user data
    if (!profileId) {
      console.error('Invalid user data from VeryChat:', response.data);
      return res.status(500).json({ 
        error: 'Invalid response from VeryChat API',
        message: 'User data is missing or malformed'
      });
    }

    // Find or create user in our database
    let [user, created] = await User.findOrCreate({
      where: { verychatId: profileId },
      defaults: {
        verychatId: profileId,
        displayName: profileName || profileId,
        profileImage: profileImage || null,
        walletAddress: walletAddress || null,
        kycVerified: true, // VeryChat users are KYC verified
      },
    });

    // Update user info if exists
    if (!created) {
      user.displayName = profileName || user.displayName;
      user.profileImage = profileImage || user.profileImage;
      if (walletAddress) user.walletAddress = walletAddress;
      await user.save();
    }

    // Create our own JWT that includes VeryChat tokens
    const token = jwt.sign(
      { 
        userId: user.id, 
        verychatId: profileId,
        veryAccessToken: accessToken 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' } // 7 days expiry
    );

    res.json({ 
      success: true,
      token,
      refreshToken,
      user: { 
        id: user.id, 
        verychatId: user.verychatId,
        displayName: user.displayName,
        profileImage: user.profileImage,
        walletAddress: user.walletAddress, 
        kycVerified: user.kycVerified 
      } 
    });
  } catch (error) {
    console.error('Error logging in:', error.response?.data || error.message);
    res.status(error.response?.status || 401).json({ 
      error: 'Login failed',
      message: error.response?.data?.message || error.message
    });
  }
});

// Refresh tokens
app.post('/api/auth/refresh', async (req, res) => {
  const { handleId, refreshToken } = req.body;
  
  if (!handleId || !refreshToken) {
    return res.status(400).json({ error: 'handleId and refreshToken are required' });
  }

  try {
    const response = await axios.post(`${VERY_API_BASE}/auth/refresh-tokens`, {
      projectId: VERY_PROJECT_ID,
      handleId: handleId.startsWith('@') ? handleId.slice(1) : handleId,
      refreshToken,
    });

    // Find user
    const user = await User.findOne({ where: { verychatId: handleId.replace('@', '') } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create new JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        verychatId: user.verychatId,
        veryAccessToken: response.data.accessToken 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true,
      token,
      refreshToken: response.data.refreshToken,
      accessToken: response.data.accessToken
    });
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    res.status(error.response?.status || 401).json({ 
      error: 'Token refresh failed',
      message: error.response?.data?.message || error.message
    });
  }
});

// Get current user info
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  res.json({
    id: req.user.id,
    verychatId: req.user.verychatId,
    displayName: req.user.displayName,
    profileImage: req.user.profileImage,
    walletAddress: req.user.walletAddress,
    kycVerified: req.user.kycVerified,
  });
});

// Event Routes
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { status: 'active' },
      include: [{ model: User, as: 'organizer', attributes: ['id', 'walletAddress'] }],
      order: [['date', 'ASC']],
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/events', authMiddleware, async (req, res) => {
  const { name, description, location, isVirtual, date, ticketPrice, maxTickets, category, imageUrl } = req.body;
  try {
    // Create event in database
    const event = await Event.create({
      name,
      description,
      location,
      isVirtual,
      date,
      ticketPrice,
      maxTickets,
      category,
      imageUrl,
      organizerId: req.user.id,
      status: 'active',
    });

    // Automatically deploy smart contract for the event
    try {
      const contractAddress = await web3Service.deployEventContract(
        event.name,
        event.date,
        event.ticketPrice,
        event.maxTickets,
        event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop'
      );

      // Update event with contract address
      await event.update({ contractAddress });
      
      console.log(`Event ${event.id} deployed to contract ${contractAddress}`);
    } catch (deployError) {
      console.error('Error deploying contract:', deployError);
      // Event is still created, just without contract (can be deployed later)
    }

    // Fetch updated event with contract address
    const updatedEvent = await Event.findByPk(event.id);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{ model: User, as: 'organizer', attributes: ['id', 'walletAddress'] }],
    });
    if (event) res.json(event);
    else res.status(404).json({ error: 'Event not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

app.patch('/api/events/:id/activate', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.organizerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    // Check if already activated
    if (event.contractAddress && event.status === 'active') {
      return res.json(event);
    }

    // Deploy contract on blockchain
    const { deployEventContract } = require('./services/web3Service');

    console.log('Deploying contract for event:', event.id);
    const result = await deployEventContract(
      event.name,
      event.date,
      parseFloat(event.ticketPrice),
      event.maxTickets,
      event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop'
    );

    console.log('Contract deployed:', result.contractAddress);

    // Update event with contract address
    event.contractAddress = result.contractAddress;
    event.status = 'active';
    await event.save();

    res.json({
      ...event.toJSON(),
      deployment: {
        contractAddress: result.contractAddress,
        txHash: result.txHash,
        blockNumber: result.blockNumber
      }
    });
  } catch (error) {
    console.error('Error activating event:', error);
    res.status(500).json({
      error: 'Failed to activate event',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Ticket Routes
app.post('/api/tickets/buy', authMiddleware, async (req, res) => {
  const { eventId, txHash, tokenId } = req.body;
  try {
    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.status !== 'active') return res.status(400).json({ error: 'Event not active' });
    if (event.ticketsSold >= event.maxTickets) return res.status(400).json({ error: 'Event sold out' });

    // Check if user already has a ticket
    const existingTicket = await Ticket.findOne({
      where: { eventId, userId: req.user.id }
    });
    if (existingTicket) {
      return res.status(400).json({ error: 'You already have a ticket for this event' });
    }

    // Verify the transaction on blockchain if provided
    if (txHash && event.contractAddress) {
      const { getEventContract } = require('./services/web3Service');
      const { ethers } = require('ethers');

      try {
        const contract = getEventContract(event.contractAddress);
        const provider = contract.runner.provider;

        // Get transaction receipt
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
          return res.status(400).json({ error: 'Transaction not found or not confirmed' });
        }

        // Verify transaction was to the event contract
        if (receipt.to.toLowerCase() !== event.contractAddress.toLowerCase()) {
          return res.status(400).json({ error: 'Transaction not for this event' });
        }

        console.log('Transaction verified:', txHash);
      } catch (verifyError) {
        console.error('Error verifying transaction:', verifyError);
        // Continue anyway - transaction might be valid but verification failed
      }
    }

    // Create ticket record
    const ticket = await Ticket.create({
      eventId,
      userId: req.user.id,
      txHash: txHash || null,
      tokenId: tokenId || null,
      status: txHash ? 'confirmed' : 'pending',
      qrCode: `veryevents://${eventId}/${tokenId || Date.now()}`,
    });

    // Update event ticket count
    event.ticketsSold += 1;
    await event.save();

    // Return ticket with event details
    const ticketWithEvent = await Ticket.findByPk(ticket.id, {
      include: [{ model: Event }]
    });

    res.json(ticketWithEvent);
  } catch (error) {
    console.error('Error buying ticket:', error);
    res.status(500).json({
      error: 'Failed to buy ticket',
      message: error.message
    });
  }
});

app.get('/api/tickets/my', authMiddleware, async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      where: { userId: req.user.id },
      include: [{ model: Event }],
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

app.post('/api/tickets/:id/checkin', authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, { include: [{ model: Event }] });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (ticket.Event.organizerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (ticket.status === 'used') return res.status(400).json({ error: 'Ticket already used' });

    ticket.status = 'used';
    ticket.checkedInAt = new Date();
    await ticket.save();
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', chain: 'VERY Mainnet', chainId: 4613 });
});

const PORT = process.env.PORT || 3001;

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => console.log(`VeryEvents backend running on port ${PORT}`));
}).catch(err => {
  console.error('Database sync failed:', err);
});
