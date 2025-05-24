import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Request_Manager.css";
import { useRequests } from "../components/requestContext";

function Request_Manager() {
  const {
    requests,
    loading,
    error,
    updateRequestStatus,
    fetchRequests
  } = useRequests();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState(null);

  // Fetch statuses on component mount
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setStatusLoading(true);
        const response = await axios.get('https://barangay-58-request-system-n07q.onrender.com/api/requests/statuses');
        // console.log('Statuses API response:', response.data); // Remove debug log in production
        setStatuses(response.data);
        setStatusError(null);
      } catch (err) {
        // Only log in development
        if (process.env.NODE_ENV === "development") {
          console.error('Error fetching statuses:', err);
        }
        setStatusError('Failed to load status options. Please check your connection or try again later.');
        setStatuses([]);
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatuses();
  }, []);

  // Auto-refresh table every 1 hour
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests();
    }, 60 * 60 * 1000); // 1 hour in ms
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const filterRequests = () => {
    if (!requests) return [];

    let filtered = [...requests];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(request =>
        request.last_name?.toLowerCase().includes(query) ||
        request.first_name?.toLowerCase().includes(query) ||
        request.middle_name?.toLowerCase().includes(query) ||
        request.certificate_name?.toLowerCase().includes(query) ||
        request.purpose_of_request?.toLowerCase().includes(query) ||
        request.status?.toLowerCase().includes(query)
      );
    }

    // Filter for pending requests (status_id = 1)
    return filtered.filter(req => req.status_id === 1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleStatusChange = async (id, status_id) => {
    const rejectedStatus = statuses.find(s => s.name.toLowerCase() === 'rejected');
    if (status_id === rejectedStatus?.id) {
      // Delete request (backend should move to backup_requests and delete file)
      try {
        const token = localStorage.getItem('token'); // <-- Add this line
        await axios.delete(`https://barangay-58-request-system-n07q.onrender.com/api/requests/${id}`, {
          headers: { Authorization: `Bearer ${token}` } // <-- Add this line
        });
        fetchRequests();
      } catch (err) {
        alert('Failed to reject and delete request.');
      }
    } else {
      const success = await updateRequestStatus(id, status_id);
      if (success) {
        fetchRequests();
      }
    }
  };

  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
  };

  const closeModal = () => {
    setSelectedRequest(null);
  };

  // Manual refresh handler
  const handleRefresh = () => {
    fetchRequests();
  };

  if (loading) return <div className="loading">Loading requests...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const filteredRequests = filterRequests();

  return (
    <div className="request-manager">
      <h1>Pending Requests</h1>

      <div className="table-header">
        <div className="requests-count">
          Pending Requests <span className="request-count">({filteredRequests.length})</span>
        </div>
        <div className="table-controls">
          <button className="refresh-btn" onClick={handleRefresh} title="Refresh Table">
            &#x21bb; Refresh
          </button>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search pending requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
            {searchTerm && <button type="button" onClick={clearSearch}>Clear</button>}
          </form>
        </div>
      </div>

      <div className="table-container">
        {statusError && (
          <div className="status-error-banner">
            {statusError}
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Name</th>
              <th>Certificate Type</th>
              <th>Date Requested</th>
              <th>Control Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id}>
                <td>{`${request.id}`}</td>
                <td>{`${request.last_name}, ${request.first_name}`}</td>
                <td>{request.certificate_name}</td>
                <td>{new Date(request.created_at).toLocaleDateString()}</td>
                <td>{request.control_id || 'Pending'}</td>
                <td>
                  <span className={`fstatus-badge ${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </td>
                <td className="actions">
                  {statusLoading ? (
                    <div className="status-loading">Loading options...</div>
                  ) : statusError ? (
                    <div className="status-error">Status options unavailable</div>
                  ) : (
                    <>
                      <button
                        className="approve-btn"
                        onClick={() => handleStatusChange(request.id, statuses.find(s => s.name.toLowerCase() === 'approved')?.id)}
                        disabled={request.status.toLowerCase() === 'approved'}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleStatusChange(request.id, statuses.find(s => s.name.toLowerCase() === 'rejected')?.id)}
                        disabled={request.status.toLowerCase() === 'rejected'}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    className="view-btn"
                    onClick={() => viewRequestDetails(request)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rest of your modal code remains the same */}
      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Certificate Request Details</h2>
              <button className="close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="request-info">
                <h3>Request Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Request ID:</label>
                    <span>{selectedRequest.id}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedRequest.status.toLowerCase()}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Certificate Type:</label>
                    <span>{selectedRequest.certificate_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Date Requested:</label>
                    <span>{new Date(selectedRequest.created_at).toLocaleString()}</span>
                  </div>
                  <div className="info-item">
                    <label>Purpose:</label>
                    <span>{selectedRequest.purpose_of_request || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Number of Copies:</label>
                    <span>{selectedRequest.number_of_copies || '1'}</span>
                  </div>
                </div>
                {/* Show uploaded image if certificate is Barangay ID Application or Barangay Clearance */}
                {(
                  selectedRequest.certificate_name === "Barangay ID Application" ||
                  selectedRequest.certificate_name === "Barangay Clearance"
                ) && selectedRequest.photo_url && (
                  <div className="info-item" style={{ marginTop: "1rem" }}>
                    <label>Uploaded Photo:</label>
                    <div style={{ marginTop: 8 }}>
                      <img
                        src={selectedRequest.photo_url}
                        alt="Uploaded"
                        style={{ maxWidth: 160, maxHeight: 160, borderRadius: 8, border: "1px solid #ccc" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="applicant-info">
                <h3>Applicant Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Full Name:</label>
                    <span>{`${selectedRequest.last_name}, ${selectedRequest.first_name} ${selectedRequest.middle_name || ''}`}</span>
                  </div>
                  <div className="info-item">
                    <label>Suffix:</label>
                    <span>{selectedRequest.suffix || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Birth Date:</label>
                    <span>{selectedRequest.birthday ? new Date(selectedRequest.birthday).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Age:</label>
                    <span>{selectedRequest.birthday ?
                      (new Date().getFullYear() - new Date(selectedRequest.birthday).getFullYear()) : 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Sex:</label>
                    <span>
                      {selectedRequest.sex_display ||
                        selectedRequest.sex_name ||
                        'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Contact Number:</label>
                    <span>{selectedRequest.contact_no || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedRequest.email || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Address:</label>
                    <span>{selectedRequest.address || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="close-modal-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Request_Manager;