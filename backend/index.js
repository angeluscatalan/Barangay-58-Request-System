const express = require("express");
const multer = require("multer");
const cors = require("cors");
const mysql = require("mysql2");
const multerS3 = require("multer-s3");
require("dotenv").config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require('path');
const eventRoutes = require("./routes/eventRoutes");

const app = express();

const corsOptions = {
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
};

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: "barangay-images",
        acl: "public-read", 
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `uploads/${Date.now()}_${file.originalname}`);
        }
    })
});

const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/requests');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };


app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/requests", require("./routes/requestRoutes")); 
app.use("/events", eventRoutes);

const pool = mysql.createPool({
    host: "barangay-db.c1ga824sw14r.ap-southeast-1.rds.amazonaws.com",
    user: "admin",
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
        console.log("Connected to MySQL Database!");
        connection.release();
    } catch (err) {
        console.error("MySQL connection error:", err);
    }
})();

app.post("/requests", async (req, res) => {
    console.log("📥 Received request body:", req.body);

    try {
        const {
            lastName, firstName, middleName, suffix, sex, birthday,
            contactNo, email, address, certificateType, purpose, numberOfCopies, dateRequested
        } = req.body;

        if (!lastName || !firstName || !sex || !birthday || !contactNo || !email || !address || !certificateType || !purpose || !numberOfCopies || !dateRequested) {
            console.error("Missing required fields:", req.body);
            return res.status(400).json({ error: "Missing required fields", received: req.body });
        }

        const sql = `INSERT INTO requests 
                     (last_name, first_name, middle_name, suffix, sex, birthday, contact_no, email, address, type_of_certificate, purpose_of_request, number_of_copies, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] =await pool.execute(sql, [
            lastName, firstName, middleName, suffix, sex, birthday,
            contactNo, email, address, certificateType, purpose, numberOfCopies, dateRequested
        ]);

        res.json({ message: "Request submitted successfully" });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Database error", error });
    }
});

app.get("/events/published", async (req, res) => {
    try {
      const events = await Event.find({ published: true });
      res.json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


module.exports = pool;

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
