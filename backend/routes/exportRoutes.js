const express = require('express')
const router = express.Router()
const exportController = require('../controllers/exportController')
const authController = require('../controllers/authController')

router.get(
  '/export-database',
  authController.authenticateToken,
  authController.verifyAdmin,
  exportController.exportDatabase
)

module.exports = router