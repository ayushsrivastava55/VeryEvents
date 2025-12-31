const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Use PostgreSQL with connection string if provided, otherwise SQLite
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false,
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '..', 'database.sqlite'),
      logging: false,
    });

// Models
const User = sequelize.define('User', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  verychatId: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  displayName: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  profileImage: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  walletAddress: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  kycVerified: {
    type: Sequelize.BOOLEAN,
    defaultValue: true, // VeryChat users are KYC verified
  },
  reputation: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

const Event = sequelize.define('Event', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
  },
  location: {
    type: Sequelize.STRING,
  },
  isVirtual: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  ticketPrice: {
    type: Sequelize.DECIMAL(18, 8),
    allowNull: false,
  },
  maxTickets: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  ticketsSold: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  contractAddress: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  status: {
    type: Sequelize.ENUM('draft', 'active', 'completed', 'cancelled'),
    defaultValue: 'draft',
  },
  category: {
    type: Sequelize.STRING,
  },
  imageUrl: {
    type: Sequelize.STRING,
  },
});

const Ticket = sequelize.define('Ticket', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  tokenId: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  txHash: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  status: {
    type: Sequelize.ENUM('pending', 'confirmed', 'used', 'refunded'),
    defaultValue: 'pending',
  },
  checkedInAt: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  qrCode: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

// Associations
User.hasMany(Event, { as: 'organizedEvents', foreignKey: 'organizerId' });
Event.belongsTo(User, { as: 'organizer', foreignKey: 'organizerId' });

User.hasMany(Ticket, { foreignKey: 'userId' });
Ticket.belongsTo(User, { foreignKey: 'userId' });

Event.hasMany(Ticket, { foreignKey: 'eventId' });
Ticket.belongsTo(Event, { foreignKey: 'eventId' });

module.exports = {
  sequelize,
  User,
  Event,
  Ticket,
};
