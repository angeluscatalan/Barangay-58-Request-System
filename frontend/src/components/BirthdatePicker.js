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
                    const newDate = selectedDates[0]?.toISOString().split("T")[0] || "";
                    setDate(newDate);
                    if (onChange) onChange(newDate);
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
