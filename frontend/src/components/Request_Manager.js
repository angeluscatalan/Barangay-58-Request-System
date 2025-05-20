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

  const pendingRequests = requests.filter(req => req.status === 'Pending');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleStatusChange = async (id, newStatus) => {
    const success = await updateRequestStatus(id, newStatus);
    if (success) {
      fetchRequests();
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

  return (
    <div className="request-manager">
      <h1>Pending Requests</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Name</th>
              <th>Certificate Type</th>
              <th>Date Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((request) => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>{`${request.last_name}, ${request.first_name}`}</td>
                <td>{request.type_of_certificate}</td>
                <td>{new Date(request.created_at).toLocaleDateString()}</td>
                <td className="actions">
                  <button
                    className="approve-btn"
                    onClick={() => handleStatusChange(request.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleStatusChange(request.id, "rejected")}
                  >
                    Reject
                  </button>
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
                    <span>{selectedRequest.type_of_certificate}</span>
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
                    <label>Civil Status:</label>
                    <span>{selectedRequest.civil_status || 'N/A'}</span>
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