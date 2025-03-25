import React, { useState } from 'react';
import '../styles/EventsManager.css';

function EventsManager() {
    const [events, setEvents] = useState([
        {
            id: 1,
            name: "Liga Kontra Droga",
            date: "01/04/2026",
            isPublished: false
        },
        {
            id: 2,
            name: "Christmas Party",
            date: "12/25/25",
            isPublished: true
        }
    ]);
    const [sortBy, setSortBy] = useState('All');

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            setEvents(events.filter(event => event.id !== id));
        }
    };

    const handlePublish = (id) => {
        setEvents(events.map(event =>
            event.id === id ? { ...event, isPublished: !event.isPublished } : event
        ));
    };

    return (
        <div className="events-section">
            <div className="events-actions">
                <button className="add-request-btn">+ Add Event</button>
                <button className="manage-events-btn">Manage Events</button>
            </div>

            <div className="events-title">
                <h1>Events <span className="event-count">({events.length})</span></h1>
            </div>

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
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '10%' }}>NO.</th>
                            <th style={{ width: '40%' }}>EVENT NAME</th>
                            <th style={{ width: '25%' }}>DATE</th>
                            <th style={{ width: '25%' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event, index) => (
                            <tr key={event.id}>
                                <td>{index + 1}</td>
                                <td>{event.name}</td>
                                <td>{event.date}</td>
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
        </div>
    );
}

export default EventsManager;
