const express = require('express')
const router = express.Router()
const exportController = require('../controllers/exportController')
const authController = require('../controllers/authController')

// GET route (if you want to keep it)
router.get(
  '/export-database',
  authController.authenticateToken,
  authController.verifyAdmin,
  exportController.exportDatabase
)

// POST route for password-protected export
router.post(
  '/export-database',
  authController.authenticateToken,
  authController.verifyAdmin,
  exportController.exportDatabase
)

module.exports = router