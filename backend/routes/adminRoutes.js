const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Authentication routes
router.post("/login", authController.loginAdmin);
router.post("/logout", authController.logoutAdmin);

module.exports = router;