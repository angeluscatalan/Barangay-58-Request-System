const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { check } = require('express-validator');
const pool = require('../config/db');

const validateRequest = [
  check('last_name').notEmpty().trim().escape(),
  check('first_name').notEmpty().trim().escape(),
  check('middle_name').optional().trim().escape(),
  check('suffix_id').optional().isInt().toInt(),
  check('sex').isInt({ min: 1 }).withMessage('Invalid sex selection'),
  check('sex_other')
    .if(check('sex').equals('4'))
    .notEmpty()
    .withMessage('Please specify your gender'),
  check('birthday').isISO8601().toDate(),
  check('contact_no').isMobilePhone(),
  check('email').isEmail().normalizeEmail(),
  check('address').notEmpty().trim().escape(),
  check('certificate_id').isInt({ min: 1 }).withMessage('Please select a valid certificate type'),
  check('purpose_of_request').notEmpty().trim().escape(),
  check('number_of_copies').isInt({ min: 1 })
];

// Basic data endpoints
router.get('/suffixes', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM suffixes ORDER BY id");
    res.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/certificates', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM certificates ORDER BY name");
    res.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/statuses', requestController.getStatuses);

// Request endpoints
router.post('/', validateRequest, requestController.createRequest);
router.get('/', requestController.getRequests);
router.get('/:id', requestController.getRequestById);
router.put('/:id/status', requestController.updateRequestStatus);
router.delete('/:id', requestController.deleteRequest);
router.post('/:id/generate-control-id', requestController.generateControlId);

// Backup endpoints
router.get('/backup/list', requestController.getBackupRequests);
router.post('/backup/restore', requestController.restoreRequests);

module.exports = router;