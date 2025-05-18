const pool = require("../config/db");
const { validationResult } = require('express-validator');

// 📌 Create a complete household registration (head + members in one request)
exports.createCompleteHousehold = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { household, members } = req.body;

  // Start a database transaction
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert household data
    const [householdResult] = await connection.execute(
      `INSERT INTO households 
        (head_last_name, head_first_name, head_middle_name, head_suffix, 
         house_unit_no, street_name, subdivision, birth_place, birth_date,
         sex, civil_status, citizenship, occupation, email_address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        household.head_last_name,
        household.head_first_name,
        household.head_middle_name,
        household.head_suffix || null,
        household.house_unit_no,
        household.street_name,
        household.subdivision,
        household.birth_place,
        household.birth_date,
        household.sex,
        household.civil_status,
        household.citizenship,
        household.occupation,
        household.email_address
      ]
    );

    const householdId = householdResult.insertId;

    // Insert members if there are any
    if (members && members.length > 0) {
      for (const member of members) {
        await connection.execute(
          `INSERT INTO household_members 
            (household_id, last_name, first_name, middle_name, suffix, 
             birth_place, birth_date, sex, civil_status, citizenship, occupation)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            householdId,
            member.last_name,
            member.first_name,
            member.middle_name,
            member.suffix || null,
            member.birth_place,
            member.birth_date,
            member.sex,
            member.civil_status,
            member.citizenship,
            member.occupation
          ]
        );
      }
    }

    // Commit the transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      message: "RBI Registration submitted successfully",
      householdId: householdId
    });
  } catch (error) {
    // Rollback the transaction in case of error
    if (connection) {
      await connection.rollback();
    }
    console.error("❌ Household registration error:", error);
    res.status(500).json({ error: "Failed to submit RBI registration", details: error.message });
  } finally {
    // Release the connection
    if (connection) {
      connection.release();
    }
  }
};

// 📌 Get all households with pagination and search
exports.getAllHouseholds = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `SELECT * FROM households`;
    const params = [];
    
    if (status) {
      query += ` WHERE status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const [households] = await pool.execute(query, params);

    const records = await Promise.all(
      households.map(async (household) => {
        const [members] = await pool.execute(
          `SELECT * FROM household_members WHERE household_id = ?`,
          [household.id]
        );

        return {
          id: household.id,
          head_last_name: household.head_last_name,
          head_first_name: household.head_first_name,
          head_middle_name: household.head_middle_name,
          head_suffix: household.head_suffix,
          sex: household.sex,
          birth_date: household.birth_date,
          birth_place: household.birth_place,
          civil_status: household.civil_status,
          citizenship: household.citizenship,
          occupation: household.occupation,
          email_address: household.email_address,
          house_unit_no: household.house_unit_no,
          street_name: household.street_name,
          subdivision: household.subdivision,
          status: household.status,
          members: members
        };
      })
    );

    res.status(200).json({ records });
  } catch (error) {
    console.error("Error fetching households:", error);
    res.status(500).json({ error: "Failed to fetch households" });
  }
};

// 📌 Get household details with members by ID
exports.getHouseholdWithMembersById = async (req, res) => {
  const { id } = req.params;
  try {
    // Get household information
    const [household] = await pool.query(
      `SELECT * FROM households WHERE id = ?`,
      [id]
    );

    if (household.length === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }

    // Get members of this household
    const [members] = await pool.query(
      `SELECT * FROM household_members WHERE household_id = ?`,
      [id]
    );

    res.json({
      household: household[0],
      members: members
    });
  } catch (error) {
    console.error('❌ Fetch household error:', error);
    res.status(500).json({ error: 'Failed to fetch household data', details: error.message });
  }
};

// 📌 Update household status
exports.updateHouseholdStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'approved', 'rejected', 'for interview'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE households SET status = ? WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }

    res.json({ 
      success: true, 
      message: `Household status updated to '${status}' successfully` 
    });
  } catch (error) {
    console.error('❌ Status update error:', error);
    res.status(500).json({ error: 'Failed to update status', details: error.message });
  }
};

// 📌 Update household information
exports.updateHousehold = async (req, res) => {
  const { id } = req.params;
  const {
    head_last_name,
    head_first_name,
    head_middle_name,
    head_suffix,
    house_unit_no,
    street_name,
    subdivision,
    birth_place,
    birth_date,
    sex,
    civil_status,
    citizenship,
    occupation,
    email_address
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE households 
       SET head_last_name = ?, head_first_name = ?, head_middle_name = ?, 
           head_suffix = ?, house_unit_no = ?, street_name = ?, 
           subdivision = ?, birth_place = ?, birth_date = ?, sex = ?, 
           civil_status = ?, citizenship = ?, occupation = ?, email_address = ?
       WHERE id = ?`,
      [
        head_last_name,
        head_first_name,
        head_middle_name,
        head_suffix || null,
        house_unit_no,
        street_name,
        subdivision,
        birth_place,
        birth_date,
        sex,
        civil_status,
        citizenship,
        occupation,
        email_address,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }

    res.json({ success: true, message: 'Household information updated successfully' });
  } catch (error) {
    console.error('❌ Update household error:', error);
    res.status(500).json({ error: 'Failed to update household', details: error.message });
  }
};

