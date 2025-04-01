const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { check, validationResult } = require('express-validator');

const backupRequest = async (requestData) => {
    try {
        console.log("Backing up request with data:", requestData);
        
        await pool.execute(
            `INSERT INTO backup_requests 
             (last_name, first_name, middle_name, suffix, sex, birthday, 
              contact_no, email, address, type_of_certificate, 
              purpose_of_request, number_of_copies, status, original_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                requestData.last_name,
                requestData.first_name,
                requestData.middle_name,
                requestData.suffix,
                requestData.sex,
                requestData.birthday,
                requestData.contact_no,
                requestData.email,
                requestData.address,
                requestData.type_of_certificate,
                requestData.purpose_of_request,
                requestData.number_of_copies,
                requestData.status || 'pending', // Default status
                requestData.id // original_id
            ]
        );
        console.log("✅ Backup successful");
    } catch (error) {
        console.error("❌ Backup failed:", error);
        throw error; // Rethrow to handle in calling function
    }
};

const validateRequest = [
    check('last_name').notEmpty().trim().escape(),
    check('first_name').notEmpty().trim().escape(),
    check('sex').isIn(['Male', 'Female']),
    check('birthday').isISO8601(),
    check('contact_no').isMobilePhone(),
    check('email').isEmail().normalizeEmail(),
    check('address').notEmpty().trim().escape(),
    check('type_of_certificate').notEmpty().trim().escape(),
    check('purpose_of_request').notEmpty().trim().escape(),
    check('number_of_copies').isInt({ min: 1 })
];

router.post('/', validateRequest, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { last_name, first_name, middle_name, suffix, sex, birthday, 
                contact_no, email, address, type_of_certificate, 
                purpose_of_request, number_of_copies } = req.body;

        // Insert into main table
        const [result] = await pool.execute(
            `INSERT INTO requests 
             (last_name, first_name, middle_name, suffix, sex, birthday,
              contact_no, email, address, type_of_certificate, 
              purpose_of_request, number_of_copies)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                last_name, first_name, middle_name, suffix, sex, birthday,
                contact_no, email, address, type_of_certificate,
                purpose_of_request, number_of_copies
            ]
        );

        // Get the full inserted record
        const [newRequest] = await pool.execute(
            "SELECT * FROM requests WHERE id = ?", 
            [result.insertId]
        );

        if (newRequest.length === 0) {
            throw new Error("Failed to retrieve created request");
        }

        // Backup with all fields including original_id
        await backupRequest({
            ...newRequest[0],
            id: result.insertId // Ensure original_id gets set
        });

        res.status(201).json({ 
            success: true,
            requestId: result.insertId
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ 
            error: 'Request processing failed',
            details: error.message
        });
    }
});

// Add this to requestRoutes.js
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id, 
                   last_name, 
                   first_name, 
                   middle_name, 
                   suffix,
                   sex,
                   DATE_FORMAT(birthday, '%Y-%m-%d') as birthday,
                   contact_no,
                   email,
                   address,
                   type_of_certificate,
                   purpose_of_request,
                   number_of_copies,
                   DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
            FROM requests
            ORDER BY created_at DESC
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Failed to fetch requests", error: error.message });
    }
});

module.exports = router;
