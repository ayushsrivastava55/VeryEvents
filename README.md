# VeryEvents - Decentralized Event Platform

A Web3 event management platform on Very Network with NFT ticketing, phone authentication, and blockchain-verified check-ins.

## Project Status: ~60% Complete

✅ **Done**: Frontend, Backend API, Smart Contracts, Integration Layer
⚠️ **In Progress**: Blockchain deployment, Wallet integration
❌ **Todo**: Verychat bot, Rewards system, Secondary marketplace

---

## Quick Start

### 1. Backend
```bash
cd backend
npm install
node server.js
# Runs on http://localhost:3001
```

### 2. Frontend
```bash
cd very-events-hub
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. Smart Contracts (Optional)
```bash
cd contracts
npm install
npx hardhat compile
# See BLOCKCHAIN_SETUP.md for deployment
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  VERY NETWORK                       │
│  ┌──────────────┐      ┌──────────────┐            │
│  │EventFactory  │─────►│EventTicket   │ (ERC721)   │
│  │  (Deployed)  │      │   (NFTs)     │            │
│  └──────────────┘      └──────────────┘            │
│                              ▲                       │
└──────────────────────────────┼───────────────────────┘
                               │ web3.js
         ┌─────────────────────┼─────────────────────┐
         │      BACKEND (Node.js/Express)            │
         │  ┌────────────────────────────────────┐   │
         │  │ • Verychat Phone Auth             │   │
         │  │ • Event/Ticket API                │   │
         │  │ • Contract Deployment Service     │   │
         │  │ • NFT Minting Service             │   │
         │  │ • SQLite Database                 │   │
         │  └────────────────────────────────────┘   │
         └─────────────────────┬─────────────────────┘
                               │ REST API
         ┌─────────────────────┼─────────────────────┐
         │   FRONTEND (React/TypeScript/Vite)        │
         │  ┌────────────────────────────────────┐   │
         │  │ • Event Discovery & Creation      │   │
         │  │ • Ticket Purchase UI              │   │
         │  │ • Wepin Wallet Integration        │   │
         │  │ • QR Code Display                 │   │
         │  │ • Phone Verification              │   │
         │  └────────────────────────────────────┘   │
         └───────────────────────────────────────────┘
