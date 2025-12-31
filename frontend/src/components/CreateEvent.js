import React, { useState } from 'react';
import axios from 'axios';

function CreateEvent({ token, onEventCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    isVirtual: false,
    date: '',
    ticketPrice: '',
    maxTickets: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:3001/api/events',
        {
          ...formData,
          ticketPrice: parseFloat(formData.ticketPrice),
          maxTickets: parseInt(formData.maxTickets),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onEventCreated(response.data);
      setFormData({
        name: '',
        description: '',
        location: '',
        isVirtual: false,
        date: '',
        ticketPrice: '',
        maxTickets: '',
        category: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event">
      <h2>Create New Event</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Event Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="isVirtual"
              checked={formData.isVirtual}
              onChange={handleChange}
            />
            Virtual Event
          </label>
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder={formData.isVirtual ? 'Meeting URL' : 'Venue address'}
          />
        </div>
        <div className="form-group">
          <label>Date & Time</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Ticket Price ($VERY)</label>
          <input
            type="number"
            name="ticketPrice"
            value={formData.ticketPrice}
            onChange={handleChange}
            step="0.001"
            min="0"
            required
          />
        </div>
        <div className="form-group">
          <label>Max Tickets</label>
          <input
            type="number"
            name="maxTickets"
            value={formData.maxTickets}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="">Select category</option>
            <option value="meetup">Meetup</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="concert">Concert</option>
            <option value="party">Party</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}

export default CreateEvent;
