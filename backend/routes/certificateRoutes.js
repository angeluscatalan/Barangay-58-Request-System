// certificateRoutes.js
const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { check } = require('express-validator');

const validateRequest = [
    check('requestData').exists().isObject(),
    check('requestData.type_of_certificate').isIn([
        'ClearanceCert', 
        'IndigencyCert', 
        'JobseekerCert', 
        'IDApp', 
        'BrgyCert'
    ]),
    check('requestData.s3_key').optional().isString()
];

router.post('/generate-pdf', validateRequest, certificateController.generatePDF);

module.exports = router;