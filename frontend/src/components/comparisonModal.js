import React from 'react';

function ComparisonModal({ request, rbis, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>RBI Record Comparison</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="comparison-container">
          <div className="request-details">
            <h4>Request Information</h4>
            <table>
              <tbody>
                <tr>
                  <th>Name:</th>
                  <td>{`${request.last_name}, ${request.first_name} ${request.middle_name || ""}`}</td>
                </tr>
                <tr>
                  <th>Birthdate:</th>
                  <td>{request.birthday ? new Date(request.birthday).toLocaleDateString() : "N/A"}</td>
                </tr>
                <tr>
                  <th>Address:</th>
                  <td>{request.address}</td>
                </tr>
                <tr>
                  <th>Contact:</th>
                  <td>{request.contact_no}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rbi-results">
            <h4>Matching RBI Records ({rbis.length})</h4>
            {rbis.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Birthdate</th>
                    <th>Address</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rbis.map((rbi, index) => (
                    <tr key={index}>
                      <td>{`${rbi.last_name}, ${rbi.first_name} ${rbi.middle_name || ""}`}</td>
                      <td>{rbi.birth_date ? new Date(rbi.birth_date).toLocaleDateString() : "N/A"}</td>
                      <td>{`${rbi.house_unit_no} ${rbi.street_name}, ${rbi.subdivision}`}</td>
                      <td>{rbi.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No matching RBI records found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComparisonModal;