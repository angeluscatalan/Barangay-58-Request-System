"use client"

import { useState, useEffect } from "react" 
import axios from "axios"
import RequestTitlesandSteps from "../components/RequestTitlesandSteps"
import RequestForm from "../components/RequestForm"
import ConfirmationModal from "../components/ConfirmationModal"
import "../styles/reqPage.css"
import Footer from "../components/Footer"
import ValidationErrorPopup from "../components/ValidationErrorPopup"
import SuccessPopup from "../components/SuccessPopup"

function reqPage() {
  // Form state
  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    suffix_id: null,
    sex: "",
    sex_other: "",
    birthday: "",
    contact_no: "",
    country_code: "+63",
    email: "",
    unit_no: "",
    street: "",
    subdivision: "",
    certificate_id: null,
    purpose_of_request: "",
    number_of_copies: "",
  })

  // UI state
  const [errors, setErrors] = useState({})
  const [activeSection, setActiveSection] = useState("info") // "info" or "form"
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showValidationError, setShowValidationError] = useState(false)
  const [missingFields, setMissingFields] = useState([])
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [suffixes, setSuffixes] = useState([]);
  const [certificates, setCertificates] = useState([]);
  
  useEffect(() => {
  const fetchCertificates = async () => {
    try {
      const response = await axios.get('https://barangay-58-request-system-n07q.onrender.com/api/requests/certificates');
      setCertificates(response.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };
  fetchCertificates();
}, []);

useEffect(() => {
  const fetchSuffixes = async () => {
  try {
    const response = await axios.get('https://barangay-58-request-system-n07q.onrender.com/api/requests/suffixes', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log("Suffixes response:", response.data); // Debug log
    setSuffixes(response.data);
  } catch (error) {
    console.error("Error fetching suffixes:", error);
  }
};
  fetchSuffixes();
}, []);

  // Handle form field changes
  const handleChange = (e) => {
  let { name, value } = e.target;

  // Auto-capitalize names
  if (["last_name", "first_name", "middle_name","unit_no","street","subdivision"].includes(name)) {
    value = value.charAt(0).toUpperCase() + value.slice(1);
  }

  // Clear sex_other if not "Other" is selected
  if (name === "sex" && value !== "4") {
    setFormData(prev => ({ ...prev, [name]: value, sex_other: "" }));
  } else {
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // Clear error for this field
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: false }));
  }
};

   const getSuffixName = (id) => {
  if (!suffixes.length) return 'Loading...'; // or 'None'

  // Convert the ID to a number
  const numericId = Number(id); // <--- Add this line

  if (!numericId || numericId === 1) return 'None'; // Use numericId here

  const suffix = suffixes.find(s => s.id === numericId); // <--- Use numericId here
  return suffix ? suffix.name : 'None';
};

  // Validate the entire form
  const validateForm = () => {
    const newErrors = {}
    let formValid = true
    const missingFieldsList = []

    // Define required fields with display names
    const requiredFields = [
      { key: "last_name", display: "Last Name" },
      { key: "first_name", display: "First Name" },
      { key: "middle_name", display: "Middle Name" },
      { key: "unit_no", display: "House/Unit No." },
      { key: "street", display: "Street Name" },
      { key: "birthday", display: "Birthday" },
      { key: "subdivision", display: "Subdivision/Sitio/Purok" },
      { key: "contact_no", display: "Contact Number" },
      { key: "email", display: "Email Address" },
      { key: "number_of_copies", display: "Number of Copies" },
      { key: "certificate_id", display: "Type of Certificate" },
    ]

    // Check for empty required fields
    requiredFields.forEach((field) => {
      if (!formData[field.key] || formData[field.key].trim() === "") {
        newErrors[field.key] = true
        formValid = false
        missingFieldsList.push(field.display)
      }
    })

    // Validate phone number format
    if (formData.contact_no && !/^(0\d{10}|[1-9]\d{9})$/.test(formData.contact_no)) {
      newErrors.contact_no = true
      formValid = false
      if (!missingFieldsList.includes("Contact Number")) {
        missingFieldsList.push("Contact Number (Invalid format)")
      }
    }

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = true
      formValid = false
      if (!missingFieldsList.includes("Email Address")) {
        missingFieldsList.push("Email Address (Invalid format)")
      }
    }

    // Validate number of copies
    const numberOfCopies = formData.number_of_copies
    if (numberOfCopies && (isNaN(numberOfCopies) || numberOfCopies <= 0)) {
      newErrors.number_of_copies = true
      formValid = false
      if (!missingFieldsList.includes("Number of Copies")) {
        missingFieldsList.push("Number of Copies (Must be greater than 0)")
      }
    }

    if (!formData.sex) {
    newErrors.sex = true;
    formValid = false;
    missingFieldsList.push("Sex");
  }

   if (formData.sex === "4" && (!formData.sex_other || formData.sex_other.trim() === "")) {
    newErrors.sex_other = true;
    formValid = false;
    missingFieldsList.push("Gender specification");
  }

    // Update state with errors
    setErrors(newErrors)
    setMissingFields(missingFieldsList)

    return formValid
  }

  // Handle form submission
  const getReq = () => {
    // Validate form
    const isValid = validateForm()

    if (!isValid) {
      // Show validation error popup instead of alert
      setShowValidationError(true)
      return
    }

    // Check terms checkbox
    const termsCheckbox = document.getElementById("terms")
    if (!termsCheckbox || !termsCheckbox.checked) {
      setMissingFields(["Agreement to terms and conditions"])
      setShowValidationError(true)
      return
    }
    // If all validations pass, show confirmation modal
    setShowConfirmation(true)
  }

  // Handle final submission after confirmation
