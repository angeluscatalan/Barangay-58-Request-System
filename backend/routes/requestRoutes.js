const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { check } = require('express-validator');

const validateRequest = [
    check('last_name').notEmpty().trim().escape(),
    check('first_name').notEmpty().trim().escape(),
    check('sex').isIn(['Male', 'Female']),
    check('birthday').isISO8601(),
    check('contact_no').isMobilePhone(),
    check('email').isEmail().normalizeEmail(),
    check('address').notEmpty().trim().escape(),
    check('type_of_certificate').notEmpty().trim().escape(),
    check('purpose_of_request').notEmpty().trim().escape(),
    check('number_of_copies').isInt({ min: 1 })
];

router.post('/', validateRequest, requestController.createRequest);
router.get('/', requestController.getRequests);
router.get('/:id', requestController.getRequestById);
router.put('/:id', requestController.updateRequestStatus);
router.delete('/:id', requestController.deleteRequest);

module.exports = router;