const express = require('express');
const router = express.Router();
const multer = require("multer");
const eventsController = require("../controllers/eventsController");

const upload = multer({ dest: "uploads/" });

router.post('/archive', upload.single('image'), eventsController.archiveEvent);
router.get('/archive', eventsController.getArchivedEvents);
router.delete('/archive/:id', eventsController.deleteArchivedEvent);
router.post('/upload', upload.single('image'), eventsController.uploadEvent);
router.get("/published", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM events WHERE status = 'published'");
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Database query failed" });
    }
  });

module.exports = router;
