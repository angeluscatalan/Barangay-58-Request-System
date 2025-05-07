import React, { useEffect } from "react";
import "../styles/Request_Manager.css";
import { useRequests } from "./RBI_Request_Context";

function Verified_RBI_List() {
  const {
    rbiRequests,
    loading,
    error,
    fetchRbiRequests,
  } = useRequests();

  useEffect(() => {
    fetchRbiRequests("approved");
  }, [fetchRbiRequests]);

  if (loading) return <div className="loading">Loading approved registrations...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="request-manager">
      <h1>Verified RBI List</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th colSpan={16} style={{ textAlign: "center", background: "#003591" }}>Household Representative (Head)</th>
            </tr>
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
              <th>Subdivision / Sitio / Purok</th>
              <th># of Members</th>
            </tr>
          </thead>
          <tbody>
            {(rbiRequests.records || []).map((household) => (
              <React.Fragment key={household.id}>
                {/* HEAD ROW */}
                <tr className="head-row" style={{ background: "#e6f7ff" }}>
                  <td>{household.id}</td>
                  <td>{household.head_last_name}</td>
                  <td>{household.head_first_name}</td>
                  <td>{household.head_middle_name || "N/A"}</td>
                  <td>{household.head_suffix || "N/A"}</td>
                  <td>{household.sex || "N/A"}</td>
                  <td>{new Date(household.birth_date).toLocaleDateString()}</td>
                  <td>{household.birth_place || "N/A"}</td>
                  <td>{household.civil_status || "N/A"}</td>
                  <td>{household.citizenship || "N/A"}</td>
                  <td>{household.occupation || "N/A"}</td>
                  <td>{household.email_address || "N/A"}</td>
                  <td>{household.house_unit_no || "N/A"}</td>
                  <td>{household.street_name || "N/A"}</td>
                  <td>{household.subdivision || "N/A"}</td>
                  <td>{household.members?.length || 0}</td>
                </tr>

                {/* MEMBER ROWS */}
                {(household.members || []).map((member) => (
                  <tr key={member.id} className="member-row">
                    <td colSpan={2}>Household #{household.id}</td>
                    <td colSpan={3}>Head: {household.head_first_name} {household.head_last_name}</td>
                    <td>{member.sex || "N/A"}</td>
                    <td>{new Date(member.birth_date).toLocaleDateString()}</td>
                    <td>{member.birth_place || "N/A"}</td>
                    <td>{member.civil_status || "N/A"}</td>
                    <td>{member.citizenship || "N/A"}</td>
                    <td>{member.occupation || "N/A"}</td>
                    <td>{member.email_address || "N/A"}</td>
                    <td colSpan={4}>Member: {member.first_name} {member.middle_name || ""} {member.last_name}</td>
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
