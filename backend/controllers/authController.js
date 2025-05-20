const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1] || req.cookies.token;
    
    console.log("Received token:", token ? "Yes" : "No");
  
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(403).json({ message: "Invalid or expired token" });
      }
  
      console.log("Token verified, user:", decoded);
      req.user = decoded;
      next();
    });
  };
  
// Temporary storage for verification codes (use Redis in production)
const verificationCodes = {};

// Password Reset Functions
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      // Validate input
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }
  
      // Check if email exists
      const [admin] = await pool.execute(
        "SELECT id, username, password, access_level FROM admin WHERE username = ?", 
        [email]
    );
  
      if (admin.length === 0) {
        return res.status(404).json({ success: false, message: "Email not found" });
      }
  
      // Generate 6-digit code
      const code = crypto.randomInt(100000, 999999).toString();
      verificationCodes[email] = {
        code,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes expiry
        adminId: admin[0].id
      };
  
      // Send email
      await transporter.sendMail({
        from: `"Barangay 58 Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Code',
        html: `
          <h2>Password Reset Request</h2>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 15 minutes.</p>
        `
      });
  
      res.json({ 
        success: true,
        message: "Verification code sent to email"
      });
  
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to process password reset",
        error: error.message 
      });
    }
  };

  exports.verifyResetCode = async (req, res) => {
    const { email, code } = req.body;
  
    try {
      // Validate input
      if (!email || !code) {
        return res.status(400).json({ success: false, message: "Email and code are required" });
      }
  
      const storedCode = verificationCodes[email];
  
      // Check if code exists and matches
      if (!storedCode || storedCode.code !== code) {
        return res.status(400).json({ success: false, message: "Invalid verification code" });
      }
  
      // Check if code has expired
      if (Date.now() > storedCode.expiresAt) {
        delete verificationCodes[email];
        return res.status(400).json({ success: false, message: "Verification code has expired" });
      }
  
      res.json({ 
        success: true,
        message: "Code verified successfully",
        tempToken: jwt.sign(
          { email, code, adminId: storedCode.adminId },
          process.env.JWT_SECRET,
          { expiresIn: '15m' }
        )
      });
  
    } catch (error) {
      console.error("Verify code error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to verify code",
        error: error.message 
      });
    }
  };
  
  exports.resetPassword = async (req, res) => {
    const { tempToken, newPassword, confirmPassword } = req.body;
  
    try {
      // Validate input
      if (!tempToken || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
  
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match" });
      }
  
      // Verify temp token
      const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      const { email, code, adminId } = decoded;
  
      // Verify code again
      const storedCode = verificationCodes[email];
      if (!storedCode || storedCode.code !== code || storedCode.adminId !== adminId) {
        return res.status(400).json({ success: false, message: "Invalid token" });
      }
  
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update password in database
      await pool.execute(
        "UPDATE admin SET password = ? WHERE id = ?",
        [hashedPassword, adminId]
      );
  
      // Clear the used code
      delete verificationCodes[email];
  
      res.json({ 
        success: true,
        message: "Password reset successfully" 
      });
  
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to reset password",
        error: error.message 
      });
    }
  };

// Authentication functions
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log("Login attempt with:", { username, passwordLength: password?.length });
    
    // Find admin in database (include archive status in the query)
    const [admin] = await pool.execute(
      "SELECT id, username, email, password, access_level, archive FROM admin WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)", 
      [username, username]
    );

    if (admin.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is archived/disabled
    if (admin[0].archive === 'YES') {
      return res.status(403).json({ 
        message: "Account disabled. Please contact the administrator." 
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin[0].password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const user = admin[0];
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        access_level: user.access_level 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set cookie and respond
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000 // 1 hour
    });

    res.json({ 
      success: true,
      message: "Login successful",
      token: token,
      user: { 
        id: user.id, 
        username: user.username,
        access_level: user.access_level
      }
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

exports.logoutAdmin = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
    
    res.json({ 
      success: true,
      message: "Logout successful" 
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error.message
    });
  }
};
  
  exports.getCurrentUser = async (req, res) => {
      try {
        const [user] = await pool.execute(
          "SELECT id, username, access_level FROM admin WHERE id = ?",
          [req.user.id]
        )
        if (user.length === 0) {
          return res.status(404).json({ success: false, message: "User not found" })
        }
        res.json({ 
          success: true,
          ...user[0] 
        })
      } catch (error) {
        console.error("Error fetching user:", error)
        res.status(500).json({ success: false, message: "Failed to fetch user data" })
      }
    }

exports.verifyAdmin = (req, res, next) => {
  this.authenticateToken(req, res, () => {
    console.log("User access level:", req.user.access_level) // Log the actual value
    
    // Updated check to handle both numeric and string admin values
    if (req.user.access_level !== 'admin' && req.user.access_level !== 2) {
      return res.status(403).json({ 
        message: "Admin access required",
        details: {
          receivedAccessLevel: req.user.access_level,
          expected: "Either 'admin' or 2"
        }
      });
    }
    next();
  });
};

exports.verifyPassword = async (req, res) => {
  const { password } = req.body;
  const adminId = req.user.id;

  try {
    const [rows] = await pool.execute('SELECT password FROM admin WHERE id = ?', [adminId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({ message: 'Password verified' });

  } catch (err) {
    console.error('Error verifying password:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};