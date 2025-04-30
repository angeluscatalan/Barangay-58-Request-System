const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const rbiController = require('../controllers/rbiController');

const validateRBI = [
  check('last_name').notEmpty().trim().escape(),
  check('first_name').notEmpty().trim().escape(),
  check('middle_name').notEmpty().trim().escape(),
  check('suffix').optional().trim().escape(),
  check('house_unit_no').notEmpty().trim().escape(),
  check('street_name').notEmpty().trim().escape(),
  check('subdivision').notEmpty().trim().escape(),
  check('birth_place').notEmpty().trim().escape(),
  check('birth_date').isISO8601(),
  check('sex').isIn(['Male', 'Female']),
  check('civil_status').isIn(['Single', 'Married', 'Widowed', 'Separated', 'Divorced']),
  check('citizenship').notEmpty().trim().escape(),
  check('occupation').notEmpty().trim().escape(),
  check('email_address').isEmail().normalizeEmail()
];

router.post('/', validateRBI, rbiController.createRBIRegistration);
module.exports = router;
