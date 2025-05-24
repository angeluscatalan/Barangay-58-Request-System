const express = require('express');
const router = express.Router();
const multer = require("multer");
const eventsController = require("../controllers/eventsController");
const { authenticateToken, authorizeAdmin } = require("../Middleware/authMiddleware"); 

const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 2 * 1024 * 1024 }
});

// Public routes (no authentication needed)
router.get('/', eventsController.getEvents);

// Protected routes (require admin authentication)
router.post('/', authenticateToken, authorizeAdmin, upload.single('image'), eventsController.createEvent);
router.put('/:id', authenticateToken, authorizeAdmin, upload.single('image'), eventsController.updateEvent);
router.delete('/:id', authenticateToken, authorizeAdmin, eventsController.deleteEvent);

// Backup routes (require admin authentication)
router.get('/backup/list', authenticateToken, authorizeAdmin, eventsController.getBackupEvents);
router.post('/backup/restore', authenticateToken, authorizeAdmin, eventsController.restoreEvents);

module.exports = router;