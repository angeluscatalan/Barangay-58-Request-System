import React, { useEffect, useRef } from "react";
import Flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "flatpickr/dist/flatpickr.min.css"; 
import "../styles/flatpickr.css"; 

const BirthdatePicker = () => {
    const dateRef = useRef(null);

    useEffect(() => {
        Flatpickr(dateRef.current, {
            dateFormat: "Y-m-d",
            allowInput: true
        });
    }, []);

    return <input type="text" ref={dateRef} placeholder="Birthday" className="reqFormDate" />;
};

export default BirthdatePicker;
