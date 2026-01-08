/* eslint-disable react-hooks/exhaustive-deps */
 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Status.css'; // Import the styles

const Status = () => {
  const { id } = useParams(); // Get patient ID from URL
  const [statusData, setStatusData] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/patients/status/${id}`);
      setStatusData(res.data);
    } catch (err) {
      console.error("Error fetching status", err);
    }
  };

  // Initial load and auto-refresh every 30 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [id]);

  if (!statusData) return <div className="status-container">Loading...</div>;

  return (
    <div className="status-container">
      <div className="status-card">
        <div className="status-header">Your Token Number</div>
        
        <div className="token-number">
          {statusData.yourToken}
        </div>
        
        <div className="info-row">
          <span className="info-label">Name:</span>
          <span className="info-value">{statusData.patientName}</span>
        </div>

        <div className="divider"></div>

        <div className="info-row">
          <span className="info-label">Current Serving:</span>
          <span className="info-value" style={{color: '#dc2626'}}>#{statusData.currentServing}</span>
        </div>

        <div className="info-row">
          <span className="info-label">People Ahead:</span>
          <span className="info-value">{statusData.peopleAhead}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Est. Wait Time:</span>
          <span className="info-value">{statusData.estimatedWaitTime} mins</span>
        </div>

        <button onClick={fetchStatus} className="refresh-btn">
          🔄 Refresh Status
        </button>
      </div>
    </div>
  );
};

export default Status;