// server/routes/doctorRoutes.js
const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");

// ROUTE: POST /api/doctors/add
// DESC: Create a new doctor (One time setup)
router.post("/add", async (req, res) => {
  try {
    const { name, clinicName } = req.body;

    // Create new doctor in database
    const newDoctor = new Doctor({
      name,
      clinicName,
      currentToken: 0, // Starts at 0
      isAvailable: true
    });

    await newDoctor.save();
    
    res.status(201).json({ message: "✅ Doctor Created!", doctor: newDoctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;