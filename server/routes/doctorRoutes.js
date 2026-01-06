// server/routes/doctorRoutes.js
const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

// 1. Create a new doctor
router.post("/add", async (req, res) => {
  try {
    const { name, clinicName } = req.body;
    const newDoctor = new Doctor({ name, clinicName, currentToken: 0, isAvailable: true });
    await newDoctor.save();
    res.status(201).json({ message: "✅ Doctor Created!", doctor: newDoctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Doctor calls the next patient (UPDATED WITH VALIDATION)
// This version checks if a patient actually exists before moving the number forward.
router.put("/next-token", async (req, res) => {
  try {
    const { doctorId } = req.body;
    const doctor = await Doctor.findById(doctorId);
    
    // Check if there is a patient waiting for the NEXT number
    const nextTokenNumber = doctor.currentToken + 1;
    const nextPatient = await Patient.findOne({ 
      doctorId, 
      tokenNumber: nextTokenNumber 
    });

    if (!nextPatient) {
      return res.status(400).json({ 
        message: "No more patients in the queue!" 
      });
    }

    // If patient exists, move the doctor forward
    doctor.currentToken = nextTokenNumber;
    await doctor.save();

    // Mark previous as Completed
    await Patient.findOneAndUpdate(
      { doctorId, tokenNumber: doctor.currentToken - 1 },
      { status: "Completed" }
    );
    
    // Mark current as In Progress
    nextPatient.status = "In Progress";
    await nextPatient.save();

    res.json({
      message: `Now serving Token #${doctor.currentToken}`,
      patientName: nextPatient.name
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get the list of all waiting patients (The "Queue")
router.get("/queue/:doctorId", async (req, res) => {
  try {
    const queue = await Patient.find({ doctorId: req.params.doctorId, status: "Waiting" })
      .sort({ tokenNumber: 1 });
    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get daily summary stats
router.get("/stats/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    // Use Promise.all to run all counts at the same time (faster)
    const [total, waiting, completed] = await Promise.all([
      Patient.countDocuments({ doctorId }),
      Patient.countDocuments({ doctorId, status: "Waiting" }),
      Patient.countDocuments({ doctorId, status: "Completed" })
    ]);

    res.json({
      totalPatients: total,
      stillWaiting: waiting,
      completedToday: completed,
      lastTokenIssued: total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Emergency/Specific Token Call
router.put("/call-specific", async (req, res) => {
  try {
    const { doctorId, tokenNumber } = req.body;

    // Update Doctor's current serving token
    const doctor = await Doctor.findByIdAndUpdate(
      doctorId, 
      { currentToken: tokenNumber }, 
      { new: true }
    );

    // Mark this specific patient as "In Progress"
    const patient = await Patient.findOneAndUpdate(
      { doctorId, tokenNumber },
      { status: "In Progress" },
      { new: true }
    );

    res.json({ 
      message: `Emergency: Now calling Token #${tokenNumber}`, 
      patientName: patient ? patient.name : "Unknown" 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Cancel a token
router.put("/cancel/:tokenId", async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.tokenId, { status: "Cancelled" }, { new: true });
    res.json({ message: "Token cancelled", patient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Reset queue for the day
router.put("/reset", async (req, res) => {
  try {
    const { doctorId } = req.body;
    await Doctor.findByIdAndUpdate(doctorId, { currentToken: 0 });
    await Patient.deleteMany({ doctorId });
    res.json({ message: "Queue reset successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Get list of all doctors (For the patient selection screen)
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;