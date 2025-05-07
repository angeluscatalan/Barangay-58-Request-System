import React, { useEffect, useRef } from "react";
import Flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "../styles/flatpickr.css";

const BirthdateMembers = ({ selectedDate, onChange, index }) => {
    const inputRef = useRef(null);
    const flatpickrInstanceRef = useRef(null);

    useEffect(() => {
        // Initialize Flatpickr
        flatpickrInstanceRef.current = new Flatpickr(inputRef.current, {
            dateFormat: "Y-m-d",
            allowInput: true,
            defaultDate: selectedDate || null,
            onChange: (selectedDates) => {
                if (selectedDates.length > 0) {
                    const newDate = selectedDates[0];
                    onChange(newDate); // Pass Date object directly
                } else {
                    onChange(null);
                }
            },
        });

        return () => {
            flatpickrInstanceRef.current?.destroy();
        };
    }, []);

    // Update Flatpickr when selectedDate changes
    useEffect(() => {
        if (flatpickrInstanceRef.current) {
            // Only update if the date actually changed
            const currentDate = flatpickrInstanceRef.current.selectedDates[0];
            const newDate = selectedDate ? new Date(selectedDate) : null;
            
            if (
                (!currentDate && newDate) ||
                (currentDate && !newDate) ||
                (currentDate && newDate && currentDate.getTime() !== newDate.getTime())
            ) {
                flatpickrInstanceRef.current.setDate(newDate, false);
            }
        }
    }, [selectedDate]);

    return (
        <input
            ref={inputRef}
            type="text"
            placeholder="Select Date"
            readOnly
            className="date-input"
            data-testid={`member-birthdate-${index}`}
        />
    );
};

export default BirthdateMembers;