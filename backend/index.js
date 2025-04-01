const express = require("express");
const multer = require("multer");
const cors = require("cors");
const mysql = require("mysql2");
const multerS3 = require("multer-s3");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { S3Client } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const eventRoutes = require("./routes/eventRoutes.js");
const authRoutes = require("./routes/adminRoutes");

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));

app.use("/requests", require("./routes/requestRoutes"));
app.use('/events', eventRoutes);
app.use("/api/auth", authRoutes); 

const pool = require('./config/db');

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL Database!");
    connection.release();
  } catch (err) {
    console.error("❌ MySQL connection error:", err);
  }
})();

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Barangay API!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
