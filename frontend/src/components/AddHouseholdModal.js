// AddHouseholdModal.js
import React, { useState } from 'react';

function AddHouseholdModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    head_last_name: '',
    head_first_name: '',
    head_middle_name: '',
    head_suffix: '',
    house_unit_no: '',
    street_name: '',
    subdivision: '',
    birth_place: '',
    birth_date: '',
    sex: '',
    civil_status: '',
    citizenship: '',
    citizenship_other: '',
    occupation: '',
    email_address: '',
    members: []
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Capitalize first letter for name fields
    const nameFields = [
      "head_last_name",
      "head_first_name",
      "head_middle_name"
    ];
    let newValue = value;
    if (nameFields.includes(name)) {
      newValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prepare the data to be saved
    const dataToSave = {
      ...formData,
      citizenship: formData.citizenship === "Other"
        ? formData.citizenship_other
        : formData.citizenship,
      head_suffix: formData.head_suffix,
      sex: formData.sex,
      occupation: formData.occupation
    };
    onSave(dataToSave);
  };


  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add New Household</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Last Name*</label>
              <input
                type="text"
                name="head_last_name"
                value={formData.head_last_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>First Name*</label>
              <input
                type="text"
                name="head_first_name"
                value={formData.head_first_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Middle Name*</label>
              <input
                type="text"
                name="head_middle_name"
                value={formData.head_middle_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Suffix</label>
              <select
                name="head_suffix"
                value={formData.head_suffix}
                onChange={handleChange}
              >
                {suffixOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Birth Date*</label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Sex*</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required
              >
                {sexOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {formData.sex === "4" && (
                <input
                  type="text"
                  name="sex_other"
                  placeholder="Please specify sex"
                  value={formData.sex_other || ""}
                  onChange={handleChange}
                  required
                  style={{ marginTop: '8px' }}
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Birth Place*</label>
            <input
              type="text"
              name="birth_place"
              value={formData.birth_place}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Civil Status*</label>
              <select
                name="civil_status"
                value={formData.civil_status}
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
              <label>Citizenship*</label>
              <select
                name="citizenship"
                value={formData.citizenship}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                <option value="Filipino">Filipino</option>
                <option value="Other">Other</option>
              </select>
              {formData.citizenship === "Other" && (
                <input
                  type="text"
                  name="citizenship_other"
                  placeholder="Please specify citizenship"
                  value={formData.citizenship_other}
                  onChange={handleChange}
                  required={formData.citizenship === "Other"}
                  style={{ marginTop: '8px' }}
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Occupation*</label>
            <select
              name="occupation"
              value={formData.occupation}
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
            <label>Email Address*</label>
            <input
              type="email"
              name="email_address"
              value={formData.email_address}
              onChange={handleChange}
              required
            />
          </div>

          <h4>Address Information</h4>
          <div className="form-row">
            <div className="form-group">
              <label>House/Unit No.*</label>
              <input
                type="text"
                name="house_unit_no"
                value={formData.house_unit_no}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Street Name*</label>
              <input
                type="text"
                name="street_name"
                value={formData.street_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Subdivision/Sitio/Purok*</label>
            <input
              type="text"
              name="subdivision"
              value={formData.subdivision}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Add Household
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddHouseholdModal;