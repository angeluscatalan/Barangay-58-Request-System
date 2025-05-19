import React, { useState } from 'react';

function ComparisonModal({ request, rbis, onClose }) {
  const [expandedRbi, setExpandedRbi] = useState(null);

  const toggleRbiDetails = (rbiId) => {
    setExpandedRbi(expandedRbi === rbiId ? null : rbiId);
  };

  // Helper function to find household head for a member
  const findHouseholdHead = (householdId) => {
    return rbis.find(rbi => rbi.id === householdId && rbi.type === 'Household Head');
  };

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
                <tr>
                  <th>Email:</th>
                  <td>{request.email || "N/A"}</td>
                </tr>
                <tr>
                  <th>Certificate Type:</th>
                  <td>{request.type_of_certificate || "N/A"}</td>
                </tr>
                <tr>
                  <th>Purpose:</th>
                  <td>{request.purpose_of_request || "N/A"}</td>
                </tr>
                <tr>
                  <th>Number of Copies:</th>
                  <td>{request.number_of_copies || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="rbi-results">
            <h4>Matching RBI Records ({rbis.length})</h4>
            {rbis.length > 0 ? (
              <div className="rbi-list">
                {rbis.map((rbi) => (
                  <div 
                    key={rbi.id} 
                    className={`rbi-item ${expandedRbi === rbi.id ? 'expanded' : ''}`}
                    onClick={() => toggleRbiDetails(rbi.id)}
                  >
                    <div className="rbi-summary">
                      <div className="rbi-name">
                        {`${rbi.last_name}, ${rbi.first_name} ${rbi.middle_name || ""}`}
                        {rbi.type && <span className="rbi-type-badge">{rbi.type}</span>}
                      </div>
                      <div className="rbi-basic-info">
                        <span>Birthdate: {rbi.birth_date ? new Date(rbi.birth_date).toLocaleDateString() : "N/A"}</span>
                        <span>Address: {`${rbi.house_unit_no} ${rbi.street_name}, ${rbi.subdivision}`}</span>
                        <span>Status: {rbi.status}</span>
                      </div>
                    </div>
                    {expandedRbi === rbi.id && (
                      <div className="rbi-details">
                        <table>
                          <tbody>
                            <tr>
                              <th>Full Name:</th>
                              <td>{`${rbi.last_name}, ${rbi.first_name} ${rbi.middle_name || ""}`}</td>
                            </tr>
                            <tr>
                              <th>Birthdate:</th>
                              <td>{rbi.birth_date ? new Date(rbi.birth_date).toLocaleDateString() : "N/A"}</td>
                            </tr>
                            <tr>
                              <th>Address:</th>
                              <td>{`${rbi.house_unit_no} ${rbi.street_name}, ${rbi.subdivision}`}</td>
                            </tr>
                            <tr>
                              <th>Status:</th>
                              <td>{rbi.status}</td>
                            </tr>
                            {rbi.type === 'Household Member' && rbi.household_id && (
                              <>
                                <tr>
                                  <th>Household ID:</th>
                                  <td>{rbi.household_id}</td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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