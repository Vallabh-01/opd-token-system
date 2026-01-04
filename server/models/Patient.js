// server/models/Patient.js
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  
  // Links this patient to the doctor
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Doctor", 
    required: true 
  },
  
  tokenNumber: { type: Number, required: true },
  
  status: { 
    type: String, 
    enum: ["Waiting", "In Progress", "Completed", "Cancelled"], 
    default: "Waiting" 
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Patient", patientSchema);