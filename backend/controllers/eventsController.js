const pool = require("../config/db");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// ✅ Archive an event (UPLOAD + SAVE to DB)
exports.archiveEvent = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const fileContent = fs.readFileSync(req.file.path);
    const fileName = `events/${Date.now()}-${req.file.originalname}`;
    
    try {
        await s3.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: fileContent,
            ContentType: req.file.mimetype
        }));
        
        const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        const { eventName, eventDate, timeStart, timeEnd, venue, description } = req.body;
        
        await pool.execute(
            `INSERT INTO archive_events (event_name, event_date, time_start, time_end, venue, description, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [eventName, eventDate, timeStart, timeEnd, venue, description, imageUrl]
        );

        res.status(201).json({ message: 'Event archived successfully', imageUrl });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error processing request', error });
    }
};

// ✅ Get all archived events
exports.getArchivedEvents = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id, event_name, DATE_FORMAT(event_date, '%Y-%m-%d') as event_date,
                   TIME_FORMAT(time_start, '%H:%i') as time_start,
                   TIME_FORMAT(time_end, '%H:%i') as time_end, venue, description, image_url, created_at
            FROM archive_events
            ORDER BY created_at DESC
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Failed to fetch events', error: error.message });
    }
};

// ✅ Delete an archived event (REMOVE FROM DB + DELETE IMAGE FROM S3)
exports.deleteArchivedEvent = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.execute("SELECT image_url FROM archive_events WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Event not found" });

        const imageKey = rows[0].image_url.split(".com/")[1];

        await s3.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imageKey
        }));

        await pool.execute("DELETE FROM archive_events WHERE id = ?", [id]);

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ message: "Failed to delete event", error: error.message });
    }
};

// ✅ Upload a new event
exports.uploadEvent = async (req, res) => {
    if (!req.body.name || !req.body.date) {
        return res.status(400).json({ message: 'Missing required fields (name and date are required)' });
    }

    let imageUrl = null;

    if (req.file) {
        try {
            const fileContent = fs.readFileSync(req.file.path);
            const fileName = `events/${Date.now()}-${req.file.originalname}`;
            
            await s3.send(new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileName,
                Body: fileContent,
                ContentType: req.file.mimetype,
            }));

            imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
            fs.unlinkSync(req.file.path);
        } catch (error) {
            console.error('File processing error:', error);
            return res.status(500).json({ message: 'Failed to process image upload' });
        }
    }

    try {
        const [result] = await pool.execute(
            `INSERT INTO archive_events (event_name, event_date, time_start, time_end, venue, description, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.body.name, req.body.date, req.body.timeStart || null, req.body.timeEnd || null, req.body.venue || null, req.body.description || null, imageUrl]
        );

        res.status(201).json({ message: 'Event uploaded successfully', id: result.insertId, imageUrl });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
};

// ✅ Get all published events
exports.getPublishedEvents = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id, event_name AS name, DATE_FORMAT(event_date, '%Y-%m-%d') as date,
                   TIME_FORMAT(time_start, '%H:%i') as timeStart,
                   TIME_FORMAT(time_end, '%H:%i') as timeEnd, venue, description, image_url AS imageUrl
            FROM archive_events
            ORDER BY event_date DESC
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Failed to fetch published events', error: error.message });
    }
};