```

---

## What Works Today

### ✅ Authentication
- Phone number verification via Verychat API
- JWT token-based sessions
- User management with KYC status

### ✅ Event Management
- Create events with details (name, date, location, price)
- Category-based filtering
- Search functionality
- View event details

### ✅ Ticket System (Database)
- Buy tickets (stored in database)
- View purchased tickets
- QR code generation
- Check-in API

### ✅ Smart Contracts
- EventFactory for deploying events
- EventTicket (ERC721) for NFT tickets
- Minting, check-in, withdrawal logic
- Compiled and ready to deploy

### ✅ Blockchain Integration (Backend)
- Web3 service configured
- Contract deployment functions
- NFT minting functions
- Event listening capabilities

---

## What's Next (Priority Order)

### 🔴 Critical
1. **Deploy contracts to Very Network**
   - Get $VERY for gas
   - Deploy EventFactory
   - Test deployment

2. **Connect wallet in frontend**
   - Configure Wepin properly
   - Sign transactions
   - Display NFT tickets

3. **End-to-end NFT flow**
   - Create event → Deploy contract
   - Buy ticket → Mint NFT
   - Check-in → Verify ownership

### 🟡 High Priority
4. **QR Scanner UI**
5. **Event analytics dashboard**
6. **Ticket resale marketplace**
7. **Multiple ticket tiers**

### 🟢 Nice to Have
8. **Verychat bot integration**
9. **Rewards & POAP badges**
10. **DAO event governance**

---

## File Structure

```
very-hack/
├── backend/                    # Node.js API server
│   ├── models/                 # Sequelize models
│   │   └── index.js           # User, Event, Ticket models
│   ├── services/               # Business logic
│   │   ├── web3Service.js     # ✨ NEW: Blockchain interaction
│   │   └── abis/              # ✨ NEW: Contract ABIs
│   ├── server.js              # Express app
│   └── database.sqlite        # Local SQLite DB
│
├── very-events-hub/           # React frontend
│   ├── src/
│   │   ├── contexts/          # React contexts
│   │   │   ├── AuthContext.tsx     # ✨ UPDATED: Phone auth
│   │   │   └── WepinContext.tsx    # Wallet integration
│   │   ├── services/
│   │   │   └── api.ts         # ✨ NEW: Backend API client
│   │   ├── hooks/
│   │   │   ├── useEvents.ts   # ✨ UPDATED: Backend integration
│   │   │   └── useTickets.ts  # ✨ UPDATED: Backend integration
│   │   └── pages/
│   │       ├── Auth.tsx       # ✨ UPDATED: Phone verification UI
│   │       ├── Events.tsx     # Event listing
│   │       ├── EventDetail.tsx # Buy tickets
│   │       ├── CreateEvent.tsx # Create events
│   │       └── MyTickets.tsx  # View tickets
│   └── .env                   # Frontend config
│
├── contracts/                 # Solidity smart contracts
│   ├── contracts/
│   │   ├── EventFactory.sol   # ✨ READY: Factory contract
│   │   └── EventTicket.sol    # ✨ UPDATED: NFT tickets
│   ├── scripts/
│   │   └── deploy.js          # Deployment script
│   ├── artifacts/             # Compiled contracts
│   └── hardhat.config.js      # ✨ UPDATED: Very Network config
│
├── frontend/                  # ⚠️ OLD: Unused original frontend
│
├── prd.md                     # Product Requirements Doc
├── INTEGRATION.md             # ✨ NEW: Frontend-backend guide
├── GAP_ANALYSIS.md            # ✨ NEW: What's missing
├── BLOCKCHAIN_SETUP.md        # ✨ NEW: Smart contract guide
└── README.md                  # This file
```

---

## Documentation

- **[INTEGRATION.md](./INTEGRATION.md)** - How frontend connects to backend
- **[BLOCKCHAIN_SETUP.md](./BLOCKCHAIN_SETUP.md)** - Complete blockchain deployment guide
- **[GAP_ANALYSIS.md](./GAP_ANALYSIS.md)** - What's done vs PRD requirements
- **[prd.md](./prd.md)** - Original product requirements

---

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS + shadcn/ui
- React Query for data fetching
- React Router for navigation
- Wepin SDK for wallet

**Backend:**
- Node.js + Express
- Sequelize ORM
- SQLite (dev) / PostgreSQL (prod)
- JWT authentication
- Ethers.js for blockchain

**Blockchain:**
- Solidity 0.8.20
- Hardhat development
- OpenZeppelin contracts
- Very Network (EVM compatible)
- ERC721 NFT standard

**External Services:**
- Verychat API (phone verification)
- Very Network RPC
- Wepin Wallet

---

## Environment Variables

### Backend (`backend/.env`)
```bash
# Server
PORT=3001
JWT_SECRET=your_secret_here

# Verychat API
VERY_PROJECT_ID=your_project_id
VERY_API_BASE=https://gapi.veryapi.io

# Blockchain (optional, for contract deployment)
PRIVATE_KEY=0xyour_private_key
VERY_RPC_URL=https://rpc.very.network
VERY_CHAIN_ID=4613
EVENT_FACTORY_ADDRESS=0xYourDeployedFactoryAddress
```

### Frontend (`very-events-hub/.env`)
```bash
# Backend API
VITE_API_URL=http://localhost:3001

