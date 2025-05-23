const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.resolve(__dirname, '../certs/global-bundle.pem'))
    } : null
});

// dev only
if (process.env.NODE_ENV !== 'production') {
    pool.getConnection()
        .then(conn => {
            console.log('✅ MySQL connection successful');
            conn.release();
        })
        .catch(err => {
            console.error('❌ MySQL connection failed:', err);
        });
}

module.exports = pool;