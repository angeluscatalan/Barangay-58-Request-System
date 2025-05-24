import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/BackupRequestsModal.css'; // Reuse the same styles

const BackupEventsModal = ({ isOpen, onClose, onRestore }) => {
    const [backupEvents, setBackupEvents] = useState([]);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(true);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setShowPasswordModal(true);
            setPassword('');
            setPasswordError('');
            setSelectedEvents([]); // Reset selections when modal opens
        }
    }, [isOpen]);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPasswordError('');

        try {
            // Verify the admin password
            const token = localStorage.getItem('token');
            await axios.post('https://barangay-58-pasay.vercel.app/api/auth/verify-password',
                { password },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setShowPasswordModal(false);
            fetchBackupEvents();
        } catch (error) {
            console.error('Password verification error:', error);
            setPasswordError(error.response?.data?.error || 'Invalid password');
        } finally {
            setLoading(false);
        }
    };

    const fetchBackupEvents = async () => {
    try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError('Session expired. Please log in again.');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
            return;
        }

        const response = await axios.get('https://barangay-58-pasay.vercel.app/api/events/backup/list', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setBackupEvents(response.data);
    } catch (error) {
        console.error('Error fetching backup events:', error);
        
        if (error.response?.status === 401) {
            setError('Session expired. Please log in again.');
            setTimeout(() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }, 1500);
        } else {
            setError(error.response?.data?.message || 'Failed to fetch backup events');
        }
    } finally {
        setLoading(false);
    }
};

    const handleRestore = async () => {
    if (selectedEvents.length === 0) {
        alert('Please select at least one event to restore');
        return;
    }

    try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('Session expired. Please log in again.');
            window.location.href = '/login';
            return;
        }

        await axios.post('https://barangay-58-pasay.vercel.app/api/events/backup/restore', 
            { eventIds: selectedEvents },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        onRestore();
        onClose();
        alert('Successfully restored selected events!');
    } catch (error) {
        console.error('Error restoring events:', error);
        
        if (error.response?.status === 401) {
            alert('Session expired. Please log in again.');
            window.location.href = '/login';
        } else {
            alert(error.response?.data?.message || 'Failed to restore events');
        }
    } finally {
        setLoading(false);
    }
};
    const handleSelectEvent = (id) => {
        setSelectedEvents(prev => {
            if (prev.includes(id)) {
                return prev.filter(eventId => eventId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const filteredEvents = filterEvents().map(event => event.id);
            setSelectedEvents(filteredEvents);
        } else {
            setSelectedEvents([]);
        }
    };

    const filterEvents = () => {
        if (!searchTerm) return backupEvents;

        const searchTermLower = searchTerm.toLowerCase();
        return backupEvents.filter(event => {
            const eventName = event.event_name?.toLowerCase() || '';
            const description = event.description?.toLowerCase() || '';
            const venue = event.venue?.toLowerCase() || '';

            return eventName.includes(searchTermLower) ||
                description.includes(searchTermLower) ||
                venue.includes(searchTermLower);
        });
    };

    // Calculate the number of currently visible selected items
    const getVisibleSelectedCount = () => {
        const filteredIds = filterEvents().map(event => event.id);
        return selectedEvents.filter(id => filteredIds.includes(id)).length;
    };

    if (!isOpen) return null;

    if (showPasswordModal) {
        return (
            <div className="backup-modal-overlay">
                <div className="backup-modal">
                    <div className="backup-modal-header">
                        <h2>Confirm Admin Password</h2>
                        <button className="close-btn" onClick={onClose}>×</button>
                    </div>
                    <div className="backup-modal-content">
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="password-input-container">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="password-input"
                                />
                                {passwordError && <div className="error-message">{passwordError}</div>}
                            </div>
                            <div className="backup-modal-footer">
                                <button type="button" className="cancel-btn" onClick={onClose}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="verify-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    const filteredEvents = filterEvents();

    return (
        <div className="backup-modal-overlay">
            <div className="backup-modal">
                <div className="backup-modal-header">
                    <div className="backup-modal-title">
                        <h2>Backup Events</h2>
                        <div className="backup-counters">
                            <span className="counter selected">Selected: {getVisibleSelectedCount()}</span>
                            <span className="counter total">Total Found: {filteredEvents.length}</span>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="backup-modal-content">
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : (
                        <>
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Search by event name, description, or venue..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <div className="backup-table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    onChange={handleSelectAll}
                                                    checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                                                />
                                            </th>
                                            <th>Date Created</th>
                                            <th>Event Name</th>
                                            <th>Description</th>
                                            <th>Venue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEvents.map(event => (
                                            <tr key={event.id}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEvents.includes(event.id)}
                                                        onChange={() => handleSelectEvent(event.id)}
                                                    />
                                                </td>
                                                <td>{event.created_at}</td>
                                                <td>{event.event_name}</td>
                                                <td>{event.description}</td>
                                                <td>{event.venue}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
                <div className="backup-modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="restore-btn"
                        onClick={handleRestore}
                        disabled={getVisibleSelectedCount() === 0}
                    >
                        Restore Selected ({getVisibleSelectedCount()})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackupEventsModal; 