const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.loginAdmin);

module.exports = router;
