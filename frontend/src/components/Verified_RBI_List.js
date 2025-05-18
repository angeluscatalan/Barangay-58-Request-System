import React, { useEffect, useState, useCallback } from "react";
import "../styles/Request_Manager.css";
import { useRequests } from "./RBI_Request_Context";
import axios from "axios";

function Verified_RBI_List() {
  const { rbiRequests, loading, error, fetchRbiRequests } = useRequests();
  const [expandedHouseholds, setExpandedHouseholds] = useState([]);
  const [selectedItems, setSelectedItems] = useState({
    households: [],
    members: []
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRbiRequests("approved");
  }, [fetchRbiRequests]);

  const toggleHousehold = (id) => {
    setExpandedHouseholds(prev => 
      prev.includes(id) 
        ? prev.filter(householdId => householdId !== id)
        : [...prev, id]
    );
  };

  // Handle selection of households or members
  const handleSelectItem = (type, id, householdId = null) => {
    setSelectedItems(prev => {
      const key = type === 'household' ? 'households' : 'members';
      const newSelection = [...prev[key]];
      
      const index = newSelection.findIndex(item => 
        type === 'household' ? item === id : item.id === id
      );

      if (index > -1) {
        newSelection.splice(index, 1);
      } else {
        if (type === 'household') {
          newSelection.push(id);
        } else {
          newSelection.push({ id, householdId });
        }
      }

      return {
        ...prev,
        [key]: newSelection
      };
    });
  };

  // Master select for households
  const handleMasterSelectHouseholds = (e) => {
    if (e.target.checked) {
      setSelectedItems(prev => ({
        ...prev,
        households: rbiRequests.records.map(household => household.id)
      }));
    } else {
      setSelectedItems(prev => ({
        ...prev,
        households: []
      }));
    }
  };

  // Delete selected items
 const handleDeleteSelected = async () => {
  const totalSelected = selectedItems.households.length + selectedItems.members.length;
  if (totalSelected === 0) {
    alert("Please select at least one item to delete");
    return;
  }

  if (!window.confirm(`Delete ${totalSelected} selected item(s)?`)) return;

  try {
    setIsDeleting(true);
    const token = localStorage.getItem("token");
    
    // Process deletions
    const results = await Promise.allSettled([
      ...selectedItems.members.map(member => 
        axios.delete(`http://localhost:5000/api/rbi/members/${member.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ),
      ...selectedItems.households.map(id =>
        axios.delete(`http://localhost:5000/api/rbi/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    ]);

    const failedDeletions = results.filter(r => r.status === 'rejected');
    
    if (failedDeletions.length > 0) {
      console.error('Failed deletions:', failedDeletions);
      alert(`Deleted ${totalSelected - failedDeletions.length} items successfully. ${failedDeletions.length} failed.`);
    } else {
      alert(`${totalSelected} items deleted successfully!`);
    }

    // Refresh data if any deletions succeeded
    if (failedDeletions.length < totalSelected) {
      await fetchRbiRequests("approved");
      setSelectedItems({ households: [], members: [] });
    }
  } catch (error) {
    console.error("Deletion error:", error);
    alert("An error occurred during deletion");
  } finally {
    setIsDeleting(false);
  }
};

  if (loading) return <div className="loading">Loading approved registrations...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="request-manager">
      <h1>Verified RBI List</h1>
      
      {/* Bulk actions bar */}
      {(selectedItems.households.length > 0 || selectedItems.members.length > 0) && (
        <div className="bulk-actions">
          <button 
            className="bulk-delete-btn" 
            onClick={handleDeleteSelected}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <>
                <i className="fas fa-trash-alt"></i> Delete Selected (
                {selectedItems.households.length + selectedItems.members.length})
              </>
            )}
          </button>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedItems.households.length === (rbiRequests.records?.length || 0) && 
                           rbiRequests.records?.length > 0}
                  onChange={handleMasterSelectHouseholds}
                />
              </th>
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
                {/* Household Head Row */}
                <tr 
                  className={`head-row clickable ${expandedHouseholds.includes(household.id) ? 'expanded' : ''}`}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.households.includes(household.id)}
                      onChange={() => handleSelectItem('household', household.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.id}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.head_last_name}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.head_first_name}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.head_middle_name || "N/A"}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.head_suffix || "N/A"}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.sex}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{new Date(household.birth_date).toLocaleDateString()}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.birth_place}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.civil_status}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.citizenship}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.occupation}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.email_address}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.house_unit_no}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.street_name}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.subdivision}</td>
                  <td onClick={() => toggleHousehold(household.id)}>
                    {household.members?.length || 0}
                    <span className="toggle-icon">
                      {expandedHouseholds.includes(household.id) ? '▼' : '▶'}
                    </span>
                  </td>
                </tr>

                {/* Member Rows */}
                {expandedHouseholds.includes(household.id) && 
                 (household.members || []).map((member, index) => (
                  <tr key={`${household.id}-${index}`} className="member-row">
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.members.some(m => m.id === member.id)}
                        onChange={() => handleSelectItem('member', member.id, household.id)}
                      />
                    </td>
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