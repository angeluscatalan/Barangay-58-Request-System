const express = require('express');
const router = express.Router();
const multer = require("multer");
const eventsController = require("../controllers/eventsController");

const upload = multer({ 
    dest: "uploads/",
    limits: { fileSize: 2 * 1024 * 1024 } 
});

router.post('/', upload.single('image'), eventsController.createEvent);
router.get('/', eventsController.getEvents);
router.put('/:id', upload.single('image'), eventsController.updateEvent);
router.delete('/:id', eventsController.deleteEvent);

module.exports = router;