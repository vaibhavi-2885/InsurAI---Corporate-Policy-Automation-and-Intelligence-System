import React, { useState } from 'react';
import axios from '../lib/httpClient';
import { useLocation, useNavigate } from 'react-router-dom';

const PolicyAmendment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Retrieve the policy object passed from the Dashboard
    const { policy } = location.state || {};

    const [formData, setFormData] = useState({
        changeType: 'ADDRESS',
        oldValue: policy?.policyId ? 'Current policy data will be referenced by ID.' : 'N/A', // Placeholder
        newValue: '',
    });
    const [processing, setProcessing] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    // Redirect if no policy data is found
    if (!policy) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h3 style={{ color: '#dc3545' }}>Error: Policy details missing.</h3>
                <p>Please select a policy from your <a href="/dashboard">Dashboard</a> to submit an amendment.</p>
            </div>
        );
    }
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setFeedback({ message: '', type: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setFeedback({ message: 'Submitting request...', type: 'info' });

        const requestData = {
            policyId: policy.policyId,
            changeType: formData.changeType,
            oldValue: formData.oldValue,
            newValue: formData.newValue,
            status: "PENDING"
        };

        try {
            await axios.post('/api/amendments/submit', requestData);
            
            setFeedback({ 
                message: `✅ Amendment Request Submitted! It is now PENDING Admin review.`, 
                type: 'success' 
            });
            
        } catch (error) {
            console.error("Error submitting amendment:", error);
            setFeedback({ 
                message: '❌ Submission Failed. Please try again.', 
                type: 'error' 
            });
        } finally {
            setProcessing(false);
        }
    };
    
    // Styling for feedback alerts
    const getFeedbackStyle = (type) => {
        switch (type) {
            case 'success': return { backgroundColor: '#d4edda', color: '#155724', borderLeft: '5px solid #28a745' };
            case 'error': return { backgroundColor: '#f8d7da', color: '#721c24', borderLeft: '5px solid #dc3545' };
            case 'info': default: return { backgroundColor: '#e6f2ff', color: '#004085', borderLeft: '5px solid #007bff' };
        }
    };

    return (
        <div style={{ padding: '40px 20px', maxWidth: '700px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', color: '#0056b3', marginBottom: '10px', fontSize: '30px' }}>
                Policy Amendment Request
            </h1>
            <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '30px', fontSize: '16px' }}>
                Policy ID: **#{policy.policyId}** - Policy Name: **Plan ID {policy.planId}**
            </p>

            {/* Amendment Form Card */}
            <div className="card" style={{ padding: '40px', borderLeft: '5px solid #0056b3' }}>
                
                {/* Feedback Message */}
                {feedback.message && (
                    <div style={{ ...getFeedbackStyle(feedback.type), padding: '15px', borderRadius: '5px', marginBottom: '25px', fontWeight: '600' }}>
                        {feedback.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    
                    {/* 1. Change Type */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Type of Change Required</label>
                        <select 
                            name="changeType"
                            value={formData.changeType} 
                            onChange={handleChange} 
                            required 
                            style={inputStyle}
                        >
                            <option value="ADDRESS">Change Residential Address</option>
                            <option value="NOMINEE">Update Nominee Details</option>
                            <option value="PHONE">Update Phone Number / Email</option>
                            <option value="COVERAGE">Request Coverage Change (Subject to Underwriting)</option>
                        </select>
                    </div>

                    {/* 2. Current Value (Context) */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Current Value (For reference)</label>
                        <input 
                            type="text"
                            name="oldValue"
                            value={formData.oldValue} 
                            onChange={handleChange} 
                            placeholder="e.g. Old Address or Current Nominee Name"
                            required 
                            style={{ ...inputStyle, backgroundColor: '#f9f9f9' }}
                        />
                    </div>
                    
                    {/* 3. New Value (Request) */}
                    <div style={{ marginBottom: '30px' }}>
                        <label style={labelStyle}>New Value Required (The Change)</label>
                        <textarea 
                            name="newValue"
                            value={formData.newValue} 
                            onChange={handleChange} 
                            required 
                            placeholder="Enter the complete new address, full new nominee details, or new contact number."
                            rows="5"
                            style={{ ...inputStyle, resize: 'vertical' }}
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={processing}
                        style={{ 
                            width: '100%', 
                            padding: '15px', 
                            backgroundColor: '#0056b3', 
                            color: 'white', 
                            fontWeight: '700',
                            fontSize: '18px',
                            boxShadow: '0 4px 15px rgba(0,86,179,0.3)'
                        }}
                    >
                        {processing ? 'Submitting...' : 'Submit Amendment Request'}
                    </button>
                    
                    <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
                        All requests are manually reviewed by an Administrator.
                    </p>
                </form>
            </div>
        </div>
    );
};

// --- STYLES ---
const labelStyle = {
    display: 'block', 
    marginBottom: '8px', 
    fontWeight: '600', 
    color: '#2c3e50', 
    fontSize: '14px'
};

const inputStyle = {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '16px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

export default PolicyAmendment;
