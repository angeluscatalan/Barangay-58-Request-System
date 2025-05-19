const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadRequestImage } = require('../controllers/reqimgController');

// Configure multer for in-memory file handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.post('/upload', upload.single('image'), uploadRequestImage);

module.exports = router;