// 📌 Add household member to specific household
exports.addHouseholdMember = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const {
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
    // Check if household exists
    const [household] = await pool.query(
      `SELECT id FROM households WHERE id = ?`,
      [id]
    );

    if (household.length === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }

    const [result] = await pool.execute(
      `INSERT INTO household_members 
        (household_id, last_name, first_name, middle_name, suffix, 
         birth_place, birth_date, sex, civil_status, citizenship, occupation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
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
      message: 'Household member added successfully',
      memberId: result.insertId
    });
  } catch (error) {
    console.error("❌ Member insert error:", error);
    res.status(500).json({ error: "Failed to add member", details: error.message });
  }
};

// 📌 Update household member
exports.updateHouseholdMember = async (req, res) => {
  const { id, memberId } = req.params;
  const {
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
    const [result] = await pool.query(
      `UPDATE household_members 
       SET last_name = ?, first_name = ?, middle_name = ?, suffix = ?, 
           birth_place = ?, birth_date = ?, sex = ?, civil_status = ?, 
           citizenship = ?, occupation = ?
       WHERE id = ? AND household_id = ?`,
      [
        last_name,
        first_name,
        middle_name,
        suffix || null,
        birth_place,
        birth_date,
        sex,
        civil_status,
        citizenship,
        occupation,
        memberId,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found or does not belong to specified household' });
    }

    res.json({ success: true, message: 'Member information updated successfully' });
  } catch (error) {
    console.error('❌ Update member error:', error);
    res.status(500).json({ error: 'Failed to update member', details: error.message });
  }
};

// 📌 Delete household member
exports.deleteHouseholdMember = async (req, res) => {
  const { id, memberId } = req.params;

  try {
    const [result] = await pool.query(
      `DELETE FROM household_members WHERE id = ? AND household_id = ?`,
      [memberId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found or does not belong to specified household' });
    }

    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    console.error('❌ Delete member error:', error);
    res.status(500).json({ error: 'Failed to delete member', details: error.message });
  }
};

// 📌 Delete entire household with all members
exports.deleteHousehold = async (req, res) => {
  const { id } = req.params;
  
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Delete all members first (due to foreign key constraint)
    await connection.query(
      `DELETE FROM household_members WHERE household_id = ?`,
      [id]
    );

    // Then delete the household
    const [result] = await connection.query(
      `DELETE FROM households WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Household not found' });
    }

    await connection.commit();
    res.json({ success: true, message: 'Household and all members deleted successfully' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('❌ Delete household error:', error);
    res.status(500).json({ error: 'Failed to delete household', details: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};