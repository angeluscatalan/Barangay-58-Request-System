const pool = require("../config/db");
const bcrypt = require('bcrypt');

exports.requireAdmin = (req, res, next) => {
    const user = req.user;
  
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
  
    // Only allow users with access_level 2 (Staff)
    if (user.access_level !== 2) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient privileges" });
    }
  
    next();
  };
  
  exports.requireAccountsAccess = (req, res, next) => {
    console.log("Current user access level:", req.user.access_level);
    
    // Only allow access_level 2 (Staff)
    if (req.user.access_level !== 2) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied. Requires Staff privileges." 
      });
    }
    next();
  };

exports.getAllAccounts = async (req, res) => {
  try {
    const [accounts] = await pool.execute(
      "SELECT id, username, email, access_level, archive FROM admin"
    );
    res.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch accounts" 
    });
  }
};

// Add new account
exports.createAccount = async (req, res) => {
  const { username, email, password, access_level = 1 } = req.body;

  try {
    // Validate all required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required: username, email, password" 
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email format" 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters" 
      });
    }

    // Check for existing account
    const [existing] = await pool.execute(
      "SELECT id FROM admin WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Username or email already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new account with all required fields
    const [result] = await pool.execute(
      "INSERT INTO admin (username, email, password, access_level, archive) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, access_level, 'NO'] // Default archive to 'NO'
    );

    res.status(201).json({ 
      success: true,
      message: "Account created successfully",
      accountId: result.insertId 
    });

  } catch (error) {
    console.error("Database error:", {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    
    res.status(500).json({ 
      success: false, 
      message: "Database operation failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update account
exports.updateAccount = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, access_level, archive } = req.body;

  try {
    // Validate input
    if (!username || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "Username and email are required" 
      });
    }

    // Check if account exists
    const [account] = await pool.execute(
      "SELECT id FROM admin WHERE id = ?",
      [id]
    );

    if (account.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Account not found" 
      });
    }

    let updateQuery = "UPDATE admin SET username = ?, email = ?";
    const queryParams = [username, email];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ", password = ?";
      queryParams.push(hashedPassword);
    }

    if (access_level !== undefined) {
      updateQuery += ", access_level = ?";
      queryParams.push(access_level);
    }


    updateQuery += ", archive = ?";
    queryParams.push(archive || 'NO');

    updateQuery += " WHERE id = ?";
    queryParams.push(id);

    console.log("Executing query:", updateQuery, queryParams);

    await pool.execute(updateQuery, queryParams);

    const [updatedAccount] = await pool.execute(
      "SELECT id, username, email, access_level, archive FROM admin WHERE id = ?",
      [id]
    );

    res.json({ 
      success: true,
      message: "Account updated successfully",
      account: updatedAccount[0]
    });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update account" 
    });
  }
};