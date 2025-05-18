const pool = require("../config/db");
const { validationResult } = require('express-validator');

const backupRequest = async (requestData) => {
    try {
        // Get all fields from the request
        const {
            last_name,
            first_name,
            middle_name,
            suffix,
            sex,
            birthday,
            contact_no,
            email,
            address,
            type_of_certificate,
            purpose_of_request,
            number_of_copies,
            status,
            created_at,
            id
        } = requestData;

        await pool.execute(
            `INSERT INTO backup_requests 
             (last_name, first_name, middle_name, suffix, sex, birthday, 
              contact_no, email, address, type_of_certificate, 
              purpose_of_request, number_of_copies, status, original_id, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                last_name,
                first_name,
                middle_name,
                suffix,
                sex,
                birthday,
                contact_no,
                email,
                address,
                type_of_certificate,
                purpose_of_request,
                number_of_copies,
                status || 'pending',
                id,
                created_at
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
        const {
            last_name,
            first_name,
            middle_name,
            suffix,
            sex,
            birthday,
            contact_no,
            email,
            address,
            type_of_certificate,
            purpose_of_request,
            number_of_copies
        } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO requests 
             (last_name, first_name, middle_name, suffix, sex, birthday,
              contact_no, email, address, type_of_certificate, 
              purpose_of_request, number_of_copies, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
            [
                last_name,
                first_name,
                middle_name,
                suffix,
                sex,
                birthday,
                contact_no,
                email,
                address,
                type_of_certificate,
                purpose_of_request,
                number_of_copies
            ]
        );

        res.status(201).json({
            success: true,
            requestId: result.insertId
        });
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({
            error: 'Request processing failed',
            details: error.message
        });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
        SELECT id, last_name, first_name, middle_name, suffix,
               sex, DATE_FORMAT(birthday, '%Y-%m-%d') as birthday,
               contact_no, email, address, type_of_certificate,
               purpose_of_request, number_of_copies, status,
               DATE_FORMAT(CONVERT_TZ(created_at, 'UTC', 'Asia/Manila'), '%Y-%m-%d %H:%i:%s') as created_at
        FROM requests
      `;

        const params = [];

        if (status) {
            query += ` WHERE LOWER(status) = LOWER(?)`;
            params.push(status);
        }

        query += ` ORDER BY created_at DESC`;

        const [rows] = await pool.query(query, params);
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

    const formattedStatus = statusLower;

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

exports.deleteRequest = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // First get the request data for backup
        const [request] = await connection.execute(
            "SELECT * FROM requests WHERE id = ?",
            [id]
        );

        if (request.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Request not found' });
        }

        // Create backup before deleting
        await backupRequest(request[0]);

        // Delete from main table
        const [result] = await connection.execute(
            "DELETE FROM requests WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Request not found' });
        }

        await connection.commit();
        res.json({ success: true, message: 'Request deleted and archived successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Database error:', error);
        res.status(500).json({
            error: 'Database operation failed',
            details: error.message
        });
    } finally {
        connection.release();
    }
};

// Get backup requests
exports.getBackupRequests = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id, last_name, first_name, middle_name, suffix,
                   sex, DATE_FORMAT(birthday, '%Y-%m-%d') as birthday,
                   contact_no, email, address, type_of_certificate,
                   purpose_of_request, number_of_copies, status,
                   DATE_FORMAT(CONVERT_TZ(created_at, 'UTC', 'Asia/Manila'), '%Y-%m-%d %H:%i:%s') as created_at,
                   original_id
            FROM backup_requests
            ORDER BY created_at DESC
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Failed to fetch backup requests", error: error.message });
    }
};

// Restore backup requests
exports.restoreRequests = async (req, res) => {
    const { requestIds } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        for (const id of requestIds) {
            // Get the backup request data
            const [backupRequest] = await connection.execute(
                "SELECT * FROM backup_requests WHERE id = ?",
                [id]
            );

            if (backupRequest.length === 0) {
                await connection.rollback();
                return res.status(404).json({ error: `Backup request with id ${id} not found` });
            }

            const requestData = backupRequest[0];

            // Get all fields from the backup request
            const {
                last_name,
                first_name,
                middle_name,
                suffix,
                sex,
                birthday,
                contact_no,
                email,
                address,
                type_of_certificate,
                purpose_of_request,
                number_of_copies,
                status,
                created_at
            } = requestData;

            // Insert into main requests table with all fields
            await connection.execute(
                `INSERT INTO requests 
                 (last_name, first_name, middle_name, suffix, sex, birthday,
                  contact_no, email, address, type_of_certificate,
                  purpose_of_request, number_of_copies, status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    last_name,
                    first_name,
                    middle_name,
                    suffix,
                    sex,
                    birthday,
                    contact_no,
                    email,
                    address,
                    type_of_certificate,
                    purpose_of_request,
                    number_of_copies,
                    status,
                    created_at
                ]
            );

            // Delete from backup table
            await connection.execute(
                "DELETE FROM backup_requests WHERE id = ?",
                [id]
            );
        }

        await connection.commit();
        res.json({ success: true, message: `Successfully restored ${requestIds.length} request(s)` });
    } catch (error) {
        await connection.rollback();
        console.error('Database error:', error);
        res.status(500).json({
            error: 'Database operation failed',
            details: error.message
        });
    } finally {
        connection.release();
    }
};