import React, { useEffect, useState, useCallback } from "react";
import "../styles/Request_Manager.css";
import { useRequests } from "./RBI_Request_Context";
import axios from "axios";
import BackupVerifiedRBIModal from "./BackupVerifiedRBIModal";
import EditRBIModal from "./EditRBIModal";
import AddHouseholdModal from "./AddHouseholdModal";
import AddHouseholdMemberModal from "./AddHouseholdMemberModal";
import { getSuffixLabel } from "./EditRBIModal"; // Import the helper


function Verified_RBI_List() {
  const { rbiRequests, loading, error, fetchRbiRequests } = useRequests();
  const [expandedHouseholds, setExpandedHouseholds] = useState([]);
  const [selectedItems, setSelectedItems] = useState({
    households: [],
    members: []
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editType, setEditType] = useState('household');
  const [isAddHouseholdModalOpen, setIsAddHouseholdModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(null);
  // New state variables for search, sort, and zoom
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [zoomLevel, setZoomLevel] = useState(100);



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
          setSelectedHouseholdId(id); // Add this line
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
          axios.delete(`https://barangay-58-request-system-n07q.onrender.com/api/rbi/members/${member.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ),
        ...selectedItems.households.map(id =>
          axios.delete(`https://barangay-58-request-system-n07q.onrender.com/api/rbi/${id}`, {
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

  const handleRestore = async () => {
    await fetchRbiRequests("approved");
  };

  const handleEditSelected = () => {
    const totalSelected = selectedItems.households.length + selectedItems.members.length;
    if (totalSelected !== 1) {
      alert("Please select exactly one item to edit");
      return;
    }

    if (selectedItems.households.length === 1) {
      const householdId = selectedItems.households[0];
      const household = rbiRequests.records.find(h => h.id === householdId);
      if (household) {
        setCurrentEditItem(household);
        setEditType('household');
        setEditModalOpen(true);
      }
    } else if (selectedItems.members.length === 1) {
      const member = selectedItems.members[0];
      const household = rbiRequests.records.find(h => h.id === member.householdId);
      if (household) {
        const memberData = household.members.find(m => m.id === member.id);
        if (memberData) {
          setCurrentEditItem(memberData);
          setEditType('member');
          setEditModalOpen(true);
        }
      }
    }
  };

  // Add this function to handle saving edits
  const handleSaveEdit = async (updatedData) => {
  try {
    // Process citizenship data
    const processedData = {
      ...updatedData,
      // If citizenship is "Other" and citizenship_other has a value, use that
      citizenship: updatedData.citizenship === "Other" && updatedData.citizenship_other 
        ? updatedData.citizenship_other 
        : updatedData.citizenship,
      // Remove the citizenship_other field as we don't need to store it separately
      citizenship_other: undefined
    };

    const token = localStorage.getItem("token");
    let response;

    if (editType === 'household') {
      response = await axios.put(
        `https://barangay-58-request-system-n07q.onrender.com/api/rbi/${currentEditItem.id}`,
        processedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      const member = selectedItems.members[0];
      response = await axios.put(
        `https://barangay-58-request-system-n07q.onrender.com/api/rbi/${member.householdId}/members/${member.id}`,
        processedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    if (response.data.success) {
      alert("Changes saved successfully!");
      setEditModalOpen(false);
      fetchRbiRequests("approved");
    }
  } catch (error) {
    console.error("Error saving changes:", error);
    alert("Failed to save changes");
  }
};

  const handleAddHousehold = async (householdData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        'https://barangay-58-request-system-n07q.onrender.com/api/rbi',
        { household: householdData, members: [] }, // Empty members array for now
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Household added successfully!");
        setIsAddHouseholdModalOpen(false);
        fetchRbiRequests("approved");
      }
    } catch (error) {
      console.error("Error adding household:", error);
      alert("Failed to add household");
    }
  };

  const handleAddHouseholdMember = async (memberData) => {
    const sexMap = {
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "Male": 1,
      "Female": 2,
      "Prefer Not To Say": 3,
      "Other": 4
    };

    const suffixMap = {
      "": 1, // 1 represents 'None' in the database
      "Jr.": 2,
      "Sr.": 3,
      "I": 4,
      "II": 5,
      "III": 6,
      "IV": 7,
      "V": 8
    };

    let payload = {
      ...memberData,
      sex: sexMap[memberData.sex] ? Number(sexMap[memberData.sex]) : undefined,
      suffix_id: suffixMap[memberData.suffix] || 1, // Default to 1 (None) if not found
      occupation: memberData.occupation || null
    };

    // Remove unnecessary fields
    delete payload.suffix;
    if (payload.citizenship !== "Other") {
      delete payload.citizenship_other;
    }

    // Remove empty string fields (backend may reject them)
    Object.keys(payload).forEach(
      key => (payload[key] === "" || payload[key] === undefined) && delete payload[key]
    );

    console.log('Attempting to send payload:', payload);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://barangay-58-request-system-n07q.onrender.com/api/rbi/${selectedHouseholdId}/members`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert("Household member added successfully!");
        setIsAddMemberModalOpen(false);
        fetchRbiRequests("approved");
      }
    } catch (error) {
      console.error("Error adding household member:", error);
      console.log("Request payload:", payload);
      console.log("Error response:", error.response?.data);
      console.log("Error status:", error.response?.status);
      console.log("Error headers:", error.response?.headers);
      alert(
        error.response?.data?.error ||
        "Failed to add household member. Please check all required fields."
      );
    }
  };

  // Helper for citizenship display
  const getCitizenshipDisplay = (citizenship) => {
  return citizenship || "Not specified";
};
  // Add search filter function
  const filterRecords = useCallback(() => {
    if (!rbiRequests.records) return [];

    let filtered = [...rbiRequests.records];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(household =>
        household.head_last_name.toLowerCase().includes(query) ||
        household.head_first_name.toLowerCase().includes(query) ||
        household.head_middle_name?.toLowerCase().includes(query) ||
        household.house_unit_no?.toLowerCase().includes(query) ||
        household.street_name?.toLowerCase().includes(query) ||
        household.subdivision?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case "lastName":
          compareA = a.head_last_name.toLowerCase();
          compareB = b.head_last_name.toLowerCase();
          break;
        case "firstName":
          compareA = a.head_first_name.toLowerCase();
          compareB = b.head_first_name.toLowerCase();
          break;
        case "address":
          compareA = `${a.house_unit_no} ${a.street_name} ${a.subdivision}`.toLowerCase();
          compareB = `${b.house_unit_no} ${b.street_name} ${b.subdivision}`.toLowerCase();
          break;
        case "members":
          compareA = a.members?.length || 0;
          compareB = b.members?.length || 0;
          break;
        default: // "id"
          compareA = a.id;
          compareB = b.id;
      }

      return sortOrder === "asc"
        ? compareA > compareB ? 1 : -1
        : compareA < compareB ? 1 : -1;
    });

    return filtered;
  }, [rbiRequests.records, searchQuery, sortBy, sortOrder]);

  // Add zoom control handlers
  const handleZoom = (action) => {
    switch (action) {
      case "in":
        setZoomLevel(prev => Math.min(prev + 10, 150));
        break;
      case "out":
        setZoomLevel(prev => Math.max(prev - 10, 50));
        break;
      case "reset":
        setZoomLevel(100);
        break;
      default:
        break;
    }
  };

  if (loading) return <div className="loading">Loading approved registrations...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const filteredRecords = filterRecords();

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
  const relationships = {
    1: "Mother",
    2: "Father",
    3: "Son",
    4: "Daughter",
    5: "Brother",
    6: "Sister",
    7: "Grandmother",
    8: "Grandfather",
    9: relationshipOther || "Others"
  };
  return relationships[relationshipId] || "Unknown";
};

  return (
    <div className="request-manager">
      <h1>Verified RBI List</h1>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-and-filters">
          <input
            type="text"
            placeholder="Search by name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="id">Sort by: ID</option>
            <option value="lastName">Sort by: Last Name</option>
            <option value="firstName">Sort by: First Name</option>
            <option value="address">Sort by: Address</option>
            <option value="members">Sort by: Number of Members</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-order-select"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <div className="zoom-controls">
            <button className="zoom-btn" onClick={() => handleZoom("out")} title="Zoom Out">
              <i className="fas fa-search-minus"></i>
            </button>
            <span className="zoom-level">{zoomLevel}%</span>
            <button className="zoom-btn" onClick={() => handleZoom("in")} title="Zoom In">
              <i className="fas fa-search-plus"></i>
            </button>
            <button className="zoom-btn" onClick={() => handleZoom("reset")} title="Reset Zoom">
              <i className="fas fa-redo-alt"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="action-buttons">
        <button
          className="add-btn"
          onClick={() => setIsAddHouseholdModalOpen(true)}
        >
          <i className="fas fa-plus"></i> Add Household
        </button>
        <button
          className="retrieve-btn"
          onClick={() => setIsBackupModalOpen(true)}
        >
          <i className="fas fa-undo"></i> Retrieve Data
        </button>
      </div>

      {/* Bulk actions bar */}
      {(selectedItems.households.length > 0 || selectedItems.members.length > 0) && (
        <div className="bulk-actions">
          <button
            className="bulk-edit-btn"
            onClick={handleEditSelected}
          >
            <i className="fas fa-edit"></i> Edit Selected
          </button>
          {selectedItems.households.length === 1 && selectedItems.members.length === 0 && (
            <button
              className="bulk-add-member-btn"
              onClick={() => {
                setSelectedHouseholdId(selectedItems.households[0]);
                setIsAddMemberModalOpen(true);
              }}
            >
              <i className="fas fa-user-plus"></i> Add Member
            </button>
          )}
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

      <div
        className="table-container"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top left',
          width: zoomLevel < 100 ? `${100 / (zoomLevel / 100)}%` : '100%',
          height: zoomLevel < 100 ? `${100 / (zoomLevel / 100)}%` : '100%',
        }}
      >
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedItems.households.length === filteredRecords.length && filteredRecords.length > 0}
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
            {filteredRecords.map((household) => (
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
                  <td onClick={() => toggleHousehold(household.id)}>
                    {getSuffixLabel(household.head_suffix_id || household.head_suffix)}
                  </td>
                  <td onClick={() => toggleHousehold(household.id)}>
                    {getSexDisplay(household.sex, household.sex_other)}
                  </td>
                  <td onClick={() => toggleHousehold(household.id)}>{new Date(household.birth_date).toLocaleDateString()}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.birth_place}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{household.civil_status}</td>
                  <td onClick={() => toggleHousehold(household.id)}>{getCitizenshipDisplay(household.citizenship, household.citizenship_other)}</td>
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
                      <td>{getSuffixDisplay(member.suffix_id)}</td>
                      <td>{getSexDisplay(member.sex, member.sex_other)}</td>
                      <td>{new Date(member.birth_date).toLocaleDateString()}</td>
                      <td>{member.birth_place}</td>
                      <td>{member.civil_status}</td>
                      <td>{member.citizenship}</td>
                      <td>{member.occupation}</td>
                      <td>
                              {getRelationshipDisplay(
                                member.relationship_id, 
                                member.relationship_other
                              )}
                            </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <BackupVerifiedRBIModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onRestore={handleRestore}
      />

      <EditRBIModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        item={currentEditItem}
        type={editType}
        onSave={handleSaveEdit}
      />

      <AddHouseholdModal
        isOpen={isAddHouseholdModalOpen}
        onClose={() => setIsAddHouseholdModalOpen(false)}
        onSave={handleAddHousehold}
      />
      <AddHouseholdMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSave={handleAddHouseholdMember}
        householdId={selectedHouseholdId}
      />
    </div>
  );
}

export default Verified_RBI_List;