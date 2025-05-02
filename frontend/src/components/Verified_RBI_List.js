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
    fetchRbiRequests("approved"); // Only fetch approved ones
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
            </tr>
          </thead>
          <tbody>
            {(rbiRequests || []).map((reg) => (
              <tr key={reg.id}>
                <td>{reg.id}</td>
                <td>{`${reg.last_name}, ${reg.first_name} ${reg.middle_name || ""}`}</td>
                <td>{reg.suffix || "N/A"}</td>
                <td>{reg.sex || "N/A"}</td>
                <td>{new Date(reg.birth_date).toLocaleDateString() || "N/A"}</td>
                <td>{reg.birth_place || "N/A"}</td>
                <td>{reg.civil_status || "N/A"}</td>
                <td>{reg.citizenship || "N/A"}</td>
                <td>{reg.occupation || "N/A"}</td>
                <td>{reg.email_address || "N/A"}</td>
                <td>{`${reg.house_unit_no || ""} ${reg.street_name || ""} ${reg.subdivision || ""}` || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Verified_RBI_List;
