import React, { useState, useEffect } from "react";

function AddHouseholdMemberModal({ isOpen, onClose, onSave, householdId }) {
  const [memberData, setMemberData] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    suffix: "",
    birth_place: "",
    birth_date: "",
    sex: "",
    civil_status: "",
    citizenship: "",
    citizenship_other: "",
    occupation: "",
    relationship_id: "",
    relationship_other: ""
  });
  // Occupation options
  const occupationOptions = [
    "Employed",
    "Unemployed",
    "Student",
    "Retired",
    "Self-employed",
    "Homemaker",
    "Unable to Work"
  ];

  // Suffix options
  const suffixOptions = [
    { value: "", label: "None" },
    { value: "Jr.", label: "Jr." },
    { value: "Sr.", label: "Sr." },
    { value: "II", label: "II" },
    { value: "III", label: "III" },
    { value: "IV", label: "IV" },
    { value: "V", label: "V" }
  ];

  // Sex options
  const sexOptions = [
    { value: "", label: "Select Sex" },
    { value: "1", label: "Male" },
    { value: "2", label: "Female" },
    { value: "3", label: "Prefer Not To Say" },
    { value: "4", label: "Other" }
  ];

  const nameFields = ["last_name", "first_name", "middle_name"];

  const relationshipOptions = [
    { id: 1, name: "Mother" },
    { id: 2, name: "Father" },
    { id: 3, name: "Son" },
    { id: 4, name: "Daughter" },
    { id: 5, name: "Brother" },
    { id: 6, name: "Sister" },
    { id: 7, name: "Grandmother" },
    { id: 8, name: "Grandfather" },
    { id: 9, name: "Others" }
  ];


  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (nameFields.includes(name)) {
      newValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
    
    setMemberData(prev => ({
      ...prev,
      [name]: newValue,
      // Clear relationship_other if not "Others"
      ...(name === "relationship_id" && value !== "9" && { relationship_other: "" })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare the data to be saved
    // Remove empty/undefined fields and map suffix/sex for backend
    const suffixMap = {
      "": null,
      "Jr.": 2,
      "Sr.": 3,
      "I": 4,
      "II": 5,
      "III": 6,
      "IV": 7,
      "V": 8
    };
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

    // Validate required fields
    const requiredFields = ['last_name', 'first_name', 'birth_date', 'sex', 'relationship_id'];
    const missingFields = requiredFields.filter(field => !memberData[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    const dataToSave = {
      ...memberData,
      citizenship: memberData.citizenship === "Other"
        ? memberData.citizenship_other
        : memberData.citizenship,
      suffix_id:
        memberData.suffix && suffixMap[memberData.suffix] !== null && suffixMap[memberData.suffix] !== undefined
          ? parseInt(suffixMap[memberData.suffix], 10)
          : null,
      sex: sexMap[memberData.sex] !== undefined ? Number(sexMap[memberData.sex]) : memberData.sex,
      occupation: memberData.occupation || null,
      relationship_id: memberData.relationship_id,
      ...(memberData.relationship_id === "9" && memberData.relationship_other && {
        relationship_other: memberData.relationship_other
      })
    };

    delete dataToSave.suffix;
    if (dataToSave.citizenship !== "Other") {
      delete dataToSave.citizenship_other;
    }
    if (dataToSave.relationship_id !== "9") {
      delete dataToSave.relationship_other;
    }
    // Remove empty string fields
    Object.keys(dataToSave).forEach(
      key => (dataToSave[key] === "" || dataToSave[key] === undefined) && delete dataToSave[key]
    );
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
            <select
              name="suffix"
              value={memberData.suffix}
              onChange={handleChange}
            >
              {suffixOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
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
              {sexOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {memberData.sex === "4" && (
              <input
                type="text"
                name="sex_other"
                placeholder="Please specify sex"
                value={memberData.sex_other || ""}
                onChange={handleChange}
                required
                style={{ marginTop: '8px' }}
              />
            )}
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
            <select
              name="occupation"
              value={memberData.occupation}
              onChange={handleChange}
              required
            >
              <option value="">Select Occupation</option>
              {occupationOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
          <label>Relationship to Household Head:</label>
          <select
            name="relationship_id"
            value={memberData.relationship_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Relationship</option>
            {relationshipOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
          {memberData.relationship_id === "9" && (
            <input
              type="text"
              name="relationship_other"
              placeholder="Specify relationship"
              value={memberData.relationship_other}
              onChange={handleChange}
              required={memberData.relationship_id === "9"}
              style={{ marginTop: '8px' }}
            />
          )}
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