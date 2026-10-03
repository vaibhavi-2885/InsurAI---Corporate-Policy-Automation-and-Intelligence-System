import React, { useState } from 'react';
import axios from '../lib/httpClient';
import { useNavigate } from 'react-router-dom';

const GrievanceForm = () => {
    const navigate = useNavigate();
    
    // Get logged in user ID from localStorage
    const userId = localStorage.getItem('userId') || 1; 

    const [formData, setFormData] = useState({
        type: 'FEEDBACK',
        description: '',
        priority: 'LOW',
    });
    const [processing, setProcessing] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });


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
            userId: userId,
            type: formData.type,
            description: formData.description,
            priority: formData.priority,
            status: "NEW"
        };

        try {
            await axios.post('/api/grievances/submit', requestData);
            
            setFeedback({ 
                message: `✅ Thank you! Your submission has been logged successfully. We will review it shortly.`, 
                type: 'success' 
            });
            setFormData({ type: 'FEEDBACK', description: '', priority: 'LOW' }); // Clear form

        } catch (error) {
            console.error("Grievance submission error:", error);
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

    const inputStyle = {
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #ced4da',
        width: '100%',
        boxSizing: 'border-box',
        fontSize: '16px',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: '15px'
    };
    
    const labelStyle = {
        display: 'block', 
        marginBottom: '8px', 
        fontWeight: '600', 
        color: '#2c3e50', 
        fontSize: '14px'
    };


    return (
        <div style={{ padding: '40px 20px', maxWidth: '650px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', color: '#0056b3', marginBottom: '10px', fontSize: '30px' }}>
                Customer Service Desk
            </h1>
            <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '30px', fontSize: '16px' }}>
                Submit a complaint, service request, or general feedback.
            </p>

            <div className="card" style={{ padding: '40px', borderLeft: '5px solid #0056b3' }}>
                
                {/* Feedback Message */}
                {feedback.message && (
                    <div style={{ ...getFeedbackStyle(feedback.type), padding: '15px', borderRadius: '5px', marginBottom: '25px', fontWeight: '600' }}>
                        {feedback.message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    
                    {/* Type and Priority */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Submission Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} required style={inputStyle}>
                                <option value="COMPLAINT">Formal Complaint</option>
                                <option value="SERVICE_ISSUE">Service Issue / Request</option>
                                <option value="FEEDBACK">General Feedback</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Priority</label>
                            <select name="priority" value={formData.priority} onChange={handleChange} required style={inputStyle}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High (Urgent)</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '30px' }}>
                        <label style={labelStyle}>Detailed Description</label>
                        <textarea 
                            name="description"
                            value={formData.description} 
                            onChange={handleChange} 
                            required 
                            placeholder="Please explain your issue or feedback in detail."
                            rows="6"
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
                        {processing ? 'Submitting...' : 'Submit Request'}
                    </button>
                    
                </form>
            </div>
        </div>
    );
};

export default GrievanceForm;
