const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const rbiController = require('../controllers/rbiController');

// ✅ Validate household complete registration (one request with head + members)
const validateCompleteHousehold = [
  // Household head validation
  check('household.head_last_name').notEmpty().trim().escape()
    .withMessage('Last name is required'),
  check('household.head_first_name').notEmpty().trim().escape()
    .withMessage('First name is required'),
  check('household.head_middle_name').notEmpty().trim().escape()
    .withMessage('Middle name is required'),
  check('household.head_suffix').optional().trim().escape(),
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
  check('household.sex').isIn(['Male', 'Female'])
    .withMessage('Sex must be either Male or Female'),
  check('household.civil_status').isIn(['Single', 'Married', 'Widowed', 'Separated', 'Divorced'])
    .withMessage('Invalid civil status'),
  check('household.citizenship').notEmpty().trim().escape()
    .withMessage('Citizenship is required'),
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
  check('members.*.suffix').optional().trim().escape(),
  check('members.*.birth_place').notEmpty().trim().escape()
    .withMessage('Member birth place is required'),
  check('members.*.birth_date').isISO8601()
    .withMessage('Invalid member birth date format'),
  check('members.*.sex').isIn(['Male', 'Female'])
    .withMessage('Member sex must be either Male or Female'),
  check('members.*.civil_status').isIn(['Single', 'Married', 'Widowed', 'Separated', 'Divorced'])
    .withMessage('Invalid member civil status'),
  check('members.*.citizenship').notEmpty().trim().escape()
    .withMessage('Member citizenship is required'),
  check('members.*.occupation').notEmpty().trim().escape()
    .withMessage('Member occupation is required')
];

// ✅ Validate household member for adding/updating
const validateMember = [
  check('last_name').notEmpty().trim().escape()
    .withMessage('Last name is required'),
  check('first_name').notEmpty().trim().escape()
    .withMessage('First name is required'),
  check('middle_name').notEmpty().trim().escape()
    .withMessage('Middle name is required'),
  check('suffix').optional().trim().escape(),
  check('birth_place').notEmpty().trim().escape()
    .withMessage('Birth place is required'),
  check('birth_date').isISO8601()
    .withMessage('Invalid birth date format'),
  check('sex').isIn(['Male', 'Female'])
    .withMessage('Sex must be either Male or Female'),
  check('civil_status').isIn(['Single', 'Married', 'Widowed', 'Separated', 'Divorced'])
    .withMessage('Invalid civil status'),
  check('citizenship').notEmpty().trim().escape()
    .withMessage('Citizenship is required'),
  check('occupation').notEmpty().trim().escape()
    .withMessage('Occupation is required')
];

// ✅ Validate status update
const validateStatusUpdate = [
  check('status').isIn(['pending', 'approved', 'rejected', 'for interview'])
    .withMessage('Invalid status value')
];

router.get('/test', (req, res) => {
  res.send('RBI Routes are working!');
});

router.post('/', validateCompleteHousehold, rbiController.createCompleteHousehold);
router.get('/', rbiController.getAllHouseholds);
router.get('/:id', rbiController.getHouseholdWithMembersById);
router.put('/:id', rbiController.updateHousehold);
router.put('/:id/status', validateStatusUpdate, rbiController.updateHouseholdStatus);
router.delete('/:id', rbiController.deleteHousehold);
router.post('/:id/members', validateMember, rbiController.addHouseholdMember);
router.put('/:id/members/:memberId', validateMember, rbiController.updateHouseholdMember);
router.delete('/members/:memberId', 
  rbiController.deleteHouseholdMember
);
router.get("/households", (req, res) => {
  rbiController.getAllHouseholds(req, res);
});
router.post('/find-similar', rbiController.findSimilarRbis);

module.exports = router;