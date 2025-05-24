import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/BackupRequestsModal.css';

const BackupRequestsModal = ({ isOpen, onClose, onRestore, statuses = [] }) => {
    const [backupRequests, setBackupRequests] = useState([]);
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(true);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelectedRequests([]); // Reset selections when modal opens
            setShowPasswordModal(true); // Show password modal when opening
            setPassword(''); // Reset password
            setPasswordError(''); // Reset password error
        }
    }, [isOpen]);

    const verifyPassword = async () => {
    try {
        setLoading(true);
        setPasswordError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setPasswordError('Session expired. Please log in again.');
            setLoading(false);
            onClose();
            return;
        }

        const response = await axios.post(
            'https://barangay-58-pasay.vercel.app/api/auth/verify-password',
            { password },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.status === 200) {
            // Store any new token if returned
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            setShowPasswordModal(false);
            await fetchBackupRequests(); // Wait for fetch to complete
        }
    } catch (error) {
        if (error.response?.status === 401) {
            setPasswordError('Session expired. Please log in again.');
            setTimeout(() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }, 1500);
        } else {
            setPasswordError(
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Invalid password'
            );
        }
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

    const fetchBackupRequests = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setTimeout(() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }, 1500);
      return;
    }

    const response = await axios.get(
      'https://barangay-58-pasay.vercel.app/api/requests/backup/list',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    setBackupRequests(response.data);
  } catch (error) {
    console.error('Error fetching backup requests:', error);
    
    if (error.response) {
      if (error.response.status === 403) {
        setError('Access denied. You need admin privileges to view backup requests.');
      } else if (error.response.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }, 1500);
      } else {
        setError(error.response.data?.message || 'Failed to fetch backup requests');
      }
    } else {
      setError('Network error. Please check your connection.');
    }
  } finally {
    setLoading(false);
  }
};

    const handleRestore = async () => {
        if (selectedRequests.length === 0) {
            alert('Please select at least one request to restore');
            return;
        }

        // Find the status_id for 'pending'
        const pendingStatus = statuses.find(s => (s.name || '').toLowerCase() === 'pending');
        const pendingStatusId = pendingStatus ? pendingStatus.id : null;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Session expired. Please log in again.');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }, 1500);
                return;
            }
            await axios.post(
                'https://barangay-58-pasay.vercel.app/api/requests/backup/restore',
                {
                    requestIds: selectedRequests,
                    ...(pendingStatusId && { status_id: pendingStatusId })
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            onRestore(); // Callback to refresh main requests list
            onClose(); // Close modal after successful restore
            alert('Successfully restored selected requests!');
        } catch (error) {
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }, 1500);
            } else if (error.response?.status === 403) {
                setError('Access denied. You need admin privileges to restore backup requests.');
            } else {
                console.error('Error restoring requests:', error);
                setError(
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    'Failed to restore requests'
                );
            }
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
            const type = request.certificate_name.toLowerCase();
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
                                                <td>{request.certificate_name}</td>
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