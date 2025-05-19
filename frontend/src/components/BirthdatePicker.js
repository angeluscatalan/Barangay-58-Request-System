import React, { useEffect, useState, forwardRef } from "react";
import Flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "../styles/flatpickr.css";

const BirthdatePicker = forwardRef(({ selectedDate, onChange }, ref) => {
    const [date, setDate] = useState(selectedDate || "");

    useEffect(() => {
        if (ref?.current) {
            new Flatpickr(ref.current, {
                dateFormat: "Y-m-d",
                allowInput: true,
                defaultDate: date,
                onChange: (selectedDates) => {
                    if (selectedDates[0]) {
                        // Format the date as YYYY-MM-DD without timezone conversion
                        const year = selectedDates[0].getFullYear();
                        const month = String(selectedDates[0].getMonth() + 1).padStart(2, '0');
                        const day = String(selectedDates[0].getDate()).padStart(2, '0');
                        const newDate = `${year}-${month}-${day}`;
                        setDate(newDate);
                        if (onChange) onChange(newDate);
                    }
                },
            });
        }
    }, [ref, date, onChange]);

    return (
        <input
            ref={ref}
            type="text"
            value={date}
            onChange={(e) => {
                setDate(e.target.value);
                if (onChange) onChange(e.target.value);
            }}
        />
    );
});

export default BirthdatePicker;