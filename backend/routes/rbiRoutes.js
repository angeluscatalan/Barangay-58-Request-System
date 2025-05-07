const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const rbiController = require('../controllers/rbiController');

// ✅ Household validation
const validateHousehold = [
  check('head_last_name').notEmpty().trim().escape(),
  check('head_first_name').notEmpty().trim().escape(),
  check('head_middle_name').notEmpty().trim().escape(),
  check('head_suffix').optional().trim().escape(),
  check('house_unit_no').notEmpty().trim().escape(),
  check('street_name').notEmpty().trim().escape(),
  check('subdivision').notEmpty().trim().escape(),
  check('email_address').isEmail().normalizeEmail()
];

// ✅ Member validation
const validateMember = [
  check('household_id').isInt(),
  check('last_name').notEmpty().trim().escape(),
  check('first_name').notEmpty().trim().escape(),
  check('middle_name').notEmpty().trim().escape(),
  check('suffix').optional().trim().escape(),
  check('birth_place').notEmpty().trim().escape(),
  check('birth_date').isISO8601(),
  check('sex').isIn(['Male', 'Female']),
  check('civil_status').notEmpty().trim().escape(),
  check('citizenship').notEmpty().trim().escape(),
  check('occupation').notEmpty().trim().escape()
];

// ✅ ROUTES

// Test
router.get('/test', (req, res) => {
  res.send('RBI Routes are working!');
});

// Households
router.post('/households', validateHousehold, rbiController.createHousehold);
router.get('/households', rbiController.getAllHouseholds);
router.get('/households/:id', rbiController.getRBIRegistrationById);
router.put('/households/:id', rbiController.updateRBIStatus); // to change status: pending/approved/etc.

// Household Members
router.post('/members', validateMember, rbiController.addHouseholdMember);
router.get('/members/:householdId', rbiController.getMembersByHouseholdId);

module.exports = router;
