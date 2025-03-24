const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/", (req, res) => {
  const { lastName, middleName, firstName, suffix, sex, birthday, contactNo, email, address, certificateType, purpose, copies } = req.body;

  const sql = `INSERT INTO requests (last_name, middle_name, first_name, suffix, sex, birthday, contact_no, email, address, type_of_certificate, purpose_of_request, number_of_copies) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [lastName, middleName, firstName, suffix, sex, birthday, contactNo, email, address, certificateType, purpose, copies], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Request submitted successfully" });
  });
});

router.get("/", (req, res) => {
  db.query("SELECT * FROM requests", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;