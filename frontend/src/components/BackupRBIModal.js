import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/BackupRequestsModal.css'; // Reuse the same styles

const BackupRBIModal = ({ isOpen, onClose, onRestore }) => {
    const [backupRBI, setBackupRBI] = useState([]);
    const [selectedRBI, setSelectedRBI] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchBackupRBI();
            setSelectedRBI([]); // Reset selections when modal opens
        }
    }, [isOpen]);

    const fetchBackupRBI = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/rbi/backup/list');
            setBackupRBI(response.data.data.households.map(item => ({
                ...item.household,
                members: item.members
            })));
        } catch (error) {
            console.error('Error fetching backup RBI:', error);
            setError('Failed to fetch backup RBI data');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (selectedRBI.length === 0) {
            alert('Please select at least one household to restore');
            return;
        }

        try {
            setLoading(true);
            await axios.post('http://localhost:5000/api/rbi/backup/restore', {
                householdIds: selectedRBI
            });
            onRestore(); // Callback to refresh main RBI list
            onClose(); // Close modal after successful restore
            alert('Successfully restored selected households!');
        } catch (error) {
            console.error('Error restoring RBI:', error);
            alert('Failed to restore RBI data');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRBI = (id) => {
        setSelectedRBI(prev => {
            if (prev.includes(id)) {
                return prev.filter(householdId => householdId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const filteredRBI = filterRBI().map(household => household.id);
            setSelectedRBI(filteredRBI);
        } else {
            setSelectedRBI([]);
        }
    };

    const filterRBI = () => {
        if (!searchTerm) return backupRBI;

        const searchTermLower = searchTerm.toLowerCase();
        return backupRBI.filter(household => {
            const headName = `${household.head_last_name}, ${household.head_first_name} ${household.head_middle_name || ''}`.toLowerCase();
            const address = `${household.house_unit_no} ${household.street_name} ${household.subdivision}`.toLowerCase();

            return headName.includes(searchTermLower) ||
                address.includes(searchTermLower);
        });
    };

    // Calculate the number of currently visible selected items
    const getVisibleSelectedCount = () => {
        const filteredIds = filterRBI().map(household => household.id);
        return selectedRBI.filter(id => filteredIds.includes(id)).length;
    };

    if (!isOpen) return null;

    const filteredRBI = filterRBI();

    return (
        <div className="backup-modal-overlay">
            <div className="backup-modal">
                <div className="backup-modal-header">
                    <div className="backup-modal-title">
                        <h2>Backup RBI Records</h2>
                        <div className="backup-counters">
                            <span className="counter selected">Selected: {getVisibleSelectedCount()}</span>
                            <span className="counter total">Total Found: {filteredRBI.length}</span>
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
                                    placeholder="Search by household head name or address..."
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
                                                    checked={selectedRBI.length === filteredRBI.length && filteredRBI.length > 0}
                                                />
                                            </th>
                                            <th>Date Created</th>
                                            <th>Household Head</th>
                                            <th>Address</th>
                                            <th>Members</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRBI.map(household => (
                                            <tr key={household.id}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRBI.includes(household.id)}
                                                        onChange={() => handleSelectRBI(household.id)}
                                                    />
                                                </td>
                                                <td>{household.created_at}</td>
                                                <td>{`${household.head_last_name}, ${household.head_first_name} ${household.head_middle_name || ''}`}</td>
                                                <td>{`${household.house_unit_no} ${household.street_name} ${household.subdivision}`}</td>
                                                <td>{household.member_count}</td>
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

export default BackupRBIModal; 