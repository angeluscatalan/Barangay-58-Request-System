const express = require('express');
const pool = require('./database');

const app = express();
app.use(express.json()); 


app.get('/requests', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM requests");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});