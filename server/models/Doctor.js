// server/models/Doctor.js
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, default: "General Physician" },
  clinicName: { type: String, default: "My Clinic" },
  
  // This tracks which token is currently inside the cabin
  currentToken: { type: Number, default: 0 },
  
  isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model("Doctor", doctorSchema);