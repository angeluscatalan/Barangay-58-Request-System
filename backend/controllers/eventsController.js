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
        fs.unlinkSync(file.path);
    }
};

const deleteImageFromS3 = async (imageUrl) => {
    try {
        const imageKey = imageUrl.split(".com/")[1];
        await s3.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageKey
        }));
    } catch (error) {
        console.error("Error deleting image from S3:", error);
        throw error;
    }
};

// Database operations
const createEventRecord = async (table, eventData) => {
    const [result] = await pool.execute(
        `INSERT INTO ${table} 
         (event_name, event_date, time_start, time_end, venue, description, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            eventData.name || eventData.eventName,
            eventData.date || eventData.eventDate,
            eventData.timeStart || null,
            eventData.timeEnd || null,
            eventData.venue || null,
            eventData.description || null,
            eventData.imageUrl || null
        ]
    );
    return result;
};

const backupEvent = async (eventData, type = 'create') => {
    await pool.execute(
        `INSERT INTO backup_events 
         (event_name, event_date, time_start, time_end, venue, description, image_url, original_id, backup_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            eventData.name || eventData.eventName,
            eventData.date || eventData.eventDate,
            eventData.timeStart || null,
            eventData.timeEnd || null,
            eventData.venue || null,
            eventData.description || null,
            eventData.imageUrl || null,
            eventData.id,
            type
        ]
    );
};

// Controller methods
exports.createEvent = async (req, res) => {
    try {
        if (!req.body.name || !req.body.date) {
            return res.status(400).json({ message: 'Event name and date are required' });
        }

        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadImageToS3(req.file);
        }

        // Only create in main events table
        const result = await createEventRecord('archive_events', {
            ...req.body,
            imageUrl
        });

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

exports.deleteEvent = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;

        // Get the full event data from main table
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

        const eventData = event[0];
        
        // Archive to backup_events
        await connection.execute(
            `INSERT INTO backup_events 
             (event_name, event_date, time_start, time_end, venue, description, image_url, original_id, backup_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                eventData.event_name,
                eventData.event_date ? new Date(eventData.event_date).toISOString().split('T')[0] : null,
                eventData.time_start,
                eventData.time_end,
                eventData.venue,
                eventData.description,
                eventData.image_url,
                id,
                'delete' // Mark as deleted
            ]
        );

        // Delete image from S3 if exists
        if (eventData.image_url) {
            await deleteImageFromS3(eventData.image_url);
        }

        // Delete from main table
        const [result] = await connection.execute(
            "DELETE FROM archive_events WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        await connection.commit();
        res.status(200).json({
            success: true,
            message: "Event deleted and archived successfully"
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error deleting event:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete event",
            error: error.message
        });
    } finally {
        connection.release();
    }
};

exports.updateEvent = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        let imageUrl = null;

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

        if (req.file) {
            imageUrl = await uploadImageToS3(req.file);
            // Delete old image if exists
            if (existingEvent[0]?.image_url) {
                await deleteImageFromS3(existingEvent[0].image_url);
            }
        } else {
            imageUrl = existingEvent[0].image_url;
        }

        let updateQuery = `UPDATE archive_events SET
            event_name = ?,
            event_date = ?,
            time_start = ?,
            time_end = ?,
            venue = ?,
            description = ?`;

        const queryParams = [
            req.body.name,
            req.body.date,
            req.body.timeStart,
            req.body.timeEnd,
            req.body.venue,
            req.body.description
        ];

        if (imageUrl) {
            updateQuery += `, image_url = ?`;
            queryParams.push(imageUrl);
        }

        updateQuery += ` WHERE id = ?`;
        queryParams.push(id);

        const [result] = await connection.execute(updateQuery, queryParams);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Event not updated'
            });
        }

        await connection.commit();
        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            imageUrl: imageUrl || null
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