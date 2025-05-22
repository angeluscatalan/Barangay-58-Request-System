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
        (head_last_name, head_first_name, head_middle_name, head_suffix_id,
         house_unit_no, street_name, subdivision, birth_place, birth_date,
         sex, sex_other, civil_status, citizenship, occupation, email_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        household.head_last_name,
        household.head_first_name,
        household.head_middle_name,
        household.head_suffix_id || null,
        household.house_unit_no,
        household.street_name,
        household.subdivision,
        household.birth_place,
        household.birth_date,
        household.sex,
        household.sex_other || null,
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
            (household_id, last_name, first_name, middle_name, suffix_id,
             birth_place, birth_date, sex, sex_other, civil_status, citizenship, occupation, relationship_id, relationship_other)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            householdId,
            member.last_name,
            member.first_name,
            member.middle_name,
            member.suffix_id || null,
            member.birth_place,
            member.birth_date,
            member.sex,
            member.sex_other || null,
            member.civil_status,
            member.citizenship,
            member.occupation,
            member.relationship_id || null,
            member.relationship_other || null
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
          head_suffix_id: household.head_suffix_id,
          sex: household.sex,
          sex_other: household.sex_other,
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
          members: members.map(member => ({
            id: member.id,
            household_id: member.household_id,
            last_name: member.last_name,
            first_name: member.first_name,
            middle_name: member.middle_name,
            birth_date: member.birth_date,
            birth_place: member.birth_place,
            civil_status: member.civil_status,
            citizenship: member.citizenship,
            occupation: member.occupation,
            sex_other: member.sex_other,
            suffix_id: member.suffix_id,
            sex: member.sex,
            relationship_id: member.relationship_id,
            relationship_other: member.relationship_other
          }))
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
    // First get current status
    const [current] = await pool.query(
      'SELECT status FROM households WHERE id = ?',
      [id]
    );

    if (current.length === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }

    const currentStatus = current[0].status;

    // Allow any status transition
    const [result] = await pool.query(
      `UPDATE households SET status = ? WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }

    res.json({
      success: true,
      message: `Household status updated from '${currentStatus}' to '${status}' successfully`
    });
  } catch (error) {
    console.error('❌ Status update error:', error);
    res.status(500).json({
      error: 'Failed to update status',
      details: error.message
    });
  }
};

// 📌 Update household information
exports.updateHousehold = async (req, res) => {
  const { id } = req.params;
  const {
    head_last_name,
    head_first_name,
    head_middle_name,
    head_suffix_id, // Changed to head_suffix_id
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
    sex_other // Added sex_other
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE households
       SET head_last_name = ?, head_first_name = ?, head_middle_name = ?,
           head_suffix_id = ?, house_unit_no = ?, street_name = ?,
           subdivision = ?, birth_place = ?, birth_date = ?, sex = ?,
           civil_status = ?, citizenship = ?, occupation = ?, email_address = ?, sex_other = ?
       WHERE id = ?`,
      [
        head_last_name,
        head_first_name,
        head_middle_name,
        head_suffix_id || null, // Changed to head_suffix_id
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
        sex_other || null, // Added sex_other
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
    // Return the first error message for easier frontend debugging
    return res.status(400).json({ error: errors.array()[0]?.msg || "Invalid input", details: errors.array() });
  }

  const { id } = req.params;
  const {
    last_name,
    first_name,
    middle_name,
    suffix_id,
    birth_place,
    birth_date,
    sex,
    sex_other,
    civil_status,
    citizenship,
    occupation,
    relationship_id,
    relationship_other
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

    // Defensive: ensure required fields are present
    if (!last_name || !first_name || !birth_place || !birth_date || !sex || !civil_status || !citizenship || !occupation) {
      return res.status(400).json({ error: "Missing required member fields." });
    }

    const [result] = await pool.execute(
      `INSERT INTO household_members
        (household_id, last_name, first_name, middle_name, suffix_id,
         birth_place, birth_date, sex, sex_other, civil_status, citizenship, occupation, relationship_id, relationship_other)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        last_name,
        first_name,
        middle_name || null,
        suffix_id || null,
        birth_place,
        birth_date,
        sex,
        sex_other || null,
        civil_status,
        citizenship,
        occupation,
        relationship_id || null,
        relationship_other || null
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

exports.updateHouseholdMember = async (req, res) => {
  const { id, memberId } = req.params;
  const {
    last_name,
    first_name,
    middle_name,
    suffix_id,
    birth_place,
    birth_date,
    sex,
    sex_other,
    civil_status,
    citizenship,
    occupation,
    relationship_id,
    relationship_other
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE household_members
       SET last_name = ?, first_name = ?, middle_name = ?, suffix_id = ?,
           birth_place = ?, birth_date = ?, sex = ?, sex_other = ?, civil_status = ?,
           citizenship = ?, occupation = ?, relationship_id = ?, relationship_other = ?
       WHERE id = ? AND household_id = ?`,
      [
        last_name,
        first_name,
        middle_name,
        suffix_id || null,
        birth_place,
        birth_date,
        sex,
        sex_other || null,
        civil_status,
        citizenship,
        occupation,
        relationship_id || null,
        relationship_other || null,
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

// 📌 Delete entire household with all members (fixed version)
exports.deleteHousehold = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get the household data
    const [household] = await connection.execute(
      'SELECT * FROM households WHERE id = ?',
      [id]
    );

    if (household.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Household not found' });
    }

    // 2. Get all members of this household
    const [members] = await connection.execute(
      'SELECT * FROM household_members WHERE household_id = ?',
      [id]
    );

    // 3. Check if household already exists in backup
    const [existingBackup] = await connection.execute(
      'SELECT id FROM backup_households WHERE id = ?',
      [id]
    );

    // 4. Archive or update the household
    if (existingBackup.length > 0) {
      await connection.execute(
        `UPDATE backup_households
         SET head_last_name = ?, head_first_name = ?, head_middle_name = ?, head_suffix_id = ?,
             house_unit_no = ?, street_name = ?, subdivision = ?, birth_place = ?, birth_date = ?,
             sex = ?, civil_status = ?, citizenship = ?, occupation = ?, email_address = ?,
             status = ?, created_at = ?, sex_other = ?
         WHERE id = ?`,
        [
          household[0].head_last_name,
          household[0].head_first_name,
          household[0].head_middle_name,
          household[0].head_suffix_id, // Changed to head_suffix_id
          household[0].house_unit_no,
          household[0].street_name,
          household[0].subdivision,
          household[0].birth_place,
          household[0].birth_date,
          household[0].sex,
          household[0].civil_status,
          household[0].citizenship,
          household[0].occupation,
          household[0].email_address,
          household[0].status,
          household[0].created_at,
          household[0].sex_other, // Added sex_other
          id
        ]
      );
    } else {
      await connection.execute(
        `INSERT INTO backup_households
        (id, head_last_name, head_first_name, head_middle_name, head_suffix_id,
         house_unit_no, street_name, subdivision, birth_place, birth_date,
         sex, civil_status, citizenship, occupation, email_address, status, created_at, sex_other)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          household[0].id,
          household[0].head_last_name,
          household[0].head_first_name,
          household[0].head_middle_name,
          household[0].head_suffix_id, // Changed to head_suffix_id
          household[0].house_unit_no,
          household[0].street_name,
          household[0].subdivision,
          household[0].birth_place,
          household[0].birth_date,
          household[0].sex,
          household[0].civil_status,
          household[0].citizenship,
          household[0].occupation,
          household[0].email_address,
          household[0].status,
          household[0].created_at,
          household[0].sex_other // Added sex_other
        ]
      );
    }

    // 5. Archive all members
    for (const member of members) {
      const [existingMemberBackup] = await connection.execute(
        'SELECT id FROM backup_household_members WHERE id = ?',
        [member.id]
      );

      if (existingMemberBackup.length > 0) {
        await connection.execute(
          `UPDATE backup_household_members
           SET household_id = ?, last_name = ?, first_name = ?, middle_name = ?, suffix_id = ?,
               birth_place = ?, birth_date = ?, sex = ?, civil_status = ?,
               citizenship = ?, occupation = ?, sex_other = ?
           WHERE id = ?`,
          [
            member.household_id,
            member.last_name,
            member.first_name,
            member.middle_name,
            member.suffix_id || null, // Changed to suffix_id
            member.birth_place,
            member.birth_date,
            member.sex,
            member.civil_status,
            member.citizenship,
            member.occupation || null,
            member.sex_other || null, // Added sex_other
            member.id
          ]
        );
      } else {
        await connection.execute(
          `INSERT INTO backup_household_members
          (id, household_id, last_name, first_name, middle_name, suffix_id,
           birth_place, birth_date, sex, civil_status, citizenship, occupation, sex_other)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            member.id,
            member.household_id,
            member.last_name,
            member.first_name,
            member.middle_name,
            member.suffix_id || null, // Changed to suffix_id
            member.birth_place,
            member.birth_date,
            member.sex,
            member.civil_status,
            member.citizenship,
            member.occupation || null,
            member.sex_other || null // Added sex_other
          ]
        );
      }
    }

    // 6. Delete all members from main table
    await connection.execute(
      'DELETE FROM household_members WHERE household_id = ?',
      [id]
    );

    // 7. Delete the household from main table
    await connection.execute(
      'DELETE FROM households WHERE id = ?',
      [id]
    );

    await connection.commit();
    res.status(200).json({
      success: true,
      message: 'Household and members archived and deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete household error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete household',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

// 📌 Delete household member (fixed version)
exports.deleteHouseholdMember = async (req, res) => {
  const { memberId } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Verify member exists and get data
    const [member] = await connection.execute(
      `SELECT hm.*, h.id as household_id, h.status as household_status
       FROM household_members hm
       JOIN households h ON hm.household_id = h.id
       WHERE hm.id = ?`,
      [memberId]
    );

    if (member.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Member not found' });
    }

    const memberData = member[0];

    // 2. Check if household exists in backup (create if not)
    const [existingHouseholdBackup] = await connection.execute(
      'SELECT id FROM backup_households WHERE id = ?',
      [memberData.household_id]
    );

    if (existingHouseholdBackup.length === 0) {
      // Get household data
      const [household] = await connection.execute(
        'SELECT * FROM households WHERE id = ?',
        [memberData.household_id]
      );

      if (household.length > 0) {
        await connection.execute(
          `INSERT INTO backup_households
          (id, head_last_name, head_first_name, head_middle_name, head_suffix_id,
           house_unit_no, street_name, subdivision, birth_place, birth_date,
           sex, civil_status, citizenship, occupation, email_address, status, created_at, sex_other)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            household[0].id,
            household[0].head_last_name,
            household[0].head_first_name,
            household[0].head_middle_name,
            household[0].head_suffix_id, // Changed to head_suffix_id
            household[0].house_unit_no,
            household[0].street_name,
            household[0].subdivision,
            household[0].birth_place,
            household[0].birth_date,
            household[0].sex,
            household[0].civil_status,
            household[0].citizenship,
            household[0].occupation,
            household[0].email_address,
            household[0].status,
            household[0].created_at,
            household[0].sex_other // Added sex_other
          ]
        );
      }
    }

    // 3. Check if member already exists in backup
    const [existingMemberBackup] = await connection.execute(
      'SELECT id FROM backup_household_members WHERE id = ?',
      [memberId]
    );

    // 4. Archive or update the member
    if (existingMemberBackup.length > 0) {
      await connection.execute(
        `UPDATE backup_household_members
           SET household_id = ?, last_name = ?, first_name = ?, middle_name = ?, suffix_id = ?,
               birth_place = ?, birth_date = ?, sex = ?, civil_status = ?,
               citizenship = ?, occupation = ?, sex_other = ?
           WHERE id = ?`,
        [
          memberData.household_id,
          memberData.last_name,
          memberData.first_name,
          memberData.middle_name,
          memberData.suffix_id || null, // Changed to suffix_id
          memberData.birth_place,
          memberData.birth_date,
          memberData.sex,
          memberData.civil_status,
          memberData.citizenship,
          memberData.occupation || null,
          memberData.sex_other || null, // Added sex_other
          memberId
        ]
      );
    } else {
      await connection.execute(
        `INSERT INTO backup_household_members
        (id, household_id, last_name, first_name, middle_name, suffix_id,
         birth_place, birth_date, sex, civil_status, citizenship, occupation, sex_other)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          memberData.id,
          memberData.household_id,
          memberData.last_name,
          memberData.first_name,
          memberData.middle_name,
          memberData.suffix_id || null, // Changed to suffix_id
          memberData.birth_place,
          memberData.birth_date,
          memberData.sex,
          memberData.civil_status,
          memberData.citizenship,
          memberData.occupation || null,
          memberData.sex_other || null // Added sex_other
        ]
      );
    }

    // 5. Delete from main table
    await connection.execute(
      'DELETE FROM household_members WHERE id = ?',
      [memberId]
    );

    await connection.commit();
    res.status(200).json({
      success: true,
      message: 'Member archived and deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Delete member error:', {
      message: error.message,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      error: 'Failed to delete member',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

exports.findSimilarRbis = async (req, res) => {
  try {
    const { lastName, firstName, middleName, birthday, address } = req.body;

    // Build dynamic query for household heads
    let headQuery = `SELECT h.* FROM households h WHERE h.head_last_name LIKE ? AND h.head_first_name LIKE ?`;
    let headParams = [`%${lastName}%`, `%${firstName}%`];
    if (middleName) {
      headQuery += ` AND h.head_middle_name LIKE ?`;
      headParams.push(`%${middleName}%`);
    }
    if (birthday) {
      headQuery += ` AND h.birth_date = ?`;
      headParams.push(birthday);
    }
    if (address) {
      headQuery += ` AND CONCAT(h.house_unit_no, ' ', h.street_name, ', ', h.subdivision) LIKE ?`;
      headParams.push(`%${address}%`);
    }

    const [householdHeads] = await pool.execute(headQuery, headParams);

    // Build dynamic query for household members
    let memberQuery = `SELECT m.*, h.house_unit_no, h.street_name, h.subdivision, h.status
      FROM household_members m
      JOIN households h ON m.household_id = h.id
      WHERE m.last_name LIKE ? AND m.first_name LIKE ?`;
    let memberParams = [`%${lastName}%`, `%${firstName}%`];
    if (middleName) {
      memberQuery += ` AND m.middle_name LIKE ?`;
      memberParams.push(`%${middleName}%`);
    }
    if (birthday) {
      memberQuery += ` AND m.birth_date = ?`;
      memberParams.push(birthday);
    }
    if (address) {
      memberQuery += ` AND CONCAT(h.house_unit_no, ' ', h.street_name, ', ', h.subdivision) LIKE ?`;
      memberParams.push(`%${address}%`);
    }

    const [householdMembers] = await pool.execute(memberQuery, memberParams);

    // Format results with proper type indicators
    const results = [
      // Household heads that match
      ...householdHeads.map(h => ({
        id: h.id,
        last_name: h.head_last_name,
        first_name: h.head_first_name,
        middle_name: h.head_middle_name,
        head_suffix_id: h.head_suffix_id,
        sex: h.sex,
        sex_other: h.sex_other,
        birth_date: h.birth_date,
        house_unit_no: h.house_unit_no,
        street_name: h.street_name,
        subdivision: h.subdivision,
        status: h.status,
        type: 'Household Head'
      })),
      // Household members that match
      ...householdMembers.map(m => ({
        id: m.id,
        last_name: m.last_name,
        first_name: m.first_name,
        middle_name: m.middle_name,
        suffix_id: m.suffix_id,
        sex: m.sex,
        sex_other: m.sex_other,
        birth_date: m.birth_date,
        house_unit_no: m.house_unit_no,
        street_name: m.street_name,
        subdivision: m.subdivision,
        status: m.status,
        household_id: m.household_id,
        type: 'Household Member'
      }))
    ];

    res.status(200).json(results);
  } catch (error) {
    console.error('Error finding similar RBIs:', error);
    res.status(500).json({ error: 'Failed to search for similar RBI records' });
  }
};

// Get backup RBIs
const getBackupRBIs = async (req, res) => {
  try {
    // First get all households
    const [households] = await pool.query(
      `SELECT * FROM backup_households ORDER BY created_at DESC`
    );

    // For each household, get its members
    const results = await Promise.all(
      households.map(async (household) => {
        const [members] = await pool.query(
          `SELECT * FROM backup_household_members WHERE household_id = ?`,
          [household.id]
        );

        return {
          ...household,
          members: members
        };
      })
    );

    res.json(results);
  } catch (error) {
    console.error('Error fetching backup RBIs:', error);
    res.status(500).json({ error: 'Failed to fetch backup RBIs' });
  }
};
const restoreRBIs = async (req, res) => {
  const { householdIds } = req.body;
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    for (const householdId of householdIds) {
      // 1. Get household from backup
      const [householdResult] = await connection.query(
        'SELECT * FROM backup_households WHERE id = ?',
        [householdId]
      );
      const household = householdResult[0];

      if (!household) {
        throw new Error(`Household ${householdId} not found in backup`);
      }

      // 2. Get members from backup
      const [members] = await connection.query(
        'SELECT * FROM backup_household_members WHERE household_id = ?',
        [householdId]
      );

      // 3. Insert household into main table
      await connection.query(
        `INSERT INTO households (
          id, head_last_name, head_first_name, head_middle_name, head_suffix_id,
          house_unit_no, street_name, subdivision, birth_place, birth_date,
          sex, civil_status, citizenship, occupation, email_address, status,
          created_at, sex_other
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          head_last_name = VALUES(head_last_name),
          head_first_name = VALUES(head_first_name),
          head_middle_name = VALUES(head_middle_name),
          head_suffix_id = VALUES(head_suffix_id),
          house_unit_no = VALUES(house_unit_no),
          street_name = VALUES(street_name),
          subdivision = VALUES(subdivision),
          birth_place = VALUES(birth_place),
          birth_date = VALUES(birth_date),
          sex = VALUES(sex),
          civil_status = VALUES(civil_status),
          citizenship = VALUES(citizenship),
          occupation = VALUES(occupation),
          email_address = VALUES(email_address),
          status = VALUES(status),
          created_at = VALUES(created_at),
          sex_other = VALUES(sex_other)`,
        [
          household.id,
          household.head_last_name,
          household.head_first_name,
          household.head_middle_name,
          household.head_suffix_id,
          household.house_unit_no,
          household.street_name,
          household.subdivision,
          household.birth_place,
          household.birth_date,
          household.sex,
          household.civil_status,
          household.citizenship,
          household.occupation,
          household.email_address,
          household.status,
          household.created_at,
          household.sex_other
        ]
      );

      // 4. Insert members into main table
      for (const member of members) {
        await connection.query(
          `INSERT INTO household_members (
            id, household_id, last_name, first_name, middle_name, suffix_id,
            birth_place, birth_date, sex, civil_status, citizenship, occupation, sex_other
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            last_name = VALUES(last_name),
            first_name = VALUES(first_name),
            middle_name = VALUES(middle_name),
            suffix_id = VALUES(suffix_id),
            birth_place = VALUES(birth_place),
            birth_date = VALUES(birth_date),
            sex = VALUES(sex),
            civil_status = VALUES(civil_status),
            citizenship = VALUES(citizenship),
            occupation = VALUES(occupation),
            sex_other = VALUES(sex_other)`,
          [
            member.id,
            member.household_id,
            member.last_name,
            member.first_name,
            member.middle_name,
            member.suffix_id || null,
            member.birth_place,
            member.birth_date,
            member.sex,
            member.civil_status,
            member.citizenship,
            member.occupation || null,
            member.sex_other || null
          ]
        );
      }

      // 5. Delete from backup tables
      await connection.query(
        'DELETE FROM backup_household_members WHERE household_id = ?',
        [householdId]
      );
      await connection.query(
        'DELETE FROM backup_households WHERE id = ?',
        [householdId]
      );
    }

    await connection.commit();
    res.json({
      success: true,
      message: 'Successfully restored and removed backup RBI data'
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Detailed restore error:', {
      message: error.message,
      sqlMessage: error.sqlMessage,
      sql: error.sql,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: 'Failed to restore RBI data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  createCompleteHousehold: exports.createCompleteHousehold,
  getAllHouseholds: exports.getAllHouseholds,
  getHouseholdWithMembersById: exports.getHouseholdWithMembersById,
  updateHouseholdStatus: exports.updateHouseholdStatus,
  updateHousehold: exports.updateHousehold,
  addHouseholdMember: exports.addHouseholdMember,
  updateHouseholdMember: exports.updateHouseholdMember,
  deleteHousehold: exports.deleteHousehold,
  deleteHouseholdMember: exports.deleteHouseholdMember,
  findSimilarRbis: exports.findSimilarRbis,
  getBackupRBIs,
  restoreRBIs
};