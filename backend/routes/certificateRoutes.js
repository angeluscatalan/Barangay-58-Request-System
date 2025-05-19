const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

// Generate PDF endpoint
router.post('/generate-pdf', certificateController.generatePDF);

module.exports = router;