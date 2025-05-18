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
const certificateRoutes = require("./routes/certificateRoutes")

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
  optionsSuccessStatus: 204,
}));

// API Routes with /api prefix
app.use("/api/rbi", rbiRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/households', rbiRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/certificates", certificateRoutes);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀Server running on port ${PORT}`);
});

module.exports = app;