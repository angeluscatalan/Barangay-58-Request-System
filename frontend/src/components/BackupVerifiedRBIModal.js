import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/BackupModal.css";

const BackupVerifiedRBIModal = ({ isOpen, onClose, onRestore }) => {
    const [backupHouseholds, setBackupHouseholds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedHouseholds, setSelectedHouseholds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    useEffect(() => {
        if (isOpen) {
            fetchBackupHouseholds();
        }
    }, [isOpen]);

    const fetchBackupHouseholds = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                'http://localhost:5000/api/rbi/backup/list',
                getAuthHeaders()
            );
            setBackupHouseholds(response.data);
        } catch (error) {
            console.error('Error fetching backup households:', error);
            setError('Failed to fetch backup data');
            if (error?.response?.status === 401) {
                alert("Unauthorized access - please log in again");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectHousehold = (id) => {
        setSelectedHouseholds(prev => {
            if (prev.includes(id)) {
                return prev.filter(householdId => householdId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const filteredHouseholds = filterHouseholds().map(household => household.id);
            setSelectedHouseholds(filteredHouseholds);
        } else {
            setSelectedHouseholds([]);
        }
    };

    const handleRestore = async () => {
        if (selectedHouseholds.length === 0) {
            alert('Please select at least one household to restore');
            return;
        }

        try {
            setLoading(true);
            await axios.post(
                'http://localhost:5000/api/rbi/backup/restore',
                { householdIds: selectedHouseholds },
                getAuthHeaders()
            );
            onRestore();
            onClose();
        } catch (error) {
            console.error('Error restoring households:', error);
            setError('Failed to restore selected households');
            if (error?.response?.status === 401) {
                console.log("Unauthorized access - please log in again");
            }
        } finally {
            setLoading(false);
        }
    };

    const filterHouseholds = () => {
        if (!searchTerm) return backupHouseholds;

        const searchTermLower = searchTerm.toLowerCase();
        return backupHouseholds.filter(household => {
            const fullName = `${household.head_last_name}, ${household.head_first_name} ${household.head_middle_name || ''}`.toLowerCase();
            const address = `${household.house_unit_no || ''} ${household.street_name || ''}, ${household.subdivision || ''}`.toLowerCase();

            return fullName.includes(searchTermLower) ||
                address.includes(searchTermLower) ||
                household.id.toString().includes(searchTermLower);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="backup-modal">
                <div className="backup-modal-header">
                    <div className="backup-modal-title">
                        <h2>Retrieve RBI Data</h2>
                        <div className="backup-counters">
                            <span className="counter selected">Selected: {selectedHouseholds.length}</span>
                            <span className="counter total">Total Found: {filterHouseholds().length}</span>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="loading">Loading backup data...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : (
                    <div className="backup-content">
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedHouseholds.length === filterHouseholds().length && filterHouseholds().length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th>ID</th>
                                    <th>Household Head</th>
                                    <th>Address</th>
                                    <th>Backup Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterHouseholds().map(household => (
                                    <tr key={household.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedHouseholds.includes(household.id)}
                                                onChange={() => handleSelectHousehold(household.id)}
                                            />
                                        </td>
                                        <td>{household.id}</td>
                                        <td>{`${household.head_last_name}, ${household.head_first_name} ${household.head_middle_name || ''}`}</td>
                                        <td>{`${household.house_unit_no || ''} ${household.street_name || ''}, ${household.subdivision || ''}`}</td>
                                        <td>{new Date(household.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="backup-modal-footer">
                    <button
                        className="restore-btn"
                        onClick={handleRestore}
                        disabled={selectedHouseholds.length === 0 || loading}
                    >
                        {loading ? 'Restoring...' : 'Restore Selected'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackupVerifiedRBIModal; 