import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FileClaim = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ reason: '', amount: '', date: '' });
    const [processing, setProcessing] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    // Hardcoded Policy ID #1 for demo (In a real app, user selects which policy)
    const policyId = 1;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFeedback({ message: '', type: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setFeedback({ message: 'Submitting claim...', type: 'info' });

        const claimAmountFloat = parseFloat(formData.amount);

        if (isNaN(claimAmountFloat) || claimAmountFloat <= 0) {
            setFeedback({ message: 'Claim amount must be a positive number.', type: 'error' });
            setProcessing(false);
            return;
        }

        const claimData = {
            policyId: policyId,
            incidentDate: formData.date,
            reason: formData.reason,
            claimAmount: claimAmountFloat,
            status: "PENDING"
        };

        try {
            const response = await axios.post('http://localhost:8080/api/claims/file', claimData);
            
            if (response.data.status === "APPROVED") {
                setFeedback({ 
                    message: `🎉 INSTANT APPROVAL! Claim (₹${claimAmountFloat}) auto-approved by AI. Funds will be disbursed in 24 hours.`, 
                    type: 'success' 
                });
                
            } else {
                setFeedback({ 
                    message: `✅ Claim submitted successfully! Status: PENDING Review. Check your dashboard for updates.`, 
                    type: 'info' 
                });
            }
            
            // Clear form upon success
            setFormData({ reason: '', amount: '', date: '' });

        } catch (error) {
            console.error("Error filing claim:", error);
            setFeedback({ 
                message: '❌ Submission Failed. Check backend connection.', 
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
            <h1 style={{ textAlign: 'center', color: '#dc3545', marginBottom: '10px' }}>
                File an Insurance Claim
            </h1>
            <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '30px' }}>
                Initiate your claim process online for policy **#{policyId}**.
            </p>

            {/* Claim Submission Card */}
            <div className="card" style={{ padding: '30px', borderLeft: '5px solid #dc3545' }}>
                
                {/* Feedback Message */}
                {feedback.message && (
                    <div style={{ ...getFeedbackStyle(feedback.type), padding: '15px', borderRadius: '5px', marginBottom: '20px', fontWeight: '600' }}>
                        {feedback.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    
                    {/* 1. Date and Reason Group */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={labelStyle}>Incident Date 📅</label>
                            <input 
                                type="date" 
                                name="date"
                                value={formData.date} 
                                onChange={handleChange} 
                                required 
                                max={new Date().toISOString().split('T')[0]} // Cannot claim for future date
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={labelStyle}>Claim Amount (₹)</label>
                            <input 
                                type="number" 
                                name="amount"
                                value={formData.amount} 
                                onChange={handleChange} 
                                required 
                                placeholder="e.g., 5000" 
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* 2. Reason/Description */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={labelStyle}>Reason & Description 📝</label>
                        <textarea 
                            name="reason"
                            value={formData.reason} 
                            onChange={handleChange} 
                            required 
                            placeholder="Briefly describe the incident (e.g., Bike accident, hospitalization, house burglary)."
                            rows="4"
                            style={{ ...inputStyle, resize: 'vertical' }}
                        ></textarea>
                    </div>

                    {/* AI Auto-Approve Tip */}
                    <p style={{ fontSize: '14px', color: '#0056b3', textAlign: 'center', marginBottom: '20px', border: '1px dashed #0056b350', padding: '10px', borderRadius: '5px', fontWeight: '600' }}>
                        💡 **AI Automation Tip:** Claims under ₹500 may be approved instantly!
                    </p>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={processing}
                        style={{ 
                            width: '100%', 
                            padding: '15px', 
                            backgroundColor: '#dc3545', 
                            color: 'white', 
                            fontWeight: '700',
                            fontSize: '18px',
                            boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
                        }}
                    >
                        {processing ? 'Processing Claim...' : 'Submit Claim'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const labelStyle = {
    display: 'block', 
    marginBottom: '8px', 
    fontWeight: '600', 
    color: '#495057', 
    fontSize: '14px'
};

const inputStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '16px',
};

export default FileClaim;