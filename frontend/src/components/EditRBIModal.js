// EditRBIModal.js
import React, { useState, useEffect } from 'react';

const suffixOptions = [
  { value: "1", label: "None" },
  { value: "2", label: "Jr." },
  { value: "3", label: "Sr." },
  { value: "4", label: "I" },
  { value: "5", label: "II" },
  { value: "6", label: "III" },
  { value: "7", label: "IV" },
  { value: "8", label: "V" }
];

const sexOptions = [
  { value: "1", label: "Male" },
  { value: "2", label: "Female" },
  { value: "3", label: "Prefer Not To Say" },
  { value: "4", label: "Other" }
];

const occupationOptions = [
  "Employed",
  "Unemployed",
  "Student",
  "Retired",
  "Self-employed",
  "Homemaker",
  "Unable to Work"
];

const citizenshipOptions = [
  { value: "Filipino", label: "Filipino" },
  { value: "Other", label: "Other" }
];

const relationshipOptions = [
  { id: "1", name: "Mother" },
  { id: "2", name: "Father" },
  { id: "3", name: "Son" },
  { id: "4", name: "Daughter" },
  { id: "5", name: "Brother" },
  { id: "6", name: "Sister" },
  { id: "7", name: "Grandmother" },
  { id: "8", name: "Grandfather" },
  { id: "9", name: "Others" }
];

// Helper to get suffix label by value
export const getSuffixLabel = (value) => {
  const found = suffixOptions.find(opt => String(opt.value) === String(value));
  return found ? found.label : "";
};

