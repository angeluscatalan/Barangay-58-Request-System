const express = require('express');
const router = express.Router();
const multer = require("multer");
const eventController = require("../controllers/eventController");

const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 2 * 1024 * 1024 }
});

router.post('/', upload.single('image'), eventController.createEvent);
router.get('/', eventController.getEvents);
router.put('/:id', upload.single('image'), eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

// Backup routes
router.get('/backup/list', eventController.getBackupEvents);
router.post('/backup/restore', eventController.restoreEvents);

module.exports = router;