const handleConfirmSubmit = async (imagePreviewFromModal) => {
  try {
    let s3Key = null;
    let photoUrl = null;

    // Find the selected certificate object
    const selectedCertificate = certificates.find(
      c => String(c.id) === String(formData.certificate_id)
    );

    // Use the certificate name to determine if photo is required
    const requiresPhoto = selectedCertificate &&
      (selectedCertificate.name === "Barangay Clearance" ||
       selectedCertificate.name === "Barangay ID");

    if (requiresPhoto && imagePreviewFromModal) {
      const blob = await fetch(imagePreviewFromModal).then(res => res.blob());
      const imageFormData = new FormData();
      imageFormData.append('image', blob, `${formData.last_name}_${Date.now()}.jpg`);

      const uploadResponse = await axios.post(
        'https://barangay-58-request-system-n07q.onrender.com/api/images/upload',
        imageFormData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      s3Key = uploadResponse.data.s3Key;
      photoUrl = uploadResponse.data.imageUrl;
    }

    // Prepare the request data with both s3_key and photo_url
    const requestData = {
      ...formData,
      s3_key: s3Key,
      photo_url: photoUrl,
      address: [
        formData.unit_no,
        formData.street,
        formData.subdivision
      ].filter(Boolean).join(", "),
      number_of_copies: Number(formData.number_of_copies),
      suffix_id: formData.suffix_id || null // Ensure this is included and defaults to null if undefined
    };

    // Create the request
    await axios.post('https://barangay-58-request-system-n07q.onrender.com/api/requests', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    setShowConfirmation(false);
    setShowSuccessPopup(true);
    
    // Reset form
    setFormData({
      last_name: "",
      first_name: "",
      middle_name: "",
      suffix_id: null,
      sex: "",
      birthday: "",
      contact_no: "",
      country_code: "+63",
      email: "",
      unit_no: "",
      street: "",
      subdivision: "",
      certificate_id: null,
      purpose_of_request: "",
      number_of_copies: "",
    });

    // Reset terms checkbox
    const termsCheckbox = document.getElementById("terms");
    if (termsCheckbox) termsCheckbox.checked = false;

    setErrors({});

  } catch (error) {
    setShowConfirmation(false);
    console.error("Submission error:", error);
    
    let errorMessage = "An error occurred while submitting your request.";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    alert(errorMessage);
  }
};

  // Field-specific validators
  const validatorNum = () => {
    const isValid = /^(0\d{10}|[1-9]\d{9})$/.test(formData.contact_no)
    setErrors((prev) => ({ ...prev, contact_no: !isValid }))
  }

  const validatorEmail = () => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    setErrors((prev) => ({ ...prev, email: !isValid }))
  }

  // For mobile view navigation
  const toggleSection = (section) => {
    setActiveSection(section)
  }

  return (
    <div className="req">
      {/* Mobile navigation tabs */}
      <div className="mobile-tabs">
        <button
          className={`tab-button ${activeSection === "info" ? "active" : ""}`}
          onClick={() => toggleSection("info")}
        >
          Information
        </button>
        <button
          className={`tab-button ${activeSection === "form" ? "active" : ""}`}
          onClick={() => toggleSection("form")}
        >
          Request Form
        </button>
      </div>

      <div className="req-container">
        {/* Information section */}
        <div className={`req-info ${activeSection === "info" ? "active" : ""}`}>
          <RequestTitlesandSteps />
          <button
            type="button"
            className="mobile-next-button add-request-btn"
            onClick={() => toggleSection("form")}
          >
            Continue to Form
          </button>
        </div>

        {/* Form section */}
        <div className={`req-form ${activeSection === "form" ? "active" : ""}`}>
          <RequestForm
  formData={formData}
  errors={errors}
  handleChange={handleChange}
  getReq={getReq}
  validatorNum={validatorNum}
  validatorEmail={validatorEmail}
  setFormData={setFormData}
  toggleSection={toggleSection}
  suffixes={suffixes}
  certificates={certificates} // ✅ Add this line
/>
        </div>
      </div>

      {/* Confirmation Modal - only shown when all validations pass */}
      <ConfirmationModal
  isOpen={showConfirmation}
  onClose={() => setShowConfirmation(false)}
  onConfirm={handleConfirmSubmit}
  formData={{
    ...formData,
    suffix: getSuffixName(formData.suffix_id),
    certificate: certificates.find(c => String(c.id) === String(formData.certificate_id)) // Pass the full certificate object
  }}
  formType="request"
  imagePreview={imagePreview}
  setImagePreview={setImagePreview}
  certificates={certificates}
/>

      {/* Validation Error Popup */}
      <ValidationErrorPopup
        isOpen={showValidationError}
        onClose={() => setShowValidationError(false)}
        missingFields={missingFields}
      />

      {/* Success Popup */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        message="Your certificate request has been successfully submitted! You will be notified when it's ready for pickup."
      />

      <Footer />
    </div>
  )
}

export default reqPage