function EditRBIModal({ isOpen, onClose, item, type, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (item && item.birth_date) {
      const rawDate = new Date(item.birth_date);
      const year = rawDate.getFullYear();
      const month = String(rawDate.getMonth() + 1).padStart(2, '0');
      const day = String(rawDate.getDate()).padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;

      setFormData(type === 'household' ? {
        head_last_name: item.head_last_name,
        head_first_name: item.head_first_name,
        head_middle_name: item.head_middle_name,
        // Always use suffix_id if present, fallback to head_suffix string, fallback to "1"
        head_suffix: item.head_suffix_id
          ? String(item.head_suffix_id)
          : (suffixOptions.find(opt => opt.label === item.head_suffix)?.value || "1"),
        house_unit_no: item.house_unit_no,
        street_name: item.street_name,
        subdivision: item.subdivision,
        birth_place: item.birth_place,
        birth_date: localDateString,
        sex: item.sex ? String(item.sex) : "",
        sex_other: item.sex_other || "",
        civil_status: item.civil_status,
        citizenship: item.citizenship === "Filipino" || item.citizenship === "Other"
          ? item.citizenship
          : "Other",
        citizenship_other: item.citizenship === "Other"
          ? (item.citizenship_other || item.citizenship_other === "" ? item.citizenship_other : (item.citizenship !== "Filipino" ? item.citizenship : ""))
          : (item.citizenship !== "Filipino" && item.citizenship !== "Other" ? item.citizenship : ""),
        occupation: item.occupation || "",
        email_address: item.email_address,
         relationship_id: item.relationship_id ? String(item.relationship_id) : "",
  relationship_other: item.relationship_other || ""
      } : {
        last_name: item.last_name,
        first_name: item.first_name,
        middle_name: item.middle_name,
        suffix: item.suffix_id
          ? String(item.suffix_id)
          : (suffixOptions.find(opt => opt.label === item.suffix)?.value || "1"),
        birth_place: item.birth_place,
        birth_date: localDateString,
        sex: item.sex ? String(item.sex) : "",
        sex_other: item.sex_other || "",
        civil_status: item.civil_status,
        citizenship: item.citizenship === "Filipino" || item.citizenship === "Other"
          ? item.citizenship
          : "Other",
        citizenship_other: item.citizenship === "Other"
          ? (item.citizenship_other || item.citizenship_other === "" ? item.citizenship_other : (item.citizenship !== "Filipino" ? item.citizenship : ""))
          : (item.citizenship !== "Filipino" && item.citizenship !== "Other" ? item.citizenship : ""),
        occupation: item.occupation || "",
        relationship_id: item.relationship_id ? String(item.relationship_id) : (
          item.relationship_other && item.relationship_other.trim() !== ""
            ? "9"
            : ""
        ),
        relationship_other: item.relationship_id === 9 || item.relationship_id === "9"
          ? item.relationship_other || ""
          : (item.relationship_other && item.relationship_other.trim() !== "" ? item.relationship_other : "")
      });
    } else if (item) {
      setFormData(type === 'household' ? {
        head_last_name: item.head_last_name,
        head_first_name: item.head_first_name,
        head_middle_name: item.head_middle_name,
        head_suffix: "1",
        house_unit_no: item.house_unit_no,
        street_name: item.street_name,
        subdivision: item.subdivision,
        birth_place: item.birth_place,
        birth_date: '',
        sex: "",
        sex_other: "",
        civil_status: item.civil_status,
        citizenship: "Filipino",
        citizenship_other: "",
        occupation: item.occupation || "",
        email_address: item.email_address
      } : {
        last_name: item.last_name,
        first_name: item.first_name,
        middle_name: item.middle_name,
        suffix: "1",
        birth_place: item.birth_place,
        birth_date: '',
        sex: "",
        sex_other: "",
        civil_status: item.civil_status,
        citizenship: "Filipino",
        citizenship_other: "",
        occupation: item.occupation || "",
        relationship_id: "",
        relationship_other: ""
      });
    } else {
      setFormData({}); // Reset form data if item is not present
    }
  }, [item, type]);

  const handleChange = (e) => {
  const { name, value } = e.target;
  
  // Special handling for citizenship
  if (name === 'citizenship') {
    setFormData(prev => ({
      ...prev,
      citizenship: value,
      // Clear citizenship_other if not "Other"
      citizenship_other: value === "Other" ? prev.citizenship_other : ""
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit {type === 'household' ? 'Household' : 'Household Member'}</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name={type === 'household' ? 'head_last_name' : 'last_name'}
              value={formData[type === 'household' ? 'head_last_name' : 'last_name'] || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name={type === 'household' ? 'head_first_name' : 'first_name'}
              value={formData[type === 'household' ? 'head_first_name' : 'first_name'] || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Middle Name</label>
            <input
              type="text"
              name={type === 'household' ? 'head_middle_name' : 'middle_name'}
              value={formData[type === 'household' ? 'head_middle_name' : 'middle_name'] || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Suffix</label>
            <select
              name={type === 'household' ? 'head_suffix' : 'suffix'}
              value={formData[type === 'household' ? 'head_suffix' : 'suffix'] || "1"}
              onChange={handleChange}
            >
              {suffixOptions.map((suffix) => (
                <option key={suffix.value} value={suffix.value}>{suffix.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Birth Place</label>
            <input
              type="text"
              name="birth_place"
              value={formData.birth_place || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Birth Date</label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Sex</label>
            <select
              name="sex"
              value={formData.sex || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Sex</option>
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
              />
            )}
          </div>

          <div className="form-group">
            <label>Civil Status</label>
            <select
              name="civil_status"
              value={formData.civil_status || ''}
              onChange={handleChange}
              required
            >
              <option value="">Select Civil Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
              <option value="Divorced">Divorced</option>
            </select>
          </div>

          <div className="form-group">
  <label>Citizenship</label>
  <select
    name="citizenship"
    value={formData.citizenship || "Filipino"}
    onChange={handleChange}
    required
  >
    <option value="Filipino">Filipino</option>
    <option value="Other">Other (specify below)</option>
  </select>
  {formData.citizenship === "Other" && (
    <input
      type="text"
      name="citizenship_other"
      placeholder="Enter citizenship"
      value={formData.citizenship_other || ""}
      onChange={handleChange}
      required
    />
  )}
</div>

          <div className="form-group">
            <label>Occupation</label>
            <select
              name="occupation"
              value={formData.occupation || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Occupation</option>
              {occupationOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {type === 'household' && (
            <>
              <div className="form-group">
                <label>House/Unit No.</label>
                <input
                  type="text"
                  name="house_unit_no"
                  value={formData.house_unit_no || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Street Name</label>
                <input
                  type="text"
                  name="street_name"
                  value={formData.street_name || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Subdivision/Sitio/Purok</label>
                <input
                  type="text"
                  name="subdivision"
                  value={formData.subdivision || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email_address"
                  value={formData.email_address || ''}
                  onChange={handleChange}
                />
              </div>
            </>
            
          )}

          {/* Add this block for member relationship */}
          {type === 'member' && (
            <div className="form-group">
              <label>Relationship to Household Head</label>
              <select
                name="relationship_id"
                value={formData.relationship_id || ""}
                onChange={handleChange}
                required
              >
                <option value="">Select Relationship</option>
                {relationshipOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
              {formData.relationship_id === "9" && (
                <input
                  type="text"
                  name="relationship_other"
                  placeholder="Specify relationship"
                  value={formData.relationship_other || ""}
                  onChange={handleChange}
                  required
                />
              )}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRBIModal;