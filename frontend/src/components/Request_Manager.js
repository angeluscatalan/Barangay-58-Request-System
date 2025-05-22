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
        const response = await axios.get('http://localhost:5000/api/requests/statuses');
        console.log('Statuses API response:', response.data); // Debug log
        setStatuses(response.data);
        setStatusError(null);
      } catch (err) {
        console.error('Error fetching statuses:', err); // Debug log
        setStatusError('Failed to load status options');
        setStatuses([]); // Ensure empty array on error
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatuses();
  }, []);

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
        await axios.delete(`http://localhost:5000/api/requests/${id}`);
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
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Name</th>
              <th>Certificate Type</th>
              <th>Date Requested</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>{`${request.last_name}, ${request.first_name}`}</td>
                <td>{request.certificate_name}</td>
                <td>{new Date(request.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${request.status.toLowerCase()}`}>
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
                    <span>{selectedRequest.sex || 'N/A'}</span>
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