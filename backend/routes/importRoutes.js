// routes/importRoutes.js
const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');
const authController = require('../controllers/authController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post(
  '/import-database',
  authController.authenticateToken,
  authController.verifyAdmin,
  upload.single('sqlFile'),
  importController.importDatabase
);

module.exports = router;