import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

function MyTickets({ token }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const fetchTickets = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/api/tickets/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data);
    } catch (err) {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="my-tickets">
        <h2>My Tickets</h2>
        <p>Please login to view your tickets</p>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading tickets...</div>;

  return (
    <div className="my-tickets">
      <h2>My Tickets</h2>
      {error && <p className="error">{error}</p>}
      
      {tickets.length === 0 ? (
        <p>You don't have any tickets yet</p>
      ) : (
        <div className="tickets-grid">
          {tickets.map(ticket => (
            <div key={ticket.id} className={`ticket-card ${ticket.status}`}>
              <div className="ticket-event">
                <h3>{ticket.Event?.name}</h3>
                <p>{new Date(ticket.Event?.date).toLocaleDateString()}</p>
              </div>
              
              <div className="ticket-qr">
                <QRCode value={ticket.qrCode} size={120} />
              </div>
              
              <div className="ticket-status">
                <span className={`status-badge ${ticket.status}`}>
                  {ticket.status === 'confirmed' && '✓ Confirmed'}
                  {ticket.status === 'used' && '✓ Checked In'}
                  {ticket.status === 'pending' && '⏳ Pending'}
                  {ticket.status === 'refunded' && '↩ Refunded'}
                </span>
              </div>

              {ticket.txHash && (
                <a 
                  href={`https://veryscan.io/tx/${ticket.txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="view-tx"
                >
                  View on VeryScan
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTickets;
