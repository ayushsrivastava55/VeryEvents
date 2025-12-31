import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

const EVENT_TICKET_ABI = [
  "function mintTicket(address to) external payable",
  "function eventData() view returns (string name, uint256 date, uint256 ticketPrice, uint256 maxTickets, uint256 minted, bool active)",
];

function EventDetail({ eventId, token, walletAddress, provider, onBack }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/events/${eventId}`);
      setEvent(response.data);
    } catch (err) {
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const buyTicket = async () => {
    if (!walletAddress || !provider) {
      setError('Please connect your wallet first');
      return;
    }

    if (!event.contractAddress) {
      setError('Event contract not deployed yet');
      return;
    }

    setBuying(true);
    setError('');
    setSuccess('');

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(event.contractAddress, EVENT_TICKET_ABI, signer);
      
      const tx = await contract.mintTicket(walletAddress, {
        value: ethers.parseEther(event.ticketPrice.toString()),
      });
      
      const receipt = await tx.wait();
      
      // Record ticket in backend
      await axios.post(
        'http://localhost:3001/api/tickets/buy',
        {
          eventId: event.id,
          txHash: receipt.hash,
          tokenId: receipt.logs[0]?.args?.tokenId?.toString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Ticket purchased successfully!');
      fetchEvent();
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err.message || 'Failed to purchase ticket');
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div className="loading">Loading event...</div>;
  if (!event) return <div className="error">Event not found</div>;

  const eventDate = new Date(event.date);
  const isSoldOut = event.ticketsSold >= event.maxTickets;
  const isPast = eventDate < new Date();

  return (
    <div className="event-detail">
      <button className="back-btn" onClick={onBack}>← Back to Events</button>
      
      {event.imageUrl && <img src={event.imageUrl} alt={event.name} className="event-image" />}
      
      <h1>{event.name}</h1>
      
      <div className="event-meta">
        <span className="category">{event.category}</span>
        <span className="date">{eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString()}</span>
        {event.isVirtual ? (
          <span className="virtual">🌐 Virtual Event</span>
        ) : (
          <span className="location">📍 {event.location}</span>
        )}
      </div>

      <div className="event-description">
        <h3>About</h3>
        <p>{event.description}</p>
      </div>

      <div className="ticket-info">
        <h3>Tickets</h3>
        <p className="price">{event.ticketPrice} $VERY</p>
        <p className="availability">
          {event.ticketsSold} / {event.maxTickets} sold
        </p>
        
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {!isPast && !isSoldOut && (
          <button 
            className="buy-btn" 
            onClick={buyTicket} 
            disabled={buying || !walletAddress}
          >
            {buying ? 'Processing...' : `Buy Ticket (${event.ticketPrice} $VERY)`}
          </button>
        )}
        
        {isSoldOut && <p className="sold-out">Sold Out</p>}
        {isPast && <p className="past">Event has ended</p>}
        
        {!walletAddress && <p className="hint">Connect your wallet to buy tickets</p>}
      </div>

      {event.contractAddress && (
        <div className="contract-info">
          <h4>On-Chain Details</h4>
          <p>Contract: <a href={`https://veryscan.io/address/${event.contractAddress}`} target="_blank" rel="noopener noreferrer">
            {event.contractAddress.slice(0, 6)}...{event.contractAddress.slice(-4)}
          </a></p>
        </div>
      )}
    </div>
  );
}

export default EventDetail;
