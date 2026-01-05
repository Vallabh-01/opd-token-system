// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const app = express();

// Middleware (Allows the server to accept JSON data)
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// A simple route to test if the server is working
app.get("/", (req, res) => {
  res.send("API is running...");
});


// Start the Server
const PORT = process.env.PORT || 5000;
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes); // <--- ADD THIS 2 (Before app.listen)
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});