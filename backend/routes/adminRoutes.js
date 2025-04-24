const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

// Correct route with proper middleware chain
router.get('/accounts', 
  authController.authenticateToken, // Verify JWT first
  adminController.requireAccountsAccess, // Then check access level
  adminController.getAllAccounts // Finally get accounts
);

module.exports = router;