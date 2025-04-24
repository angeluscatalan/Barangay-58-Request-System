// backend/controllers/adminController.js
const pool = require("../config/db");

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