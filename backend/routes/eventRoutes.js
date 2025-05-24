const express = require('express');
const router = express.Router();
const multer = require("multer");
const eventsController = require("../controllers/eventsController");
const { authenticateToken, verifyAdmin } = require("../controllers/authController"); 

router.use(authenticateToken);
router.use(verifyAdmin);

const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 2 * 1024 * 1024 }
});

// Main event routes
router.post('/', upload.single('image'), eventsController.createEvent);
router.get('/', eventsController.getEvents);
router.put('/:id', upload.single('image'), eventsController.updateEvent);
router.delete('/:id', eventsController.deleteEvent);

// Backup routes
router.get('/backup/list', eventsController.getBackupEvents);
router.post('/backup/restore', eventsController.restoreEvents);

module.exports = router;