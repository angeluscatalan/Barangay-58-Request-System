const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.loginAdmin = async (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt for:", username); // Debug

    try {
        const [rows] = await pool.execute("SELECT * FROM admin WHERE username = ?", [username]);
        console.log("DB results:", rows); // Debug

        if (rows.length === 0) {
            console.log("User not found"); // Debug
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const admin = rows[0];
        console.log("Stored hash:", admin.password); // Debug

        const match = await bcrypt.compare(password, admin.password);
        console.log("Password match:", match); // Debug

        if (!match) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 3600000
        });

        res.json({ message: "Login successful" });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
