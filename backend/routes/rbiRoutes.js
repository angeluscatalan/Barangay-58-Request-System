const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const rbiController = require('../controllers/rbiController');
const { authenticateToken } = require('../Middleware/authMiddleware');

// ✅ Validate household complete registration (one request with head + members)
const validateCompleteHousehold = [
  // Household head validation
  check('household.head_last_name').notEmpty().trim().escape()
    .withMessage('Last name is required'),
  check('household.head_first_name').notEmpty().trim().escape()
    .withMessage('First name is required'),
  check('household.head_middle_name').notEmpty().trim().escape()
    .withMessage('Middle name is required'),
  check('household.head_suffix_id').optional().isInt()
    .withMessage('Head suffix ID must be an integer'),
  check('household.house_unit_no').notEmpty().trim().escape()
    .withMessage('House/Unit no. is required'),
  check('household.street_name').notEmpty().trim().escape()
    .withMessage('Street name is required'),
  check('household.subdivision').notEmpty().trim().escape()
    .withMessage('Subdivision/Sitio/Purok is required'),
  check('household.birth_place').notEmpty().trim().escape()
    .withMessage('Birth place is required'),
  check('household.birth_date').isISO8601()
    .withMessage('Invalid birth date format'),
  check('household.sex')
    .notEmpty().withMessage('Sex is required')
    .isInt().withMessage('Sex must be an integer ID')
    .custom((value, { req }) => {
      // If sex is 'Other' (assuming ID for 'Other' is 4), then sex_other is required
      if (parseInt(value) === 4 && (!req.body.household.sex_other || req.body.household.sex_other.trim() === '')) {
        throw new Error('Please specify sex when selecting "Other"');
      }
      return true;
    }),
  check('household.sex_other').optional().trim().escape(),
  check('household.civil_status').isIn(['Single', 'Married', 'Widowed', 'Separated', 'Divorced'])
    .withMessage('Invalid civil status'),
  check('household.citizenship').notEmpty().trim().escape()
    .withMessage('Citizenship is required'),
  check('household.citizenship_other').optional().trim().escape(),
  check('household.occupation').notEmpty().trim().escape()
    .withMessage('Occupation is required'),
  check('household.email_address').isEmail().normalizeEmail()
    .withMessage('Valid email address is required'),

  // Members validation (if there are any)
  check('members.*.last_name').notEmpty().trim().escape()
    .withMessage('Member last name is required'),
  check('members.*.first_name').notEmpty().trim().escape()
    .withMessage('Member first name is required'),
  check('members.*.middle_name').notEmpty().trim().escape()
    .withMessage('Member middle name is required'),
  check('members.*.suffix_id').optional().isInt()
    .withMessage('Member suffix ID must be an integer'),
  check('members.*.birth_place').notEmpty().trim().escape()
    .withMessage('Member birth place is required'),
  check('members.*.birth_date').isISO8601()
    .withMessage('Invalid member birth date format'),
  check('members.*.sex')
    .notEmpty().withMessage('Member sex is required')
    .isInt().withMessage('Member sex must be an integer ID')
    .custom((value, { req, path }) => {
      const index = path.match(/\[(\d+)\]/)[1];
      if (parseInt(value) === 4 && (!req.body.members[index].sex_other || req.body.members[index].sex_other.trim() === '')) {
        throw new Error('Please specify member sex when selecting "Other"');
      }
      return true;
    }),
  check('members.*.sex_other').optional().trim().escape(),
  check('members.*.civil_status').isIn(['Single', 'Married', 'Widowed', 'Separated', 'Divorced'])
    .withMessage('Invalid member civil status'),
  check('members.*.citizenship').notEmpty().trim().escape()
    .withMessage('Member citizenship is required'),
  check('members.*.citizenship_other').optional().trim().escape(),
  check('members.*.occupation').notEmpty().trim().escape()
    .withMessage('Member occupation is required'),
  check('members.*.relationship_id').notEmpty().isInt()
    .withMessage('Relationship to household leader is required and must be an integer'),
  check('members.*.relationship_other').optional().trim().escape()
];

// ✅ Validate household member for adding/updating
const validateMember = [
  check('last_name').notEmpty().trim().escape()
    .withMessage('Last name is required'),
  check('first_name').notEmpty().trim().escape()
    .withMessage('First name is required'),
  check('middle_name').optional().trim().escape(), // Make middle_name optional
  check('suffix_id').optional().isInt()
    .withMessage('Suffix ID must be an integer'),
  check('birth_place').notEmpty().trim().escape()
    .withMessage('Birth place is required'),
  check('birth_date').isISO8601()
    .withMessage('Invalid birth date format'),
  check('sex')
    .notEmpty().withMessage('Sex is required')
    .isInt().withMessage('Sex must be an integer ID')
    .custom((value, { req }) => {
      if (parseInt(value) === 4 && (!req.body.sex_other || req.body.sex_other.trim() === '')) {
        throw new Error('Please specify sex when selecting "Other"');
      }
      return true;
    }),
  check('sex_other').optional().trim().escape(),
  check('civil_status').isIn(['Single', 'Married', 'Widowed', 'Separated', 'Divorced'])
    .withMessage('Invalid civil status'),
  check('citizenship').notEmpty().trim().escape()
    .withMessage('Citizenship is required'),
  check('citizenship_other').optional().trim().escape(),
  check('occupation').notEmpty().trim().escape()
    .withMessage('Occupation is required'),
  // Make relationship_id optional for add member modal (if not used in UI)
  check('relationship_id').optional().isInt()
    .withMessage('Relationship to household leader must be an integer'),
  check('relationship_other').optional().trim().escape()
];

// ✅ Validate status update
const validateStatusUpdate = [
  check('status').isIn(['pending', 'approved', 'rejected', 'for interview'])
    .withMessage('Invalid status value')
];

// Public routes (no authentication required)
router.post('/', validateCompleteHousehold, rbiController.createCompleteHousehold);
router.post('/find-similar', rbiController.findSimilarRbis);

// Apply authentication middleware for protected routes
router.use(authenticateToken);

// Admin RBI routes
router.get('/', rbiController.getAllHouseholds);
router.get('/:id', rbiController.getHouseholdWithMembersById);
router.put('/:id', rbiController.updateHousehold);
router.put('/:id/status', validateStatusUpdate, rbiController.updateHouseholdStatus);
router.delete('/:id', rbiController.deleteHousehold);
router.post('/:id/members', validateMember, rbiController.addHouseholdMember);
router.put('/:id/members/:memberId', validateMember, rbiController.updateHouseholdMember);
router.delete('/members/:memberId', rbiController.deleteHouseholdMember);

// Backup routes
router.get('/backup/list', rbiController.getBackupRBIs);
router.post('/backup/restore', rbiController.restoreRBIs);

// Additional routes (duplicate of router.get('/') above, can be removed if redundant)
router.get("/households", rbiController.getAllHouseholds);

module.exports = router;