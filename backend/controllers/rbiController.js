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
  
      // Format the date for MySQL
      const formattedDate = new Date(birth_date).toISOString().split('T')[0];
  
      const [result] = await pool.execute(
        `INSERT INTO rbi (last_name, first_name, middle_name, suffix,
        house_unit_no, street_name, subdivision,
        birth_place, birth_date, sex,
        civil_status, citizenship, occupation, email_address,status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
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
      console.error("Database error:", {
        message: error.message,
        sqlError: error.sqlMessage,
        stack: error.stack
      });
      res.status(500).json({ 
        error: 'Registration failed',
        details: error.message
      });
    }
  };