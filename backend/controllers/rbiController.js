const pool = require("../config/db");
const { validationResult } = require('express-validator');

// 📌 Create a household (head info + address)
exports.createHousehold = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    head_last_name,
    head_first_name,
    head_middle_name,
    head_suffix,
    house_unit_no,
    street_name,
    subdivision,
    email_address
  } = req.body;

  try {
    const [result] = await pool.execute(
      `INSERT INTO households 
        (head_last_name, head_first_name, head_middle_name, head_suffix, 
         house_unit_no, street_name, subdivision, email_address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        head_last_name,
        head_first_name,
        head_middle_name,
        head_suffix || null,
        house_unit_no,
        street_name,
        subdivision,
        email_address
      ]
    );

    res.status(201).json({
      success: true,
      householdId: result.insertId
    });
  } catch (error) {
    console.error("❌ Household insert error:", error);
    res.status(500).json({ error: "Failed to create household", details: error.message });
  }
};

// 📌 Add household member to specific household
exports.addHouseholdMember = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    household_id,
    last_name,
    first_name,
    middle_name,
    suffix,
    birth_place,
    birth_date,
    sex,
    civil_status,
    citizenship,
    occupation
  } = req.body;

  try {
    const [result] = await pool.execute(
      `INSERT INTO household_members 
        (household_id, last_name, first_name, middle_name, suffix, 
         birth_place, birth_date, sex, civil_status, citizenship, occupation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        household_id,
        last_name,
        first_name,
        middle_name,
        suffix || null,
        birth_place,
        birth_date,
        sex,
        civil_status,
        citizenship,
        occupation
      ]
    );

    res.status(201).json({
      success: true,
      memberId: result.insertId
    });
  } catch (error) {
    console.error("❌ Member insert error:", error);
    res.status(500).json({ error: "Failed to add member", details: error.message });
  }
};

// 📌 Get all households
exports.getAllHouseholds = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM households ORDER BY created_at DESC`);
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Fetch households error:", error);
    res.status(500).json({ message: "Failed to fetch households", error: error.message });
  }
};

// 📌 Get members by household ID
exports.getMembersByHouseholdId = async (req, res) => {
  const { householdId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM household_members WHERE household_id = ?`,
      [householdId]
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Fetch members error:", error);
    res.status(500).json({ message: "Failed to fetch members", error: error.message });
  }
};

// 📌 Get household by ID
exports.getRBIRegistrationById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM households WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Fetch household error:', error);
    res.status(500).json({ error: 'Failed to fetch household', details: error.message });
  }
};

// 📌 Update household status
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
      `UPDATE households SET status = ? WHERE id = ?`,
      [statusLower, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }

    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('❌ Status update error:', error);
    res.status(500).json({ error: 'Failed to update status', details: error.message });
  }
};
