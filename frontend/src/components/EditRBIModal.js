// EditRBIModal.js
import React, { useState, useEffect } from 'react';

const suffixOptions = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V']; // Add more if needed

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
        head_suffix: item.head_suffix || '',
        house_unit_no: item.house_unit_no,
        street_name: item.street_name,
        subdivision: item.subdivision,
        birth_place: item.birth_place,
        birth_date: localDateString,
        sex: item.sex,
        civil_status: item.civil_status,
        citizenship: item.citizenship,
        occupation: item.occupation,
        email_address: item.email_address
      } : {
        last_name: item.last_name,
        first_name: item.first_name,
        middle_name: item.middle_name,
        suffix: item.suffix || '',
        birth_place: item.birth_place,
        birth_date: localDateString,
        sex: item.sex,
        civil_status: item.civil_status,
        citizenship: item.citizenship,
        occupation: item.occupation
      });
    } else if (item) {
      setFormData(type === 'household' ? {
        head_last_name: item.head_last_name,
        head_first_name: item.head_first_name,
        head_middle_name: item.head_middle_name,
        head_suffix: '',
        house_unit_no: item.house_unit_no,
        street_name: item.street_name,
        subdivision: item.subdivision,
        birth_place: item.birth_place,
        birth_date: '',
        sex: item.sex,
        civil_status: item.civil_status,
        citizenship: item.citizenship,
        occupation: item.occupation,
        email_address: item.email_address
      } : {
        last_name: item.last_name,
        first_name: item.first_name,
        middle_name: item.middle_name,
        suffix: '',
        birth_place: item.birth_place,
        birth_date: '',
        sex: item.sex,
        civil_status: item.civil_status,
        citizenship: item.citizenship,
        occupation: item.occupation
      });
    } else {
      setFormData({}); // Reset form data if item is not present
    }
  }, [item, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
              value={formData[type === 'household' ? 'head_suffix' : 'suffix'] || ''}
              onChange={handleChange}
            >
              {suffixOptions.map((suffix) => (
                <option key={suffix} value={suffix}>{suffix || 'N/A'}</option>
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
              value={formData.sex || ''}
              onChange={handleChange}
              required
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
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
            <input
              type="text"
              name="citizenship"
              value={formData.citizenship || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation || ''}
              onChange={handleChange}
              required
            />
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