import React, { useEffect, useState } from "react";
import "../styles/Request_Manager.css";
import { useRequests } from "./RBI_Request_Context";

function RBI_Request_Manager() {
  const {
    rbiRequests,
    loading,
    error,
    updateRbiStatus,
    fetchRbiRequests,
    getHouseholdWithMembers
  } = useRequests();

  const [expandedHouseholds, setExpandedHouseholds] = useState({});
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [householdMembers, setHouseholdMembers] = useState({});
  const [activeFilter, setActiveFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  // Add filterRecords function
  const filterRecords = () => {
    if (!rbiRequests.records) return [];

    let filtered = [...rbiRequests.records];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(household =>
        household.head_last_name?.toLowerCase().includes(query) ||
        household.head_first_name?.toLowerCase().includes(query) ||
        household.head_middle_name?.toLowerCase().includes(query) ||
        household.house_unit_no?.toLowerCase().includes(query) ||
        household.street_name?.toLowerCase().includes(query) ||
        household.subdivision?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  useEffect(() => {
    fetchRbiRequests(activeFilter, 1, 10, searchTerm);
  }, [fetchRbiRequests, activeFilter, searchTerm]);

  // Auto-refresh table every 1 hour
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRbiRequests(activeFilter, 1, 10, searchTerm);
    }, 60 * 60 * 1000); // 1 hour in ms
    return () => clearInterval(interval);
  }, [fetchRbiRequests, activeFilter, searchTerm]);

  const handleStatusChange = async (id, newStatus) => {
    const success = await updateRbiStatus(id, newStatus);
    if (success) {
      fetchRbiRequests(activeFilter);
    }
  };

  const toggleHouseholdDetails = async (id) => {
    if (!expandedHouseholds[id] && !householdMembers[id]) {
      try {
        const data = await getHouseholdWithMembers(id);
        if (data && data.members) {
          setHouseholdMembers(prev => ({
            ...prev,
            [id]: data.members
          }));
        }
      } catch (err) {
        console.error("Failed to fetch household members:", err);
      }
    }

    setExpandedHouseholds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const viewHouseholdDetails = async (household) => {
    try {
      const data = await getHouseholdWithMembers(household.id);
      setSelectedHousehold({
        ...household,
        members: data.members || []
      });
    } catch (err) {
      console.error("Failed to fetch household details:", err);
    }
  };

  const closeModal = () => {
    setSelectedHousehold(null);
    fetchRbiRequests(activeFilter);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    fetchRbiRequests(filter);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // The search will be triggered by the useEffect hook since we're updating searchTerm
  };

  const clearSearch = () => {
    setSearchTerm("");
    // The search will be cleared by the useEffect hook since we're updating searchTerm
  };

  // Manual refresh handler
  const handleRefresh = () => {
    fetchRbiRequests(activeFilter, 1, 10, searchTerm);
  };

  // Helper functions for display
  const getSuffixDisplay = (suffixId) => {
    switch (String(suffixId)) {
      case "2": return "Jr.";
      case "3": return "Sr.";
      case "4": return "I";
      case "5": return "II";
      case "6": return "III";
      case "7": return "IV";
      case "8": return "V";
      default: return "";
    }
  };

  const getSexDisplay = (sex, sexOther) => {
    switch (String(sex)) {
      case "1": return "Male";
      case "2": return "Female";
      case "3": return "Prefer Not To Say";
      case "4": return sexOther ? sexOther : "Other";
      default: return "";
    }
  };

  const getRelationshipDisplay = (relationshipId, relationshipOther) => {
    switch (String(relationshipId)) {
      case "1": return "Mother";
      case "2": return "Father";
      case "3": return "Son";
      case "4": return "Daughter";
      case "5": return "Brother";
      case "6": return "Sister";
      case "7": return "Grandmother";
      case "8": return "Grandfather";
      case "9": return relationshipOther ? relationshipOther : "Others";
      default: return "";
    }
  };

  if (loading && !rbiRequests.records.length) return <div className="loading">Loading RBI registrations...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="request-manager">
      <h1>RBI Household Registration Management</h1>

      <div className="table-header">
        <div className="events-count">
          RBI Registrations <span className="event-count">({filterRecords().length || 0})</span>
        </div>
        <div className="table-controls">
          <button className="refresh-btn" onClick={handleRefresh} title="Refresh Table">
            &#x21bb; Refresh
          </button>
          <div className="filter-buttons">
            <button
              className={activeFilter === "pending" ? "active" : ""}
              onClick={() => handleFilterClick("pending")}
            >
              Pending
            </button>
            <button
              className={activeFilter === "approved" ? "active" : ""}
              onClick={() => handleFilterClick("approved")}
            >
              Approved
            </button>
            <button
              className={activeFilter === "rejected" ? "active" : ""}
              onClick={() => handleFilterClick("rejected")}
            >
              Rejected
            </button>
            <button
              className={activeFilter === "for interview" ? "active" : ""}
              onClick={() => handleFilterClick("for interview")}
            >
              For Interview
            </button>
            <button
              className={activeFilter === null ? "active" : ""}
              onClick={() => handleFilterClick(null)}
            >
              All
            </button>
          </div>
          <div className="action-buttons">
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search RBI requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit">Search</button>
              {searchTerm && <button type="button" onClick={clearSearch}>Clear</button>}
            </form>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Household Head</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filterRecords().map((household) => (
              <React.Fragment key={household.id}>
                <tr className={expandedHouseholds[household.id] ? "expanded" : ""}>
                  <td>{household.id}</td>
                  <td>
                    <div className="household-head">
                      {`${household.head_last_name}, ${household.head_first_name} ${household.head_middle_name || ""} ${getSuffixDisplay(household.head_suffix_id)}`}
                      <button
                        className="toggle-btn"
                        onClick={() => toggleHouseholdDetails(household.id)}
                        title="Show/Hide Members"
                      >
                        {expandedHouseholds[household.id] ? '▼' : '►'}
                      </button>
                    </div>
                  </td>
                  <td>{`${household.house_unit_no || ""} ${household.street_name || ""}, ${household.subdivision || ""}`}</td>
                  <td className={`status ${household.status}`}>{household.status}</td>
                  <td className="actions">
                    {household.status === 'pending' && (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => handleStatusChange(household.id, "approved")}
                          title="Approve this household and all members"
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleStatusChange(household.id, "rejected")}
                          title="Reject this household registration"
                        >
                          Reject
                        </button>
                        <button
                          className="interview-btn"
                          onClick={() => handleStatusChange(household.id, "for interview")}
                          title="Mark for further interview"
                        >
                          Interview
                        </button>
                      </>
                    )}
                    {(household.status === 'rejected' || household.status === 'for interview') && (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => handleStatusChange(household.id, "approved")}
                          title="Approve this household"
                        >
                          Approve
                        </button>
                        <button
                          className="pending-btn"
                          onClick={() => handleStatusChange(household.id, "pending")}
                          title="Return to pending status"
                        >
                          Set Pending
                        </button>
                      </>
                    )}
                    {household.status === 'approved' && (
                      <>
                        <button
                          className="reject-btn"
                          onClick={() => handleStatusChange(household.id, "rejected")}
                          title="Reject this household"
                        >
                          Reject
                        </button>
                        <button
                          className="interview-btn"
                          onClick={() => handleStatusChange(household.id, "for interview")}
                          title="Mark for further interview"
                        >
                          Interview
                        </button>
                      </>
                    )}
                    <button
                      className="view-btn"
                      onClick={() => viewHouseholdDetails(household)}
                      title="View complete household details"
                    >
                      View
                    </button>
                  </td>
                </tr>
                {expandedHouseholds[household.id] && (
                  <tr className="member-details">
                    <td colSpan="5">
                      <div className="household-details">
                        <h4>Household Members</h4>
                        {loading && !householdMembers[household.id] ? (
                          <p>Loading members...</p>
                        ) : householdMembers[household.id]?.length > 0 ? (
                          <table className="members-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Sex</th>
                                <th>Birth Date</th>
                                <th>Civil Status</th>
                                <th>Occupation</th>
                                <th>Relationship</th>
                              </tr>
                            </thead>
                            <tbody>
                              {householdMembers[household.id].map((member) => (
                                <tr key={member.id}>
                                  <td>{`${member.last_name}, ${member.first_name} ${member.middle_name || ""} ${getSuffixDisplay(member.suffix_id)}`}</td>
                                  <td>{getSexDisplay(member.sex, member.sex_other)}</td>
                                  <td>{new Date(member.birth_date).toLocaleDateString()}</td>
                                  <td>{member.civil_status}</td>
                                  <td>{member.occupation}</td>
                                  <td>{getRelationshipDisplay(member.relationship_id, member.relationship_other)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p>No additional members in this household</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {filterRecords().length > 10 && (
        <div className="pagination">
          <button
            disabled={rbiRequests.currentPage === 1}
            onClick={() => fetchRbiRequests(activeFilter, 1, 10, searchTerm)}
          >
            First
          </button>
          <button
            disabled={rbiRequests.currentPage === 1}
            onClick={() => fetchRbiRequests(activeFilter, rbiRequests.currentPage - 1, 10, searchTerm)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {rbiRequests.currentPage} of {Math.ceil(filterRecords().length / 10)}
          </span>
          <button
            disabled={rbiRequests.currentPage === Math.ceil(filterRecords().length / 10)}
            onClick={() => fetchRbiRequests(activeFilter, rbiRequests.currentPage + 1, 10, searchTerm)}
          >
            Next
          </button>
          <button
            disabled={rbiRequests.currentPage === Math.ceil(filterRecords().length / 10)}
            onClick={() => fetchRbiRequests(activeFilter, Math.ceil(filterRecords().length / 10), 10, searchTerm)}
          >
            Last
          </button>
        </div>
      )}

      {/* Show total record count */}
      <div className="record-count">
        Total Records: {filterRecords().length || 0}
      </div>

      {/* Household Details Modal */}
      {selectedHousehold && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Household Details</h2>
              <button className="close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="household-info">
                <h3>Household Head Information</h3>
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Sex</th>
                      <th>Birth Date</th>
                      <th>Civil Status</th>
                      <th>Citizenship</th>
                      <th>Occupation</th>
                      <th>Email</th>
                      <th>Address</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {`${selectedHousehold.head_last_name}, ${selectedHousehold.head_first_name} ${selectedHousehold.head_middle_name || ""} ${getSuffixDisplay(selectedHousehold.head_suffix_id)}`}
                      </td>
                      <td>{getSexDisplay(selectedHousehold.sex, selectedHousehold.sex_other)}</td>
                      <td>{new Date(selectedHousehold.birth_date).toLocaleDateString()}</td>
                      <td>{selectedHousehold.civil_status}</td>
                      <td>{selectedHousehold.citizenship}</td>
                      <td>{selectedHousehold.occupation}</td>
                      <td>{selectedHousehold.email_address}</td>
                      <td>{`${selectedHousehold.house_unit_no || ""} ${selectedHousehold.street_name || ""}, ${selectedHousehold.subdivision || ""}`}</td>
                      <td>
                        <span className={`status-badge ${selectedHousehold.status}`}>
                          {selectedHousehold.status}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="members-section">
                <h3>Household Members ({selectedHousehold.members.length})</h3>
                {selectedHousehold.members.length > 0 ? (
                  <table className="members-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Sex</th>
                        <th>Birth Date</th>
                        <th>Civil Status</th>
                        <th>Occupation</th>
                        <th>Relationship</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHousehold.members.map((member) => (
                        <tr key={member.id}>
                          <td>{`${member.last_name}, ${member.first_name} ${member.middle_name || ""} ${getSuffixDisplay(member.suffix_id)}`}</td>
                          <td>{getSexDisplay(member.sex, member.sex_other)}</td>
                          <td>{new Date(member.birth_date).toLocaleDateString()}</td>
                          <td>{member.civil_status}</td>
                          <td>{member.occupation}</td>
                          <td>{getRelationshipDisplay(member.relationship_id, member.relationship_other)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No members in this household</p>
                )}
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

export default RBI_Request_Manager;