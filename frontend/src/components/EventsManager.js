import React, { useState, useEffect } from 'react';
import '../styles/EventsManager.css';
import AddEvent from './AddEvent';

function EventsManager() {
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [events, setEvents] = useState(() => {
        const savedEvents = localStorage.getItem('events');
        return savedEvents ? JSON.parse(savedEvents) : [];
    });

    useEffect(() => {
        localStorage.setItem('events', JSON.stringify(events));
    }, [events]);
    const [sortBy, setSortBy] = useState('All');

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            setEvents(events.filter(event => event.id !== id));
        }
    };

    const handlePublish = (id) => {
        const updatedEvents = events.map(event =>
            event.id === id ? { ...event, isPublished: !event.isPublished } : event
        );
        setEvents(updatedEvents);
        localStorage.setItem('events', JSON.stringify(updatedEvents));
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
                            <th style={{ width: '20%' }}>EVENT NAME</th>
                            <th style={{ width: '15%' }}>DATE</th>
                            <th style={{ width: '20%' }}>TIME</th>
                            <th style={{ width: '20%' }}>VENUE</th>
                            <th style={{ width: '20%' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event, index) => (
                            <tr key={event.id}>
                                <td>{index + 1}</td>
                                <td>{event.name}</td>
                                <td>{event.date}</td>
                                <td>{event.timeStart} - {event.timeEnd}</td>
                                <td>{event.venue}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="action-btn edit">
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
                    onClose={() => setShowAddEvent(false)}
                    onAddEvent={(eventData) => {
                        const newEvent = {
                            ...eventData,
                            id: events.length + 1,
                            isPublished: false
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