# Wepin Wallet (optional)
VITE_WEPIN_APP_ID=your_app_id
VITE_WEPIN_APP_KEY=your_app_key
```

### Contracts (`contracts/.env`)
```bash
# For deployment
PRIVATE_KEY=0xyour_private_key
VERY_RPC_URL=https://rpc.very.network
VERY_CHAIN_ID=4613
```

---

## Key Features (from PRD)

| Feature | Status | Notes |
|---------|--------|-------|
| Phone Authentication | ✅ Done | Via Verychat |
| Event Creation | ✅ Done | Web form + API |
| Event Discovery | ✅ Done | Search & filter |
| NFT Tickets | ⚠️ Partial | Contracts ready, not deployed |
| $VERY Payments | ❌ Missing | Needs wallet integration |
| Smart Contract Escrow | ✅ Done | In EventTicket.sol |
| QR Check-in | ⚠️ Partial | Generation done, scanner missing |
| Secondary Marketplace | ❌ Missing | Not implemented |
| Verychat Bot | ❌ Missing | Not started |
| Event Groups | ❌ Missing | No Verychat integration |
| Rewards/Badges | ❌ Missing | Not started |

---

## API Endpoints

### Auth
- `POST /api/auth/send-code` - Send verification code
- `POST /api/auth/verify` - Verify code & login

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create event (auth required)
- `GET /api/events/:id` - Event details
- `PATCH /api/events/:id/activate` - Activate with contract

### Tickets
- `POST /api/tickets/buy` - Purchase ticket (auth required)
- `GET /api/tickets/my` - User's tickets (auth required)
- `POST /api/tickets/:id/checkin` - Check in (organizer only)

### Health
- `GET /api/health` - API status

---

## Smart Contract Functions

### EventFactory
```solidity
createEvent(name, date, price, maxTickets) → address
getDeployedEvents() → address[]
```

### EventTicket (ERC721)
```solidity
mintTicket() payable → tokenId
getEventInfo() → (name, date, price, maxTickets, minted, active)
checkIn(tokenId)
withdrawFunds()
deactivateEvent()
```

---

## Testing

### Manual Testing
1. Start backend: `cd backend && node server.js`
2. Start frontend: `cd very-events-hub && npm run dev`
3. Open `http://localhost:5173`
4. Test authentication with phone number
5. Create an event
6. View events list
7. Buy a ticket (currently database only)

### Contract Testing
```bash
cd contracts
npx hardhat test  # (if tests exist)
npx hardhat node  # Local blockchain
```

---

## Deployment

### Deploy Contracts
See [BLOCKCHAIN_SETUP.md](./BLOCKCHAIN_SETUP.md) for detailed instructions.

```bash
cd contracts
npx hardhat run scripts/deploy.js --network very
```

### Deploy Backend
```bash
cd backend
# Set production env vars
NODE_ENV=production
DB_HOST=your_db_host
# etc...
node server.js
```

### Deploy Frontend
```bash
cd very-events-hub
npm run build
# Deploy dist/ to hosting service
```

---

## Contributing

### Adding Features
1. Check [GAP_ANALYSIS.md](./GAP_ANALYSIS.md) for priorities
2. Update relevant layer (contracts, backend, or frontend)
3. Test integration end-to-end
4. Update documentation

### Code Style
- Backend: CommonJS modules
- Frontend: ES6 modules + TypeScript
- Contracts: Solidity 0.8.20
- Format: 2 spaces, semicolons

---

## Troubleshooting

### Backend won't start
- Check `backend/.env` exists
- Verify `JWT_SECRET` is set
- Check port 3001 is available

### Frontend shows errors
- Verify `VITE_API_URL` points to backend
- Check backend is running
- Clear browser cache

### Blockchain issues
- See [BLOCKCHAIN_SETUP.md](./BLOCKCHAIN_SETUP.md#troubleshooting)
- Verify wallet has $VERY
- Check RPC connectivity

---

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` files
- Never share private keys
- Keep `JWT_SECRET` secure
- Audit contracts before mainnet
- Test thoroughly on testnet first

---

## License

MIT

---

## Resources

- [Very Network](https://very.network)
- [Verychat](https://verychat.ai)
- [Very Developers](https://developers.verylabs.io)
- [VeryScan Explorer](https://veryscan.io)
- [Wepin Wallet](https://wepin.io)

---

## Support

For questions or issues:
1. Check documentation in this repo
2. Review PRD for requirements
3. Check console logs for errors
4. Verify environment variables

---

**Built for Very Network Hackathon 2025** 🚀
