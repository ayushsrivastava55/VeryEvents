import React, { useEffect, useState } from 'react';
import axios from 'axios';

function EventList({ onEventClick }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.category === filter;
  });

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="event-list">
      <div className="list-header">
        <h2>Discover Events</h2>
        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="meetup">Meetups</option>
            <option value="conference">Conferences</option>
            <option value="workshop">Workshops</option>
            <option value="concert">Concerts</option>
            <option value="party">Parties</option>
          </select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="no-events">
          <p>No events found</p>
          <p>Be the first to create an event!</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map(event => {
            const eventDate = new Date(event.date);
            const isSoldOut = event.ticketsSold >= event.maxTickets;
            
            return (
              <div 
                key={event.id} 
                className={`event-card ${isSoldOut ? 'sold-out' : ''}`}
                onClick={() => onEventClick(event.id)}
              >
                {event.imageUrl && (
                  <div className="event-image">
                    <img src={event.imageUrl} alt={event.name} />
                  </div>
                )}
                <div className="event-content">
                  <span className="category-tag">{event.category}</span>
                  <h3>{event.name}</h3>
                  <p className="event-date">
                    📅 {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="event-location">
                    {event.isVirtual ? '🌐 Virtual' : `📍 ${event.location}`}
                  </p>
                  <div className="event-footer">
                    <span className="price">{event.ticketPrice} $VERY</span>
                    <span className="tickets">
                      {isSoldOut ? 'Sold Out' : `${event.maxTickets - event.ticketsSold} left`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EventList;
