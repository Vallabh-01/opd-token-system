// server/routes/patientRoutes.js
const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// ROUTE: POST /api/patients/book
// DESC: Book a new token
router.post("/book", async (req, res) => {
  try {
    const { name, phone, doctorId } = req.body;

    // 1. Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // 2. Find the last token issued for this doctor today
    // (We sort by tokenNumber in descending order and take the first one)
    const lastPatient = await Patient.findOne({ doctorId })
      .sort({ tokenNumber: -1 });

    // 3. Assign next token (If no patient, start at 1)
    const nextToken = lastPatient ? lastPatient.tokenNumber + 1 : 1;

    // 4. Create the new patient
    const newPatient = new Patient({
      name,
      phone,
      doctorId,
      tokenNumber: nextToken,
      status: "Waiting"
    });

    await newPatient.save();

    res.status(201).json({ 
      message: "✅ Booking Successful!", 
      token: nextToken, 
      patient: newPatient 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ROUTE: GET /api/patients/status/:tokenId
// DESC: Get live status of a specific token
router.get("/status/:tokenId", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.tokenId).populate("doctorId");
    
    if (!patient) {
      return res.status(404).json({ error: "Token not found" });
    }

    // Calculate people ahead: 
    // All patients for this doctor who have a lower token number than 'patient' 
    // AND are still 'Waiting'
    const peopleAhead = await Patient.countDocuments({
      doctorId: patient.doctorId._id,
      tokenNumber: { $lt: patient.tokenNumber },
      status: "Waiting"
    });

    res.json({
      patientName: patient.name,
      yourToken: patient.tokenNumber,
      currentServing: patient.doctorId.currentToken,
      peopleAhead: peopleAhead,
      estimatedWaitTime: peopleAhead * 10 // Assuming 10 mins per patient
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;