import React, { useState, useEffect } from 'react';
import '../styles/EventsManager.css';
import AddEvent from './AddEvent';

function EventsManager() {
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [sortBy, setSortBy] = useState('All');

useEffect(() => {
    const fetchEvents = async () => {
        try {
          const response = await fetch('https://barangay-58-request-system-frontend.vercel.app/events/archive');
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          setEvents(data);
        } catch (error) {
          console.error('Fetch error:', error);
        }
      };
    fetchEvents();
}, []);

    const handleEdit = (event) => {
        setEditingEvent(event);
        setShowAddEvent(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
    
        try {
            const response = await fetch(`https://barangay-58-request-system-frontend.vercel.app/archive/${id}`, {
                method: 'DELETE'
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Delete failed');
            }
    
            setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
            
        } catch (error) {
            console.error('Delete error:', error);
            alert(`Delete failed: ${error.message}`);
        }
    };

    const handleEditSubmit = (updatedEvent) => {
        const updatedEvents = events.map(event =>
            event.id === editingEvent.id ? { ...updatedEvent, id: event.id, isPublished: event.isPublished } : event
        );
        setEvents(updatedEvents);
        setShowAddEvent(false);
        setEditingEvent(null);
    };

    const handlePublish = (id) => {
        const updatedEvents = events.map(event =>
            event.id === id ? { ...event, isPublished: !event.isPublished } : event
        );
        setEvents(updatedEvents);
        localStorage.setItem('events', JSON.stringify(updatedEvents));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="events-section">
            <div className="table-header">
                <div className="events-count">
                    Events <span className="event-count">({events.length})</span>
                </div>
                <div className="table-controls">
                    <div className="events-filter">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="All">Sort by: All</option>
                            <option value="Date">Sort by: Date</option>
                            <option value="Name">Sort by: Name</option>
                            <option value="Published">Sort by: Published</option>
                        </select>
                    </div>
                    <button className="add-request-btn" onClick={() => setShowAddEvent(true)}>+ Add Event</button>
                </div>
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '5%' }}>NO.</th>
                            <th style={{ width: '20%' }}>IMAGE</th>
                            <th style={{ width: '20%' }}>EVENT NAME</th>
                            <th style={{ width: '15%' }}>DATE</th>
                            <th style={{ width: '20%' }}>TIME</th>
                            <th style={{ width: '20%' }}>VENUE</th>
                            <th style={{ width: '10%' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event, index) => (
                                <tr key={event.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {event.image_url && (
                                            <img 
                                                src={event.image_url} 
                                                alt="Event" 
                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.src = '/placeholder.jpg';
                                                }}
                                            />
                                        )}
                                    </td>
                                        <td>{event.event_name || 'No name'}</td>
                                        <td>{formatDate(event.event_date)}</td>
                                        <td>
                                            {event.time_start} - {event.time_end}
                                        </td>
                                        <td>{event.venue}</td>

                                    <td>
                                    <div className="action-buttons">
                                        <button 
                                            className="action-btn edit"
                                            onClick={() => handleEdit(event)}
                                        >
                                            <i className="fas fa-edit"></i>
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleDelete(event.id)}
                                        >
                                            <i className="fas fa-trash"></i>
                                            <span>Delete</span>
                                        </button>
                                        <button
                                            className={`action-btn ${event.isPublished ? 'published' : ''}`}
                                            onClick={() => handlePublish(event.id)}
                                        >
                                            <i className="fas fa-globe"></i>
                                            <span>{event.isPublished ? 'Unpublish' : 'Publish'}</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showAddEvent && (
                <AddEvent
                    onClose={() => {
                        setShowAddEvent(false);
                        setEditingEvent(null);
                    }}
                    editData={editingEvent}
                    onEditEvent={handleEditSubmit}
                    onAddEvent={(eventData) => {
                        const newEvent = {
                            ...eventData,
                            id: Date.now(), 
                            isPublished: false,
                            event_name: eventData.name || eventData.event_name,
                            event_date: eventData.date || eventData.event_date,
                            time_start: eventData.timeStart || eventData.time_start,
                            time_end: eventData.timeEnd || eventData.time_end
                        };
                        setEvents([...events, newEvent]);
                        setShowAddEvent(false);
                    }}
                />
            )}
        </div>
    );
}

export default EventsManager;