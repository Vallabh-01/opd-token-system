
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  
  // Define the navigation function
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/doctors');
        setDoctors(res.data);
        if (res.data.length > 0) setSelectedDoc(res.data[0]._id);
      } catch (err) {
        console.error("Error fetching doctors", err);
      }
    };
    fetchDoctors();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/patients/book', {
        name,
        phone,
        doctorId: selectedDoc
      });
      
      alert("Booking Successful! Token: " + res.data.token);
      
      // FIX: Use 'navigate', not 'Maps'
      navigate('/status/' + res.data.patient._id); 
      
    } catch (err) {
      alert("Booking Failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="container">
      <div className="booking-card">
        <h1 className="title">🏥 OPD Booking</h1>
        <p className="subtitle">Get your token instantly</p>

        <form onSubmit={handleBook}>
          <div className="form-group">
            <label className="form-label">Select Doctor</label>
            <select 
              className="form-select"
              value={selectedDoc}
              onChange={(e) => setSelectedDoc(e.target.value)}
            >
              {doctors.length === 0 && <option>Loading doctors...</option>}
              {/* This .map is correct, leave it as is */}
              {doctors.map(doc => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} ({doc.clinicName})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <input 
              type="text" 
              placeholder="Patient Name" 
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input 
              type="tel" 
              placeholder="Phone Number" 
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <button className="btn-submit">
            Get Token Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;