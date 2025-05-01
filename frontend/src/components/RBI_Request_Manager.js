import React, { useEffect } from "react";
import "../styles/Request_Manager.css";
import { useRequests } from "./RBI_Request_Context";

function RBI_Request_Manager() {
  const {
    rbiRequests,
    loading,
    error,
    updateRbiStatus,
    fetchRbiRequests,
  } = useRequests();

  useEffect(() => {
    fetchRbiRequests("Pending"); // Fetch only pending by default
  }, [fetchRbiRequests]);

  const handleStatusChange = async (id, newStatus) => {
    const success = await updateRbiStatus(id, newStatus);
    if (success) {
      fetchRbiRequests("Pending");
    }
  };

  if (loading) return <div className="loading">Loading RBI registrations...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="request-manager">
      <h1>Pending RBI Registrations</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Suffix</th>
              <th>Sex</th>
              <th>Birthday</th>
              <th>Birthplace</th>
              <th>Civil Status</th>
              <th>Citizenship</th>
              <th>Occupation</th>
              <th>Email</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {(rbiRequests || []).map((reg) => (

              <tr key={reg.id}>
                <td>{reg.id}</td>
                <td>{`${reg.last_name}, ${reg.first_name} ${reg.middle_name || ""}`}</td>
                <td>{reg.suffix}</td>
                <td>{reg.sex}</td>
                <td>{reg.birth_date}</td>
                <td>{reg.birth_place}</td>
                <td>{reg.civil_status}</td>
                <td>{reg.citizenship}</td>
                <td>{reg.occupation}</td>
                <td>{reg.email_address}</td>
                <td>{`${reg.house_unit_no || ""} ${reg.street_name || ""} ${reg.subdivision || ""}`}</td>
                <td>{reg.status}</td>
                <td className="actions">
                  <button
                    className="approve-btn"
                    onClick={() => handleStatusChange(reg.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleStatusChange(reg.id, "rejected")}
                  >
                    Reject
                  </button>
                  <button
                    className="view-btn"
                    onClick={() => {
                      // Add modal/view logic if needed
                    }}
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

export default RBI_Request_Manager;
