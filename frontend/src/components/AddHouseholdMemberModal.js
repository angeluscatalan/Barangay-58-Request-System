import React, { useState } from "react";

function AddHouseholdMemberModal({ isOpen, onClose, onSave, householdId }) {
  const [memberData, setMemberData] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    suffix: "", // Initialize as empty string
    birth_place: "",
    birth_date: "",
    sex: "",
    civil_status: "",
    citizenship: "",
    citizenship_other: "",
    occupation: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMemberData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prepare the data to be saved
    const dataToSave = {
      ...memberData,
      // If "Other" is selected, use the citizenship_other value
      citizenship: memberData.citizenship === "Other" 
        ? memberData.citizenship_other 
        : memberData.citizenship
    };
    onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add Household Member</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="last_name"
              value={memberData.last_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="first_name"
              value={memberData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Middle Name:</label>
            <input
              type="text"
              name="middle_name"
              value={memberData.middle_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Suffix:</label>
            {/* Changed from input to select */}
            <select
              name="suffix"
              value={memberData.suffix}
              onChange={handleChange}
            >
              <option value="">None</option> {/* Option for no suffix */}
              <option value="Jr.">Jr.</option>
              <option value="Sr.">Sr.</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
              <option value="V">V</option>
            </select>
          </div>
          <div className="form-group">
            <label>Birth Place:</label>
            <input
              type="text"
              name="birth_place"
              value={memberData.birth_place}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Birth Date:</label>
            <input
              type="date"
              name="birth_date"
              value={memberData.birth_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Sex:</label>
            <select
              name="sex"
              value={memberData.sex}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>Civil Status:</label>
            <select
              name="civil_status"
              value={memberData.civil_status}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
              <option value="Divorced">Divorced</option>
            </select>
          </div>
          <div className="form-group">
            <label>Citizenship:</label>
            <select
              name="citizenship"
              value={memberData.citizenship}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Filipino">Filipino</option>
              <option value="Other">Other</option>
            </select>
            {memberData.citizenship === "Other" && (
              <input
                type="text"
                name="citizenship_other"
                placeholder="Please specify citizenship"
                value={memberData.citizenship_other}
                onChange={handleChange}
                required={memberData.citizenship === "Other"}
                style={{ marginTop: '8px' }}
              />
            )}
          </div>
          <div className="form-group">
            <label>Occupation:</label>
            <input
              type="text"
              name="occupation"
              value={memberData.occupation}
              onChange={handleChange}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddHouseholdMemberModal;