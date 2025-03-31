const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET request by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT * FROM requests WHERE id = ?`, 
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            error: 'Database operation failed',
            details: error.message
        });
    }
});

// PUT request to update status
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    console.log("Updating ID:", id, "New Status:", status);

    // Validate status before updating
    if (!['Pending', 'Approved', 'Rejected', 'For Pickup'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    try {
        // Check if the request exists first
        const [rows] = await pool.query(`SELECT id FROM requests WHERE id = ?`, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Perform the update
        const [result] = await pool.query(
            `UPDATE requests SET status = ? WHERE id = ?`, 
            [status, id]
        );

        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            error: 'Database operation failed',
            details: error.message
        });
    }
});

module.exports = router;
