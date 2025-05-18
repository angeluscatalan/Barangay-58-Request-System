import React, { useEffect, useState } from "react";
import "../styles/Request_Manager.css";
import { useRequests } from "./RBI_Request_Context";


function Verified_RBI_List() {
  const { rbiRequests, loading, error, fetchRbiRequests } = useRequests();
  const [expandedHouseholds, setExpandedHouseholds] = useState([]);

  useEffect(() => {
    console.log("Making API call for approved households");
    fetchRbiRequests("approved");
  }, [fetchRbiRequests]);

  useEffect(() => {
    console.log("Current rbiRequests:", rbiRequests);
  }, [rbiRequests]);

  const toggleHousehold = (id) => {
    setExpandedHouseholds(prev => 
      prev.includes(id) 
        ? prev.filter(householdId => householdId !== id)
        : [...prev, id]
    );
  };

  if (loading) return <div className="loading">Loading approved registrations...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="request-manager">
      <h1>Verified RBI List (Approved Only)</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Suffix</th>
              <th>Sex</th>
              <th>Date of Birth</th>
              <th>Birth Place</th>
              <th>Civil Status</th>
              <th>Citizenship</th>
              <th>Occupation</th>
              <th>Email</th>
              <th>House/Unit No.</th>
              <th>Street Name</th>
              <th>Subdivision</th>
              <th># of Members</th>
            </tr>
          </thead>
          <tbody>
            {(rbiRequests.records || []).map((household) => (
              <React.Fragment key={household.id}>
                {/* Clickable Household Head Row */}
                <tr 
                  className="head-row clickable"
                  onClick={() => toggleHousehold(household.id)}
                >
                  <td>{household.id}</td>
                  <td>{household.head_last_name}</td>
                  <td>{household.head_first_name}</td>
                  <td>{household.head_middle_name || "N/A"}</td>
                  <td>{household.head_suffix || "N/A"}</td>
                  <td>{household.sex}</td>
                  <td>{new Date(household.birth_date).toLocaleDateString()}</td>
                  <td>{household.birth_place}</td>
                  <td>{household.civil_status}</td>
                  <td>{household.citizenship}</td>
                  <td>{household.occupation}</td>
                  <td>{household.email_address}</td>
                  <td>{household.house_unit_no}</td>
                  <td>{household.street_name}</td>
                  <td>{household.subdivision}</td>
                  <td>
                    {household.members?.length || 0}
                    <span className="toggle-icon">
                      {expandedHouseholds.includes(household.id) ? '▼' : '▶'}
                    </span>
                  </td>
                </tr>

                {/* Member Rows (conditionally rendered) */}
                {expandedHouseholds.includes(household.id) && 
                 (household.members || []).map((member, index) => (
                  <tr key={`${household.id}-${index}`} className="member-row">
                    <td>{household.id}</td>
                    <td>{member.last_name}</td>
                    <td>{member.first_name}</td>
                    <td>{member.middle_name || "N/A"}</td>
                    <td>{member.suffix || "N/A"}</td>
                    <td>{member.sex}</td>
                    <td>{new Date(member.birth_date).toLocaleDateString()}</td>
                    <td>{member.birth_place}</td>
                    <td>{member.civil_status}</td>
                    <td>{member.citizenship}</td>
                    <td>{member.occupation}</td>
                    <td colSpan="5">Member of Household #{household.id}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Verified_RBI_List;