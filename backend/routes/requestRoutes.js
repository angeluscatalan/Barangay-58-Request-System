const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { check } = require('express-validator');
const pool = require('../config/db');

// import your auth guards
const { ensureAuthenticated, ensureAdmin } = require('../Middleware/authMiddleware');

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

// ───── Public endpoints ──────────────────────────────────────────────────────────
// Anyone can fetch these lists (used to populate your form UI)
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

// Public form submission (consider rate-limit or CAPTCHA here!)
router.post('/', validateRequest, requestController.createRequest);


// ───── Authenticated / Role-Protected endpoints ─────────────────────────────────
// All routes below this line require at least “logged in”
router.use(ensureAuthenticated);

// View your own or all requests (depending on role logic in the controller)
router.get('/', requestController.getRequests);
router.get('/:id', requestController.getRequestById);

// Only admins can change state or delete
router.put('/:id/status', ensureAdmin, requestController.updateRequestStatus);
router.delete('/:id', ensureAdmin, requestController.deleteRequest);
router.post('/:id/generate-control-id', ensureAdmin, requestController.generateControlId);

// Backup endpoints—admin only
router.get('/backup/list', ensureAdmin, requestController.getBackupRequests);
router.post('/backup/restore', ensureAdmin, requestController.restoreRequests);

module.exports = router;
