const pool = require("../config/db");
const { validationResult } = require('express-validator');

exports.createRBIRegistration = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      last_name, first_name, middle_name, suffix,
      house_unit_no, street_name, subdivision,
      birth_place, birth_date, sex,
      civil_status, citizenship, occupation, email_address
    } = req.body;

    const formattedDate = new Date(birth_date).toISOString().split('T')[0];

    const [result] = await pool.execute(
      `INSERT INTO rbi (last_name, first_name, middle_name, suffix,
      house_unit_no, street_name, subdivision,
      birth_place, birth_date, sex,
      civil_status, citizenship, occupation, email_address, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        last_name, first_name, middle_name, suffix,
        house_unit_no, street_name, subdivision,
        birth_place, formattedDate, sex,
        civil_status, citizenship, occupation, email_address
      ]
    );

    res.status(201).json({
      success: true,
      registrationId: result.insertId
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

// ✅ Moved outside!
exports.getRBIRegistrations = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT *
      FROM rbi
    `;
    const params = [];

    if (status) {
      query += ` WHERE LOWER(status) = LOWER(?)`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Failed to fetch registrations", error: error.message });
  }
};

exports.getRBIRegistrationById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM rbi WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch registration', details: error.message });
  }
};

exports.updateRBIStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const statusLower = status.toLowerCase();
  const validStatuses = ['pending', 'approved', 'rejected', 'for interview'];

  if (!validStatuses.includes(statusLower)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE rbi SET status = ? WHERE id = ?`,
      [statusLower, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update status', details: error.message });
  }
};

