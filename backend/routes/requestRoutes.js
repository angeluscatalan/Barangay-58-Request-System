const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { check, validationResult } = require('express-validator');

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

        const [result] = await pool.query(
            `INSERT INTO requests SET ?`, 
            {
                last_name, first_name, middle_name, suffix, sex, birthday,
                contact_no, email, address, type_of_certificate,
                purpose_of_request, number_of_copies,
            }
        );

        res.status(201).json({ 
            success: true,
            requestId: result.insertId
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            error: 'Database operation failed',
            details: error.message
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const [results] = await pool.query("SELECT * FROM requests");
        res.json(results);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            error: 'Database operation failed',
            details: error.message
        });
    }
});


// GET single request
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM requests WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database operation failed' });
    }
});

// PUT update request status
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE requests SET status = ? WHERE id = ?',
            [status, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database operation failed' });
    }
});
module.exports = router;