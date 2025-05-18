const pool = require("../config/db");

// Create event
exports.createEvent = async (req, res) => {
    try {
        if (!req.body.event_name || !req.body.event_date) {
            return res.status(400).json({ message: 'Event name and date are required' });
        }

        let imageUrl = null;
        if (req.file) {
            // Handle image upload if needed
            imageUrl = req.file.path;
        }

        // Insert into archive_events table
        const [result] = await pool.execute(
            `INSERT INTO archive_events 
             (event_name, event_date, time_start, time_end, venue, description, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.body.event_name,
                req.body.event_date,
                req.body.time_start,
                req.body.time_end,
                req.body.venue,
                req.body.description,
                imageUrl
            ]
        );

        res.status(201).json({
            message: 'Event created successfully',
            id: result.insertId,
            imageUrl
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            message: 'Failed to create event',
            error: error.message
        });
    }
};

// Update event
exports.updateEvent = async (req, res) => {
    const { id } = req.params;
    try {
        let imageUrl = req.body.image_url; // Keep existing image URL if not updated
        if (req.file) {
            // Handle new image upload if provided
            imageUrl = req.file.path;
        }

        const [result] = await pool.execute(
            `UPDATE archive_events 
             SET event_name = ?, 
                 event_date = ?,
                 time_start = ?,
                 time_end = ?,
                 venue = ?,
                 description = ?,
                 image_url = ?
             WHERE id = ?`,
            [
                req.body.event_name,
                req.body.event_date,
                req.body.time_start,
                req.body.time_end,
                req.body.venue,
                req.body.description,
                imageUrl,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({
            message: 'Event updated successfully',
            imageUrl
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            message: 'Failed to update event',
            error: error.message
        });
    }
};

// Get all events
exports.getEvents = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                id, 
                event_name,
                DATE_FORMAT(event_date, '%Y-%m-%d') as event_date,
                TIME_FORMAT(time_start, '%H:%i') as time_start,
                TIME_FORMAT(time_end, '%H:%i') as time_end, 
                venue, 
                description, 
                image_url, 
                CONVERT_TZ(created_at, 'UTC', 'Asia/Manila') as created_at
            FROM archive_events
            ORDER BY created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: "Failed to fetch events", error: error.message });
    }
};

// Delete event
exports.deleteEvent = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Get the event data before deleting
        const [event] = await connection.execute(
            "SELECT * FROM archive_events WHERE id = ?",
            [id]
        );

        if (event.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Event not found" });
        }

        // Backup the event before deletion
        await connection.execute(
            `INSERT INTO backup_events 
             (event_name, event_date, time_start, time_end, venue, description, image_url, original_id, backup_type, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                event[0].event_name,
                event[0].event_date,
                event[0].time_start,
                event[0].time_end,
                event[0].venue,
                event[0].description,
                event[0].image_url,
                id,
                'delete',
                event[0].created_at // Preserve the original timestamp
            ]
        );

        // Delete from main table
        await connection.execute(
            "DELETE FROM archive_events WHERE id = ?",
            [id]
        );

        await connection.commit();
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting event:', error);
        res.status(500).json({
            message: 'Failed to delete event',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Get backup events
exports.getBackupEvents = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                id,
                event_name,
                DATE_FORMAT(event_date, '%Y-%m-%d') as event_date,
                TIME_FORMAT(time_start, '%H:%i') as time_start,
                TIME_FORMAT(time_end, '%H:%i') as time_end,
                venue,
                description,
                image_url,
                CONVERT_TZ(created_at, 'UTC', 'Asia/Manila') as created_at,
                original_id,
                backup_type
            FROM backup_events 
            ORDER BY created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching backup events:', error);
        res.status(500).json({ message: "Failed to fetch backup events", error: error.message });
    }
};

// Restore events from backup
exports.restoreEvents = async (req, res) => {
    const { eventIds } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        for (const id of eventIds) {
            // Get the backup event data
            const [backupEvent] = await connection.execute(
                "SELECT * FROM backup_events WHERE id = ?",
                [id]
            );

            if (backupEvent.length === 0) {
                await connection.rollback();
                return res.status(404).json({ error: `Backup event with id ${id} not found` });
            }

            const eventData = backupEvent[0];

            // Insert into main events table with original timestamp
            await connection.execute(
                `INSERT INTO archive_events 
                 (event_name, event_date, time_start, time_end, venue, description, image_url, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    eventData.event_name,
                    eventData.event_date,
                    eventData.time_start,
                    eventData.time_end,
                    eventData.venue,
                    eventData.description,
                    eventData.image_url,
                    eventData.created_at // Preserve the original timestamp
                ]
            );

            // Delete from backup table
            await connection.execute(
                "DELETE FROM backup_events WHERE id = ?",
                [id]
            );
        }

        await connection.commit();
        res.json({ success: true, message: `Successfully restored ${eventIds.length} event(s)` });
    } catch (error) {
        await connection.rollback();
        console.error('Error restoring events:', error);
        res.status(500).json({ error: 'Failed to restore events', details: error.message });
    } finally {
        connection.release();
    }
}; 