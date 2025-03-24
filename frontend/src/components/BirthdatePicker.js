import React, { useEffect, forwardRef } from "react";
import Flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "../styles/flatpickr.css";

const BirthdatePicker = forwardRef((props, ref) => {
    useEffect(() => {
        if (ref?.current) {
            new Flatpickr(ref.current, {
                dateFormat: "Y-m-d",
                allowInput: true
            });
        }
    }, [ref]);

    return <input type="text" ref={ref} placeholder="Birthday" className="reqFormDate" />;
});

export default BirthdatePicker;
