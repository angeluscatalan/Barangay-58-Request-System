import React, { useEffect, useState } from "react";
import "../styles/Request_Manager.css";
import { useRequests } from "./RBI_Request_Context";
import RBI_Household_Detail from "./RBI_Household_Detail";

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
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(null);
  const [householdMembers, setHouseholdMembers] = useState({});
  const [activeFilter, setActiveFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRbiRequests(activeFilter); // Initial fetch with default filter
  }, [fetchRbiRequests, activeFilter]);

  const handleStatusChange = async (id, newStatus) => {
    const success = await updateRbiStatus(id, newStatus);
    if (success) {
      // Refresh the current filter view
      fetchRbiRequests(activeFilter);
    }
  };

  const toggleHouseholdDetails = async (id) => {
    // If we're expanding and don't have the members data yet, fetch it
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

  const viewHouseholdDetails = (id) => {
    setSelectedHouseholdId(id);
  };

  const closeModal = () => {
    setSelectedHouseholdId(null);
    // Refresh the list after closing the modal to reflect any changes
    fetchRbiRequests(activeFilter);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    fetchRbiRequests(filter);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRbiRequests(activeFilter, 1, 10, searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    fetchRbiRequests(activeFilter);
  };

  if (loading && !rbiRequests.records.length) return <div className="loading">Loading RBI registrations...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="request-manager">
      <h1>RBI Household Registration Management</h1>
      
      <div className="filter-controls">
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
        
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search households..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
          {searchTerm && <button type="button" onClick={clearSearch}>Clear</button>}
        </form>
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
            {(rbiRequests?.records || []).map((household) => (
              <React.Fragment key={household.id}>
                <tr className={expandedHouseholds[household.id] ? "expanded" : ""}>
                  <td>{household.id}</td>
                  <td>
                    <div className="household-head">
                      {`${household.head_last_name}, ${household.head_first_name} ${household.head_middle_name || ""} ${household.head_suffix || ""}`}
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
                    <button
                      className="view-btn"
                      onClick={() => viewHouseholdDetails(household.id)}
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
                              </tr>
                            </thead>
                            <tbody>
                              {householdMembers[household.id].map((member) => (
                                <tr key={member.id}>
                                  <td>{`${member.last_name}, ${member.first_name} ${member.middle_name || ""} ${member.suffix || ""}`}</td>
                                  <td>{member.sex}</td>
                                  <td>{new Date(member.birth_date).toLocaleDateString()}</td>
                                  <td>{member.civil_status}</td>
                                  <td>{member.occupation}</td>
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
      {rbiRequests.totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={rbiRequests.currentPage === 1}
            onClick={() => fetchRbiRequests(activeFilter, 1)}
          >
            First
          </button>
          <button 
            disabled={rbiRequests.currentPage === 1}
            onClick={() => fetchRbiRequests(activeFilter, rbiRequests.currentPage - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {rbiRequests.currentPage} of {rbiRequests.totalPages}
          </span>
          <button 
            disabled={rbiRequests.currentPage === rbiRequests.totalPages}
            onClick={() => fetchRbiRequests(activeFilter, rbiRequests.currentPage + 1)}
          >
            Next
          </button>
          <button 
            disabled={rbiRequests.currentPage === rbiRequests.totalPages}
            onClick={() => fetchRbiRequests(activeFilter, rbiRequests.totalPages)}
          >
            Last
          </button>
        </div>
      )}

      {/* Show total record count */}
      <div className="record-count">
        Total Records: {rbiRequests.totalRecords || 0}
      </div>

      {/* Detailed household modal */}
      {selectedHouseholdId && (
        <RBI_Household_Detail 
          householdId={selectedHouseholdId} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
}

export default RBI_Request_Manager;