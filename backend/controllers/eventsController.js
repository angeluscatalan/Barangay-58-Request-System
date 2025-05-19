const pool = require("../config/db");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

// Initialize S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Utility functions
const uploadImageToS3 = async (file) => {
    try {
        const fileContent = fs.readFileSync(file.path);
        const fileName = `events/${Date.now()}-${file.originalname}`;

        await s3.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: fileContent,
            ContentType: file.mimetype
        }));

        const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        return imageUrl;
    } catch (error) {
        console.error("S3 upload failed:", error);
        throw error;
    } finally {
        // Clean up the temporary file
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
    }
};

const deleteImageFromS3 = async (imageUrl) => {
    if (!imageUrl) return;

    try {
        const imageKey = imageUrl.split(".com/")[1];
        await s3.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageKey
        }));
    } catch (error) {
        console.error("Error deleting image from S3:", error);
        // Don't throw the error - just log it and continue
        // This prevents the deletion of the database record from failing
    }
};

// Create event
exports.createEvent = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        if (!req.body.event_name || !req.body.event_date) {
            return res.status(400).json({ message: 'Event name and date are required' });
        }

        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadImageToS3(req.file);
        }

        // Insert into archive_events table
        const [result] = await connection.execute(
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

        await connection.commit();
        res.status(201).json({
            message: 'Event created successfully',
            id: result.insertId,
            imageUrl
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating event:', error);
        res.status(500).json({
            message: 'Failed to create event',
            error: error.message
        });
    } finally {
        connection.release();
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
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            message: 'Failed to fetch events',
            error: error.message
        });
    }
};

// Update event
exports.updateEvent = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;

        // Get existing event
        const [existingEvent] = await connection.execute(
            "SELECT * FROM archive_events WHERE id = ?",
            [id]
        );

        if (existingEvent.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        let imageUrl = existingEvent[0].image_url;
        if (req.file) {
            // Upload new image
            imageUrl = await uploadImageToS3(req.file);
            // Delete old image if exists
            if (existingEvent[0].image_url) {
                await deleteImageFromS3(existingEvent[0].image_url);
            }
        }

        // Update the event
        const [result] = await connection.execute(
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

        await connection.commit();
        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            imageUrl
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update event',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Delete event
exports.deleteEvent = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;

        // Get the event data before deleting
        const [event] = await connection.execute(
            "SELECT * FROM archive_events WHERE id = ?",
            [id]
        );

        if (event.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Backup the event
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
                event[0].created_at
            ]
        );

        // Delete image from S3 if exists
        if (event[0].image_url) {
            await deleteImageFromS3(event[0].image_url);
        }

        // Delete from main table
        await connection.execute(
            "DELETE FROM archive_events WHERE id = ?",
            [id]
        );

        await connection.commit();
        res.status(200).json({
            success: true,
            message: "Event deleted and archived successfully"
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
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
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching backup events:', error);
        res.status(500).json({
            message: "Failed to fetch backup events",
            error: error.message
        });
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
                return res.status(404).json({
                    success: false,
                    error: `Backup event with id ${id} not found`
                });
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
                    eventData.created_at
                ]
            );

            // Delete from backup table
            await connection.execute(
                "DELETE FROM backup_events WHERE id = ?",
                [id]
            );
        }

        await connection.commit();
        res.status(200).json({
            success: true,
            message: `Successfully restored ${eventIds.length} event(s)`
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error restoring events:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to restore events',
            details: error.message
        });
    } finally {
        connection.release();
    }
};