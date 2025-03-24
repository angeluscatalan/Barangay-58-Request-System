const express = require("express");
const router = express.Router();
const pool = require("../database");

router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM requests");
        res.json(rows);
    } catch (error) {
        console.error("❌ Error fetching requests:", error);
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const {
            last_name, middle_name, first_name, suffix,
            sex, birthday, contact_no, email, address,
            type_of_certificate, purpose_of_request, number_of_copies
        } = req.body;

        const query = `
            INSERT INTO requests (last_name, middle_name, first_name, suffix, sex, birthday, contact_no, email, address, type_of_certificate, purpose_of_request, number_of_copies)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await pool.query(query, [
            last_name, middle_name, first_name, suffix, sex, birthday, contact_no,
            email, address, type_of_certificate, purpose_of_request, number_of_copies
        ]);

        res.status(201).json({ message: "✅ Request submitted successfully!", id: result.insertId });
    } catch (error) {
        console.error("❌ Error submitting request:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
