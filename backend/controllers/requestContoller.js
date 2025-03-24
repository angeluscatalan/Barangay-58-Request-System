const db = require("../config/db");

exports.createRequest = (req, res) => {
  const { lastName, middleName, firstName, suffix, sex, birthday, contactNo, email, address, certificateType, purpose, copies } = req.body;

  const sql = "INSERT INTO requests (last_name, middle_name, first_name, suffix, sex, birthday, contact_no, email, address, certificate_type, purpose, copies) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(sql, [lastName, middleName, firstName, suffix, sex, birthday, contactNo, email, address, certificateType, purpose, copies], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Request submitted successfully" });
  });
};

exports.getRequests = (req, res) => {
  db.query("SELECT * FROM requests", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
