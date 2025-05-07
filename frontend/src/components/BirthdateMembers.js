import React, { useEffect, useRef } from "react";
import Flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "../styles/flatpickr.css";

// This component doesn't use forwardRef since we're creating the ref internally
const BirthdateMembers = ({ selectedDate, onChange, index }) => {
    // Create a ref for this specific instance
    const inputRef = useRef(null);
    
    // Track if Flatpickr has been initialized
    const flatpickrInstanceRef = useRef(null);

    useEffect(() => {
        // Only initialize Flatpickr once when the component mounts
        if (inputRef.current && !flatpickrInstanceRef.current) {
            flatpickrInstanceRef.current = new Flatpickr(inputRef.current, {
                dateFormat: "Y-m-d",
                allowInput: true,
                defaultDate: selectedDate || null,
                onChange: (selectedDates) => {
                    if (selectedDates.length > 0) {
                        const newDate = selectedDates[0].toISOString().split("T")[0];
                        if (onChange) onChange(newDate);
                    } else {
                        if (onChange) onChange("");
                    }
                },
            });
        }
        
        // Clean up Flatpickr instance when component unmounts
        return () => {
            if (flatpickrInstanceRef.current) {
                flatpickrInstanceRef.current.destroy();
            }
        };
    }, []);  // Empty dependency array - run only on mount and unmount

    // Update the Flatpickr instance when selectedDate prop changes
    useEffect(() => {
        if (flatpickrInstanceRef.current && selectedDate) {
            flatpickrInstanceRef.current.setDate(selectedDate, false);
        }
    }, [selectedDate]);

    return (
        <input
            ref={inputRef}
            type="text"
            placeholder="Select Date"
            readOnly // Let Flatpickr handle input
            className="date-input"
            id={`member-birthdate-${index}`}
        />
    );
};

export default BirthdateMembers;