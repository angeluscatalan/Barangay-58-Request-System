import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/BackupModal.css";

const BackupVerifiedRBIModal = ({ isOpen, onClose, onRestore }) => {
    const [backupHouseholds, setBackupHouseholds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedHouseholds, setSelectedHouseholds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(true);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelectedHouseholds([]); // Reset selections when modal opens
            setShowPasswordModal(true); // Show password modal when opening
            setPassword(''); // Reset password
            setPasswordError(''); // Reset password error
            setError(null); // Reset any previous errors
        }
    }, [isOpen]);

    const verifyPassword = async () => {
        try {
            setLoading(true);
            setPasswordError('');
            setError(null); // Reset any previous errors

            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/auth/verify-password',
                { password },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                setShowPasswordModal(false);
                await fetchBackupHouseholds();
            }
        } catch (error) {
            console.error('Password verification error:', error);
            setPasswordError('Invalid password');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!password.trim()) {
            setPasswordError('Password is required');
            return;
        }
        await verifyPassword();
    };

    const fetchBackupHouseholds = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                'http://localhost:5000/api/rbi/backup/list',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setBackupHouseholds(response.data);
            setError(null); // Clear any previous errors on success
        } catch (error) {
            console.error('Error fetching backup households:', error);
            if (error?.response?.status === 401) {
                setShowPasswordModal(true); // Show password modal again if unauthorized
                setPasswordError('Session expired. Please enter password again.');
            } else {
                setError('Failed to fetch backup data. Please try again.');
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
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/rbi/backup/restore',
                { householdIds: selectedHouseholds },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            onRestore();
            onClose();
            alert('Successfully restored selected households!');
        } catch (error) {
            console.error('Error restoring households:', error);
            if (error?.response?.status === 401) {
                setShowPasswordModal(true); // Show password modal again if unauthorized
                setPasswordError('Session expired. Please enter password again.');
            } else {
                setError('Failed to restore selected households. Please try again.');
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

    if (showPasswordModal) {
        return (
            <div className="modal-overlay">
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
                                    <th># of Members</th>
                                    <th>Members</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterHouseholds().map(household => (
                                    <React.Fragment key={household.id}>
                                        <tr>
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
                                            <td>{household.members?.length || 1}</td>
                                            <td>
                                                {household.members && household.members.length > 0 ? (
                                                    <table style={{ width: "100%", background: "#f9f9f9", marginTop: 4 }}>
                                                        <thead>
                                                            <tr>
                                                                <th>Name</th>
                                                                <th>Relationship</th>
                                                                <th>Type</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {household.members.map(member => (
                                                                <tr key={member.id}>
                                                                    <td>
                                                                        {member.last_name}, {member.first_name} {member.middle_name || ""}
                                                                    </td>
                                                                    <td>
                                                                        {(() => {
                                                                            switch (String(member.relationship_id)) {
                                                                                case "1": return "Mother";
                                                                                case "2": return "Father";
                                                                                case "3": return "Son";
                                                                                case "4": return "Daughter";
                                                                                case "5": return "Brother";
                                                                                case "6": return "Sister";
                                                                                case "7": return "Grandmother";
                                                                                case "8": return "Grandfather";
                                                                                case "9": return member.relationship_other || "Others";
                                                                                default: return "";
                                                                            }
                                                                        })()}
                                                                    </td>
                                                                    <td>Member</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <span style={{ color: "#888" }}>No members</span>
                                                )}
                                            </td>
                                        </tr>
                                    </React.Fragment>
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