const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { authorizeAdmin } = require('../Middleware/authMiddleware'); // Import from authMiddleware


// Apply admin protection to all routes in this router
router.use(authController.authenticateToken); // Verify JWT for all admin routes
router.use(authorizeAdmin); // Require admin role for all routes

// Now all routes below will require both authentication AND admin role
router.get('/accounts', adminController.getAllAccounts);
router.post('/accounts', adminController.createAccount);
router.put('/accounts/:id', adminController.updateAccount);

module.exports = router;