const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Route imports
const rbiRoutes = require("./routes/rbiRoutes")
const eventRoutes = require("./routes/eventRoutes");
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");

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

// Routes
app.use('/rbi', rbiRoutes);
app.use("/requests", requestRoutes);
app.use('/events', eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);


// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀Server running on port ${PORT}`);
});

module.exports = app;