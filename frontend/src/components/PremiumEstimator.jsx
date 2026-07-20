import React, { useState } from 'react';
import axios from 'axios';

// The onResult prop allows this component to "talk" to the Chatbot
const PremiumEstimator = ({ onResult }) => {
  const [formData, setFormData] = useState({
    age: '',
    healthHistory: '',
    occupation: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Connecting to your Spring Boot UnderwritingController
      const response = await axios.post('http://localhost:8080/api/v1/underwriting/evaluate', formData);
      
      setResult(response.data);

      // 🔥 REAL-WORLD TRIGGER: Pass the data to the parent (App.js) 
      // so the Chatbot can react to it
      if (onResult) {
        onResult(response.data);
      }
    } catch (error) {
      console.error("Error evaluating risk:", error);
      alert("Backend connection failed. Ensure Spring Boot is running on port 8080.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '600px', margin: '40px auto' }}>
      <h2 style={{ color: '#0056b3', marginBottom: '20px', textAlign: 'center' }}>Real-Time Premium Estimator</h2>
      
      <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="number" name="age" placeholder="Enter Age" 
          onChange={handleChange} required 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
        />
        <textarea 
          name="healthHistory" placeholder="Health History (e.g., Diabetes, None, Chronic)" 
          onChange={handleChange} required 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }} 
        />
        <input 
          type="text" name="occupation" placeholder="Occupation (e.g., Engineer, Construction)" 
          onChange={handleChange} required 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
        />
        <button 
          type="submit" 
          style={{ padding: '12px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? "Processing Assessment..." : "Get Instant Quote"}
        </button>
      </form>

      {result && (
        <div style={{ mt: '25px', padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '8px', borderLeft: '5px solid #0056b3', marginTop: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Assessment Result</h3>
          <p><strong>Decision:</strong> <span style={{ color: result.decision === 'REJECTED_HIGH_RISK' ? '#d9534f' : '#5cb85c' }}>{result.decision}</span></p>
          <p><strong>Risk Score:</strong> {result.riskScore}/100</p>
          <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#0056b3', marginTop: '10px' }}>Estimated Monthly Premium: ₹{result.estimatedMonthlyPremium}</p>
          <p style={{ fontSize: '0.85em', color: '#666', fontStyle: 'italic' }}>*Our AI Assistant has been notified to help you with next steps.</p>
        </div>
      )}
    </div>
  );
};

export default PremiumEstimator;