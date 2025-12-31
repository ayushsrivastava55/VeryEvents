const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs
const EventFactoryABI = require('./abis/EventFactory.json').abi;
const EventTicketABI = require('./abis/EventTicket.json').abi;

// Very Network configuration
const VERY_RPC_URL = process.env.VERY_RPC_URL || 'https://rpc.very.network';
const VERY_CHAIN_ID = parseInt(process.env.VERY_CHAIN_ID || '4613');
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const EVENT_FACTORY_ADDRESS = process.env.EVENT_FACTORY_ADDRESS;

// Initialize provider
let provider;
let wallet;
let eventFactoryContract;

function initializeWeb3() {
  try {
    provider = new ethers.JsonRpcProvider(VERY_RPC_URL, {
      chainId: VERY_CHAIN_ID,
      name: 'Very Network'
    });

    if (PRIVATE_KEY) {
      wallet = new ethers.Wallet(PRIVATE_KEY, provider);
      console.log('Web3 initialized with wallet:', wallet.address);

      if (EVENT_FACTORY_ADDRESS) {
        eventFactoryContract = new ethers.Contract(
          EVENT_FACTORY_ADDRESS,
          EventFactoryABI,
          wallet
        );
        console.log('EventFactory contract connected:', EVENT_FACTORY_ADDRESS);
      }
    } else {
      console.warn('No PRIVATE_KEY found. Blockchain features will be limited.');
    }
  } catch (error) {
    console.error('Failed to initialize Web3:', error.message);
  }
}

// Deploy a new event contract
async function deployEventContract(name, date, price, maxTickets, imageUrl) {
  if (!eventFactoryContract) {
    throw new Error('EventFactory not initialized. Set EVENT_FACTORY_ADDRESS in .env');
  }

  try {
    // Convert parameters to blockchain format
    const priceInWei = ethers.parseEther(price.toString());
    const dateTimestamp = Math.floor(new Date(date).getTime() / 1000);

    console.log('Deploying event contract:', { name, dateTimestamp, priceInWei, maxTickets, imageUrl });

    // Call createEvent on the factory with gas price limit
    const tx = await eventFactoryContract.createEvent(
      name,
      dateTimestamp,
      priceInWei,
      maxTickets,
      imageUrl,
      {
        gasPrice: ethers.parseUnits('1', 'gwei') // Set 1 gwei gas price to stay under RPC cap
      }
    );

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    // Get the event address from the EventCreated event
    const event = receipt.logs.find(
      log => log.topics[0] === eventFactoryContract.interface.getEvent('EventCreated').topicHash
    );

    if (event) {
      const decodedEvent = eventFactoryContract.interface.decodeEventLog(
        'EventCreated',
        event.data,
        event.topics
      );

      // Return just the contract address string
      return decodedEvent.eventAddress;
    }

    throw new Error('Event creation log not found in transaction receipt');
  } catch (error) {
    console.error('Error deploying event contract:', error);
    throw error;
  }
}

// Get event contract instance
function getEventContract(contractAddress) {
  if (!wallet) {
    throw new Error('Wallet not initialized');
  }

  return new ethers.Contract(contractAddress, EventTicketABI, wallet);
}

// Mint a ticket NFT
async function mintTicket(contractAddress, buyerAddress, paymentInEther) {
  try {
    const eventContract = getEventContract(contractAddress);

    // Get current event info
    const eventInfo = await eventContract.getEventInfo();
    const ticketPrice = eventInfo.ticketPrice;

    console.log('Minting ticket for:', buyerAddress);
    console.log('Payment:', paymentInEther, 'VERY');
    console.log('Required:', ethers.formatEther(ticketPrice), 'VERY');

    // Mint ticket (this would ideally be done by the buyer's wallet)
    // For backend, we're acting as a relayer
    const tx = await eventContract.mintTicket({
      value: ticketPrice
    });

    const receipt = await tx.wait();

    // Find the Transfer event to get token ID
    const transferEvent = receipt.logs.find(
      log => {
        try {
          const parsed = eventContract.interface.parseLog(log);
          return parsed.name === 'Transfer';
        } catch {
          return false;
        }
      }
    );

    let tokenId;
    if (transferEvent) {
      const parsed = eventContract.interface.parseLog(transferEvent);
      tokenId = parsed.args.tokenId.toString();
    }

    return {
      txHash: tx.hash,
      tokenId,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('Error minting ticket:', error);
    throw error;
  }
}

// Check if a ticket has been used
async function isTicketUsed(contractAddress, tokenId) {
  try {
    const eventContract = getEventContract(contractAddress);
    return await eventContract.ticketUsed(tokenId);
  } catch (error) {
    console.error('Error checking ticket status:', error);
    throw error;
  }
}

// Mark ticket as used (check-in)
async function checkInTicket(contractAddress, tokenId) {
  try {
    const eventContract = getEventContract(contractAddress);
    const tx = await eventContract.checkIn(tokenId);
    const receipt = await tx.wait();

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('Error checking in ticket:', error);
    throw error;
  }
}

// Get event details from contract
async function getEventDetails(contractAddress) {
  try {
    const eventContract = getEventContract(contractAddress);
    const eventInfo = await eventContract.getEventInfo();

    return {
      name: eventInfo.name,
      date: new Date(Number(eventInfo.date) * 1000).toISOString(),
      ticketPrice: ethers.formatEther(eventInfo.ticketPrice),
      maxTickets: Number(eventInfo.maxTickets),
      ticketsSold: Number(eventInfo.minted),
      active: eventInfo.active
    };
  } catch (error) {
    console.error('Error getting event details:', error);
    throw error;
  }
}

// Get all deployed events from factory
async function getAllDeployedEvents() {
  if (!eventFactoryContract) {
    throw new Error('EventFactory not initialized');
  }

  try {
    const events = await eventFactoryContract.getDeployedEvents();
    return events;
  } catch (error) {
    console.error('Error getting deployed events:', error);
    throw error;
  }
}

// Initialize on module load
initializeWeb3();

module.exports = {
  provider,
  wallet,
  deployEventContract,
  mintTicket,
  isTicketUsed,
  checkInTicket,
  getEventDetails,
  getAllDeployedEvents,
  getEventContract
};
