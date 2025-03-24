const mysql = require('mysql2/promise'); // Using promise version
const fs = require('fs');
const path = require('path');

// Get absolute path to certificate
const certPath = path.resolve(__dirname, '../certs/global-bundle.pem');

// Verify certificate exists
if (!fs.existsSync(certPath)) {
    console.error('SSL certificate not found at:', certPath);
    process.exit(1);
}

const pool = mysql.createPool({
    host: process.env.DB_HOST || "barangay-db.c1ga824sw14r.ap-southeast-1.rds.amazonaws.com",
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "ga94PAWrPQKmdb8VylSq",
    database: process.env.DB_NAME || "barangayDB",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: process.env.NODE_ENV === 'production', // Strict in production
        ca: fs.readFileSync(certPath)
    }
});

// Test connection immediately
pool.getConnection()
    .then(conn => {
        console.log('Successfully connected to MySQL database');
        conn.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

module.exports = pool;