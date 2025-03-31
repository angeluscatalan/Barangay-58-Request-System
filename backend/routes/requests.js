// requestsGet.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get request by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query("SELECT * FROM requests WHERE id = ?", [id]);
        if (result.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }
        res.json(result[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            error: 'Database operation failed',
            details: error.message
        });
    }
});

module.exports = router;
