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

  const handleStatusChange = async (id, newStatus) => {
    const success = await updateRequestStatus(id, newStatus);
    if (success) {
      // Refresh the pending requests list
      fetchRequests();
    }
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
                    onClick={() => {/* Add view details functionality */}}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Request_Manager;