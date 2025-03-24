const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const fs = require("fs");

const app = express();

const corsOptions = {
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/requests", require("./routes/requestRoutes")); 


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
});


pool.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL connection error:", err);
        return;
    }
    console.log("Connected to MySQL Database!");
    connection.release(); 
});

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

        await pool.query(sql, [
            lastName, firstName, middleName, suffix, sex, birthday,
            contactNo, email, address, certificateType, purpose, numberOfCopies, dateRequested
        ]);

        res.json({ message: "Request submitted successfully" });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Database error", error });
    }
});



module.exports = pool;

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
