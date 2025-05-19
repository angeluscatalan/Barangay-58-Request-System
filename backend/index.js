require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Route imports
const rbiRoutes = require("./routes/rbiRoutes")
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const apiRoutes = require("./routes/api");
const exportRoutes = require("./routes/exportRoutes"); 
const importRoutes = require('./routes/importRoutes');
const reqimgRoutes = require('./routes/reqimgRoute');

// Express app setup
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
}));

// API Routes with /api prefix
// Mount feature-specific routes first
app.use("/api/rbi", rbiRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/export", exportRoutes); 
app.use('/api/import', importRoutes);
app.use('/api/images', reqimgRoutes);

// Mount general API routes last
app.use("/api", apiRoutes);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀Server running on port ${PORT}`);
});

module.exports = app;