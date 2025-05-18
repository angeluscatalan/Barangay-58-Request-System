import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/BackupRequestsModal.css';

const BackupRequestsModal = ({ isOpen, onClose, onRestore }) => {
    const [backupRequests, setBackupRequests] = useState([]);
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchBackupRequests();
            setSelectedRequests([]); // Reset selections when modal opens
        }
    }, [isOpen]);

    const fetchBackupRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/requests/backup/list');
            setBackupRequests(response.data);
        } catch (error) {
            console.error('Error fetching backup requests:', error);
            setError('Failed to fetch backup requests');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (selectedRequests.length === 0) {
            alert('Please select at least one request to restore');
            return;
        }

        try {
            setLoading(true);
            await axios.post('http://localhost:5000/api/requests/backup/restore', {
                requestIds: selectedRequests
            });
            onRestore(); // Callback to refresh main requests list
            onClose(); // Close modal after successful restore
            alert('Successfully restored selected requests!');
        } catch (error) {
            console.error('Error restoring requests:', error);
            alert('Failed to restore requests');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRequest = (id) => {
        setSelectedRequests(prev => {
            if (prev.includes(id)) {
                return prev.filter(requestId => requestId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const filteredRequests = filterRequests().map(request => request.id);
            setSelectedRequests(filteredRequests);
        } else {
            setSelectedRequests([]);
        }
    };

    const filterRequests = () => {
        if (!searchTerm) return backupRequests;

        const searchTermLower = searchTerm.toLowerCase();
        return backupRequests.filter(request => {
            const fullName = `${request.last_name}, ${request.first_name} ${request.middle_name || ''}`.toLowerCase();
            const type = request.type_of_certificate.toLowerCase();
            const purpose = request.purpose_of_request.toLowerCase();

            return fullName.includes(searchTermLower) ||
                type.includes(searchTermLower) ||
                purpose.includes(searchTermLower);
        });
    };

    // Calculate the number of currently visible selected items
    const getVisibleSelectedCount = () => {
        const filteredIds = filterRequests().map(request => request.id);
        return selectedRequests.filter(id => filteredIds.includes(id)).length;
    };

    if (!isOpen) return null;

    const filteredRequests = filterRequests();

    return (
        <div className="backup-modal-overlay">
            <div className="backup-modal">
                <div className="backup-modal-header">
                    <div className="backup-modal-title">
                        <h2>Backup Requests</h2>
                        <div className="backup-counters">
                            <span className="counter selected">Selected: {getVisibleSelectedCount()}</span>
                            <span className="counter total">Total Found: {filteredRequests.length}</span>
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
                                    placeholder="Search by name, type, or purpose..."
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
                                                    checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                                                />
                                            </th>
                                            <th>Date Requested</th>
                                            <th>Name</th>
                                            <th>Type of Request</th>
                                            <th>Purpose</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRequests.map(request => (
                                            <tr key={request.id}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRequests.includes(request.id)}
                                                        onChange={() => handleSelectRequest(request.id)}
                                                    />
                                                </td>
                                                <td>{request.created_at}</td>
                                                <td>{`${request.last_name}, ${request.first_name} ${request.middle_name || ''}`}</td>
                                                <td>{request.type_of_certificate}</td>
                                                <td>{request.purpose_of_request}</td>
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

export default BackupRequestsModal; 