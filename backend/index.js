const express = require("express");
const multer = require("multer");
const cors = require("cors");
const mysql = require("mysql2");
const multerS3 = require("multer-s3");
require("dotenv").config();
const { S3Client } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const eventRoutes = require("./routes/eventRoutes.js");

const app = express();

const corsOptions = {
  origin: "https://barangay-58-request-system-development.vercel.app", 
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

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/requests", require("./routes/requestRoutes"));
app.use('/events', eventRoutes);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: "ga94PAWrPQKmdb8VylSq",
  database: "barangayDB",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(__dirname + "/certs/global-bundle.pem")
  }
}).promise();

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

app.post("/requests", async (req, res) => {
  try {
    const {
      lastName,
      firstName,
      middleName,
      suffix,
      sex,
      birthday,
      contactNo,
      email,
      address,
      certificateType,
      purpose,
      numberOfCopies,
      dateRequested,
    } = req.body;

    if (!lastName || !firstName || !sex || !birthday || !contactNo || !email || !address || !certificateType || !purpose || !numberOfCopies || !dateRequested) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = `INSERT INTO requests 
                 (last_name, first_name, middle_name, suffix, sex, birthday, contact_no, email, address, type_of_certificate, purpose_of_request, number_of_copies, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await pool.execute(sql, [
      lastName, firstName, middleName, suffix, sex, birthday,
      contactNo, email, address, certificateType, purpose, numberOfCopies, dateRequested
    ]);

    res.json({ message: "Request submitted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Database error", error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
