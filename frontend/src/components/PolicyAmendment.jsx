import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const PolicyAmendment = () => {
    const { policyId: urlPolicyId } = useParams(); // Get ID from URL parameter
    const navigate = useNavigate();

    const [policy, setPolicy] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        changeType: 'ADDRESS',
        oldValue: '',
        newValue: '',
    });
    const [processing, setProcessing] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    // --- Data Fetching (Simulate fetching policy details, as the GET user API was removed) ---
    useEffect(() => {
        // This is a placeholder to load policy data when the user lands on the page (e.g., via refresh)
        const fetchPlaceholderPolicy = () => {
            if (urlPolicyId) {
                setPolicy({ 
                    policyId: parseInt(urlPolicyId), 
                    planId: 1, 
                    premiumPaid: 15000, 
                    endDate: '2026-12-31' 
                });
                setFormData(prev => ({
                    ...prev, 
                    oldValue: `Current policy data (ID #${urlPolicyId}) will be referenced by Admin.`
                }));
            }
            setIsLoading(false);
        };
        
        fetchPlaceholderPolicy();
    }, [urlPolicyId]);


    if (!policy && !isLoading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h3 style={{ color: '#dc3545' }}>Error: Policy Not Found</h3>
                <p>Could not load policy details for ID #{urlPolicyId}.</p>
                <button 
                    onClick={() => navigate('/dashboard')}
                    style={{ backgroundColor: '#0056b3', color: 'white', padding: '10px 20px', borderRadius: '5px' }}
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }
    
    if (isLoading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Policy Details...</div>;
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
            await axios.post('http://localhost:8080/api/amendments/submit', requestData);
            
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
    
    const labelStyle = {
        display: 'block', 
        marginBottom: '8px', 
        fontWeight: '600', 
        color: '#2c3e50', 
        fontSize: '14px'
    };


    return (
        <div style={{ padding: '40px 20px', maxWidth: '700px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', color: '#0056b3', marginBottom: '10px', fontSize: '30px' }}>
                Policy Amendment Request
            </h1>
            <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '30px', fontSize: '16px' }}>
                Policy ID: **#{policy.policyId}** - Renewal Date: **{policy.endDate}**
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
                            <option value="COVERAGE">Request Coverage Change</option>
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
                            placeholder="Current value being changed"
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
                            placeholder="Enter the complete new information (e.g., new address line 1, line 2, city, pin)."
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

export default PolicyAmendment;