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

// 📌 Delete entire household with all members
exports.deleteHousehold = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      // 1. Get the household data
      const [household] = await connection.execute(
        'SELECT * FROM households WHERE id = ?',
        [id]
      );

      if (household.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Household not found' });
      }

      // 2. Archive the household
      await connection.execute(
        `INSERT INTO archive_households 
        (id, head_last_name, head_first_name, head_middle_name, head_suffix, 
         house_unit_no, street_name, subdivision, birth_place, birth_date, 
         sex, civil_status, citizenship, occupation, email_address, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          household[0].id,
          household[0].head_last_name,
          household[0].head_first_name,
          household[0].head_middle_name,
          household[0].head_suffix,
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
          household[0].created_at
        ]
      );

      // 3. Delete the household
      await connection.execute(
        'DELETE FROM households WHERE id = ?',
        [id]
      );

      await connection.commit();
      res.status(200).json({ message: 'Household archived and deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting household:', error);
    res.status(500).json({ error: 'Failed to delete household' });
  }
};

exports.deleteHouseholdMember = async (req, res) => {
  const { memberId } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Verify member exists and get data
    const [member] = await connection.execute(
      `SELECT hm.*, h.id as household_id FROM household_members hm
       JOIN households h ON hm.household_id = h.id
       WHERE hm.id = ?`,
      [memberId]
    );

    if (member.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Member not found' });
    }

    // 2. First, verify if the household is already archived
    const [archivedHousehold] = await connection.execute(
      `SELECT id FROM archive_households WHERE id = ?`,
      [member[0].household_id]
    );

    // 2a. If the household is not archived, archive it first
    if (archivedHousehold.length === 0) {
      // Get household data
      const [household] = await connection.execute(
        `SELECT * FROM households WHERE id = ?`,
        [member[0].household_id]
      );

      if (household.length > 0) {
        // Archive the household
        await connection.execute(
          `INSERT INTO archive_households 
          (id, head_last_name, head_first_name, head_middle_name, head_suffix, 
           house_unit_no, street_name, subdivision, birth_place, birth_date, 
           sex, civil_status, citizenship, occupation, email_address, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            household[0].id,
            household[0].head_last_name,
            household[0].head_first_name,
            household[0].head_middle_name,
            household[0].head_suffix,
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
            household[0].created_at
          ]
        );
      }
    }

    // 3. Now archive the member
    await connection.execute(
      `INSERT INTO archive_household_members 
      (id, household_id, last_name, first_name, middle_name, suffix, 
       birth_place, birth_date, sex, civil_status, citizenship, occupation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        member[0].id,
        member[0].household_id,
        member[0].last_name,
        member[0].first_name,
        member[0].middle_name,
        member[0].suffix || null, // Handle NULL suffix
        member[0].birth_place,
        member[0].birth_date,
        member[0].sex,
        member[0].civil_status,
        member[0].citizenship,
        member[0].occupation || null // Handle NULL occupation
      ]
    );

    // 4. Delete from main table
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
    console.error('Database error:', {
      message: error.message,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      error: 'Failed to process member deletion',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

exports.findSimilarRbis = async (req, res) => {
  try {
    const { lastName, firstName, middleName } = req.body;

    // Search for similar names (adjust the query as needed)
    const [households] = await pool.execute(
      `SELECT h.* FROM households h
       WHERE h.head_last_name LIKE ? 
       OR h.head_first_name LIKE ?
       OR EXISTS (
         SELECT 1 FROM household_members m 
         WHERE m.household_id = h.id 
         AND (m.last_name LIKE ? OR m.first_name LIKE ?)
       )`,
      [
        `%${lastName}%`,
        `%${firstName}%`,
        `%${lastName}%`,
        `%${firstName}%`
      ]
    );

    // Get members for matching households
    const records = await Promise.all(
      households.map(async (household) => {
        const [members] = await pool.execute(
          `SELECT * FROM household_members WHERE household_id = ?`,
          [household.id]
        );

        return {
          ...household,
          members: members.filter(m =>
            m.last_name.includes(lastName) ||
            m.first_name.includes(firstName) ||
            (middleName && m.middle_name && m.middle_name.includes(middleName))
          )
        };
      })
    );

    // Flatten results (both household heads and members)
    const results = records.flatMap(record => [
      {
        last_name: record.head_last_name,
        first_name: record.head_first_name,
        middle_name: record.head_middle_name,
        birth_date: record.birth_date,
        house_unit_no: record.house_unit_no,
        street_name: record.street_name,
        subdivision: record.subdivision,
        status: record.status,
        type: 'Household Head'
      },
      ...record.members.map(m => ({
        last_name: m.last_name,
        first_name: m.first_name,
        middle_name: m.middle_name,
        birth_date: m.birth_date,
        house_unit_no: record.house_unit_no,
        street_name: record.street_name,
        subdivision: record.subdivision,
        status: record.status,
        type: 'Household Member'
      }))
    ]);

    res.status(200).json(results);
  } catch (error) {
    console.error('Error finding similar RBIs:', error);
    res.status(500).json({ error: 'Failed to search for similar RBI records' });
  }
};

// Get backup RBI requests
exports.getBackupRBI = async (req, res) => {
  try {
    // Get archived households with their members count
    const [households] = await pool.query(`
            SELECT 
                h.id,
                h.head_last_name,
                h.head_first_name,
                h.head_middle_name,
                h.head_suffix,
                h.house_unit_no,
                h.street_name,
                h.subdivision,
                h.birth_place,
                h.birth_date,
                h.sex,
                h.civil_status,
                h.citizenship,
                h.occupation,
                h.email_address,
                h.status,
                h.created_at,
                COUNT(m.id) as member_count
            FROM archive_households h
            LEFT JOIN archive_household_members m ON h.id = m.household_id
            GROUP BY 
                h.id, h.head_last_name, h.head_first_name, h.head_middle_name,
                h.head_suffix, h.house_unit_no, h.street_name, h.subdivision,
                h.birth_place, h.birth_date, h.sex, h.civil_status,
                h.citizenship, h.occupation, h.email_address, h.status,
                h.created_at
            ORDER BY h.created_at DESC
        `);

    // For each household, get its members with all their fields
    for (let household of households) {
      const [members] = await pool.query(
        `SELECT 
            id,
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
         FROM archive_household_members 
         WHERE household_id = ?`,
        [household.id]
      );
      household.members = members;
    }

    return res.json({
      success: true,
      data: {
        households: households.map(household => ({
          household: {
            id: household.id,
            head_last_name: household.head_last_name,
            head_first_name: household.head_first_name,
            head_middle_name: household.head_middle_name,
            head_suffix: household.head_suffix,
            house_unit_no: household.house_unit_no,
            street_name: household.street_name,
            subdivision: household.subdivision,
            birth_place: household.birth_place,
            birth_date: household.birth_date,
            sex: household.sex,
            civil_status: household.civil_status,
            citizenship: household.citizenship,
            occupation: household.occupation,
            email_address: household.email_address,
            status: household.status,
            created_at: household.created_at,
            member_count: household.member_count
          },
          members: household.members
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching backup RBI:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch backup RBI data',
      details: error.message
    });
  }
};

// Restore RBI from backup
exports.restoreRBI = async (req, res) => {
  const { householdIds } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const id of householdIds) {
      // Get the backup household data
      const [backupHousehold] = await connection.execute(
        "SELECT * FROM archive_households WHERE id = ?",
        [id]
      );

      if (backupHousehold.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: `Backup household with id ${id} not found` });
      }

      const householdData = backupHousehold[0];

      // Insert into main households table with preserved timestamps
      const [result] = await connection.execute(
        `INSERT INTO households 
                 (head_first_name, head_middle_name, head_last_name, head_suffix,
                  house_unit_no, street_name, subdivision, birth_place, birth_date,
                  sex, civil_status, citizenship, occupation, email_address, contact_no,
                  status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          householdData.head_first_name,
          householdData.head_middle_name,
          householdData.head_last_name,
          householdData.head_suffix,
          householdData.house_unit_no,
          householdData.street_name,
          householdData.subdivision,
          householdData.birth_place,
          householdData.birth_date,
          householdData.sex,
          householdData.civil_status,
          householdData.citizenship,
          householdData.occupation,
          householdData.email_address,
          householdData.contact_no,
          householdData.status,
          householdData.created_at
        ]
      );

      const newHouseholdId = result.insertId;

      // Get and restore household members
      const [backupMembers] = await connection.execute(
        "SELECT * FROM archive_household_members WHERE household_id = ?",
        [id]
      );

      // Insert each member with preserved timestamps
      for (const member of backupMembers) {
        await connection.execute(
          `INSERT INTO household_members 
                     (household_id, first_name, middle_name, last_name, suffix,
                      relationship, birth_date, birth_place, sex, civil_status,
                      citizenship, occupation, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newHouseholdId,
            member.first_name,
            member.middle_name,
            member.last_name,
            member.suffix,
            member.relationship,
            member.birth_date,
            member.birth_place,
            member.sex,
            member.civil_status,
            member.citizenship,
            member.occupation,
            member.created_at
          ]
        );
      }

      // Only delete from backup tables after successful restore
      await connection.execute(
        "DELETE FROM archive_household_members WHERE household_id = ?",
        [id]
      );
      await connection.execute(
        "DELETE FROM archive_households WHERE id = ?",
        [id]
      );
    }

    await connection.commit();
    res.json({
      success: true,
      message: `Successfully restored ${householdIds.length} household(s)`,
      restoredIds: householdIds
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error restoring RBI:', error);
    res.status(500).json({ error: 'Failed to restore RBI data', details: error.message });
  } finally {
    connection.release();
  }
};