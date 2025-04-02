const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Authentication functions
exports.loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Find admin in database
        const [admin] = await pool.execute(
            "SELECT id, username, password FROM admin WHERE username = ?", 
            [username]
        );

        if (admin.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, admin[0].password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: admin[0].id, 
                username: admin[0].username 
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Set secure HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3600000 // 1 hour
        });

        res.json({ 
            success: true,
            message: "Login successful",
            user: { id: admin[0].id, username: admin[0].username }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            success: false,
            message: "Authentication failed",
            error: error.message 
        });
    }
};

// Middleware function 
exports.authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: "Authentication required" 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ 
                success: false,
                message: "Invalid or expired token" 
            });
        }
        
        req.user = decoded;
        next();
    });
};

exports.logoutAdmin = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });
    
    res.json({ 
        success: true,
        message: "Logout successful" 
    });
};