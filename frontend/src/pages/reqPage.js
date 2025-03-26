import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import RequestTitlesandSteps from "../components/RequestTitlesandSteps";
import RequestForm from "../components/RequestForm";
import "../styles/reqPage.css";

function reqPage() {
    const [formData, setFormData] = useState({
        last_name: "",
        first_name: "",
        middle_name: "",
        suffix: "",
        sex: "",
        birthday: "",
        contact_no: "",
        email: "",
        address: "",
        type_of_certificate: "",
        purpose_of_request: "",
        number_of_copies: "",
    });

    const [errors, setErrors] = useState({ contact_no: false, email: false });

    const handleChange = (e) => {
        let { name, value } = e.target
        if (["last_name", "first_name", "middle_name", "suffix"].includes(name)) {
            value = value
                .toLowerCase() // Convert to lowercase first
                .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
               
        }
        setFormData({ ...formData, [name]: value });
    };

    var birthdateRef = useRef(null);

    const getReq = () => {
        if (Object.values(formData).some(value => value.trim() === "")) {
            alert("Please fill in all the required fields in the request form.");
            return;
        }
    
        if (!document.getElementById("terms").checked) {
            alert("Please verify with our terms by clicking the checkbox.");
            return;
        }
    
        const isPhoneValid = (/^0\d{10}$/.test(formData.contact_no) || /^[1-9]\d{9}$/.test(formData.contact_no));
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    
        if (!isPhoneValid || !isEmailValid) {
            alert("Please provide a valid phone number and email.");
            return;
        }
    
        const requestData = {
            ...formData,
            number_of_copies: Number(formData.number_of_copies)
        };
    
        axios.post("http://localhost:5000/requests", requestData, {
            headers: { "Content-Type": "application/json" },
            timeout: 5000
        })
        .then(response => {
            alert("✅ Request successfully submitted!");
        })
        .catch(error => {
            console.error("❌ Error details:", {
                message: error.message,
                code: error.code,
                config: error.config
            });
    
            if (error.code === "ECONNREFUSED") {
                alert("Could not connect to server. Please ensure the backend is running.");
            } else if (error.code === "ERR_NETWORK") {
                alert("Network error. Please check your internet connection.");
            } else {
                alert(`Error: ${error.message}`);
            }
        });
    };
    const validatorNum = () => {
        const isValid = (/^0\d{10}$/.test(formData.contact_no) || /^[1-9]\d{9}$/.test(formData.contact_no));
        console.log('Phone validation:', isValid);
        setErrors(prev => ({ ...prev, contact_no: !isValid }));
    };
    
    const validatorEmail = () => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        console.log('Email validation:', isValid); 
        setErrors(prev => ({ ...prev, email: !isValid }));
    };
    return (
        <div className="req">
            <div className="allofelements">
                <RequestTitlesandSteps />
                <RequestForm {...{ formData, errors, handleChange, getReq, validatorNum, validatorEmail, setFormData }} />;
            </div>
        </div>
    );
}

export default reqPage;