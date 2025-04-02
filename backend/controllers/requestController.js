const pool = require("../config/db");
const { validationResult } = require('express-validator');

const backupRequest = async (requestData) => {
    try {
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
                requestData.status || 'Pending',
                requestData.id
            ]
        );
    } catch (error) {
        console.error("Backup failed:", error);
        throw error;
    }
};

exports.createRequest = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { last_name, first_name, middle_name, suffix, sex, birthday, 
                contact_no, email, address, type_of_certificate, 
                purpose_of_request, number_of_copies } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO requests 
             (last_name, first_name, middle_name, suffix, sex, birthday,
              contact_no, email, address, type_of_certificate, 
              purpose_of_request, number_of_copies, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
            [
                last_name, first_name, middle_name, suffix, sex, birthday,
                contact_no, email, address, type_of_certificate,
                purpose_of_request, number_of_copies
            ]
        );

        await backupRequest({
            last_name, first_name, middle_name, suffix, sex, birthday,
            contact_no, email, address, type_of_certificate,
            purpose_of_request, number_of_copies,
            id: result.insertId
        });

        res.status(201).json({ 
            success: true,
            requestId: result.insertId
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Request processing failed',
            details: error.message
        });
    }
};

exports.getRequests = async (req, res) => {
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
                   status,
                   DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
            FROM requests
            ORDER BY created_at DESC
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Failed to fetch requests", error: error.message });
    }
};

exports.getRequestById = async (req, res) => {
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
};

exports.updateRequestStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const statusLower = status.toLowerCase();
    const validStatuses = ['pending', 'approved', 'rejected', 'for pickup'];
    
    if (!validStatuses.includes(statusLower)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    const formattedStatus = statusLower.charAt(0).toUpperCase() + statusLower.slice(1);

    try {
        const [result] = await pool.query(
            `UPDATE requests SET status = ? WHERE id = ?`, 
            [formattedStatus, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            error: 'Database operation failed',
            details: error.message
        });
    }
};