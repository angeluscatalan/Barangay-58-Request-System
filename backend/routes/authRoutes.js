const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const pool = require('../config/db');


// Existing auth routes
router.post('/login', authController.loginAdmin);
router.post('/logout', authController.logoutAdmin);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);

router.get('/me', authController.authenticateToken, authController.getCurrentUser);

  module.exports = router;
  