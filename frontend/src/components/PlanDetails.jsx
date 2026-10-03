import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../lib/httpClient';

const PlanDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Retrieve the plan data passed from the Plans page
    const { plan } = location.state || {};
    
    // State for the Dynamic Quoting Calculator
    const [quoteData, setQuoteData] = useState({
        age: 30,
        smokerStatus: 'NO',
        termYears: 20
    });
    const [finalPremium, setFinalPremium] = useState(plan?.basePremium.toLocaleString() || '---');
    const [quoteLoading, setQuoteLoading] = useState(false);


    // Redirect if no plan
    if (!plan) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h3 style={{ color: '#dc3545' }}>Error: Plan data missing.</h3>
                <button 
                    onClick={() => navigate('/plans')}
                    style={{ color: '#0056b3', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                >
                    Go back to Plans
                </button>
            </div>
        );
    }

    // --- Dynamic Quoting Logic ---
    const getQuote = async () => {
        setQuoteLoading(true);
        try {
            const requestBody = {
                planId: plan.planId,
                age: parseInt(quoteData.age),
                smokerStatus: quoteData.smokerStatus,
                termYears: parseInt(quoteData.termYears)
            };
            
            // Call the new Java API endpoint
            const response = await axios.post('/api/quote', requestBody);
            
            // Update the display premium with the calculated value
            setFinalPremium(parseFloat(response.data).toLocaleString('en-IN', { maximumFractionDigits: 0 }));

        } catch (error) {
            setFinalPremium('Error');
            // Assuming useToast is available globally for better error display
            // useToast.error("Could not calculate quote. Backend error."); 
        } finally {
            setQuoteLoading(false);
        }
    };

    // Calculate quote automatically when the inputs change
    useEffect(() => {
        if (plan) {
            getQuote();
        }
    }, [quoteData]); // Rerun when age, status, or term changes


    // --- Handlers ---
    const handleProceedToSubmission = () => {
        // Pass the calculated premium along with the user's risk assessment data
        const calculatedPlan = { ...plan, basePremium: parseFloat(finalPremium.replace(/,/g, '')) };
        
        // NEW ROUTING: Send user to the submission form BEFORE payment
        navigate('/submit-policy', { 
            state: { 
                plan: calculatedPlan, 
                quoteData: quoteData // Pass the age/term/smoker data
            } 
        });
    };

    // Helper to format text with bullet points
    const renderContent = (text) => {
        if (!text) return <p style={{ color: '#888', fontStyle: 'italic' }}>Details not available.</p>;
        
        return text.split('\n').map((line, index) => (
            <p key={index} style={{ margin: '8px 0', display: 'flex', alignItems: 'flex-start' }}>
                <span style={{ marginRight: '10px', color: '#28a745' }}>✔</span>
                {line.replace(/•/g, '').trim()}
            </p>
        ));
    };
    
    const inputStyle = {
        padding: '10px',
        borderRadius: '6px',
        border: '1px solid #ced4da',
        width: '100%',
        boxSizing: 'border-box',
        fontSize: '16px',
        backgroundColor: 'white',
    };
    
    const labelStyle = {
        display: 'block', 
        marginBottom: '5px', 
        fontWeight: '600', 
        color: '#2c3e50', 
        fontSize: '14px'
    };


    return (
        <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', marginBottom: '20px', fontSize: '16px', display: 'flex', alignItems: 'center' }}
                >
                    ⬅ Back to Plans
                </button>

                {/* Header Card (Policy Summary and Quoter) */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
                    
                    {/* Left Side: Policy Info */}
                    <div style={{ flex: 2, minWidth: '350px' }}>
                        <span style={{ backgroundColor: '#e6f2ff', color: '#0056b3', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>
                            {plan.category} Insurance
                        </span>
                        <h1 style={{ margin: '15px 0 10px 0', color: '#2c3e50' }}>{plan.planName}</h1>
                        <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>{plan.description}</p>
                        
                        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Max Coverage</p>
                            <h3 style={{ margin: '5px 0', color: '#333' }}>₹{plan.coverageAmount.toLocaleString()}</h3>
                        </div>
                    </div>

                    {/* Right Side: Dynamic Quoting Calculator (THE CORE FEATURE) */}
                    <div style={{ minWidth: '300px', flex: 1, border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: '#fcfcfc' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#0056b3', textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            Premium Calculator
                        </h3>

                        {/* Quoting Inputs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            
                            <div>
                                <label style={labelStyle}>Your Age</label>
                                <input 
                                    type="number" 
                                    value={quoteData.age} 
                                    onChange={e => setQuoteData({...quoteData, age: e.target.value})}
                                    min="18" max="65" required 
                                    style={inputStyle}
                                />
                            </div>
                            
                            <div>
                                <label style={labelStyle}>Term (Years)</label>
                                <input 
                                    type="number" 
                                    value={quoteData.termYears} 
                                    onChange={e => setQuoteData({...quoteData, termYears: e.target.value})}
                                    min="5" max="50" required 
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={labelStyle}>Smoker Status</label>
                                <select 
                                    value={quoteData.smokerStatus} 
                                    onChange={e => setQuoteData({...quoteData, smokerStatus: e.target.value})}
                                    style={inputStyle}
                                >
                                    <option value="NO">Non-Smoker</option>
                                    <option value="YES">Smoker</option>
                                </select>
                            </div>
                        </div>

                        {/* Final Premium Display */}
                        <div style={{ textAlign: 'center', backgroundColor: '#e6f4ea', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
                            <p style={{ margin: 0, color: '#28a745', fontSize: '14px', fontWeight: 'bold' }}>Your Estimated Premium</p>
                            <h2 style={{ margin: '5px 0 0 0', color: '#28a745', fontSize: '36px', fontWeight: '800' }}>
                                {quoteLoading ? '...' : `₹${finalPremium}`}
                            </h2>
                            <span style={{ color: '#28a745', fontSize: '14px' }}>/ Year</span>
                        </div>


                        <button 
                            onClick={handleProceedToSubmission} 
                            disabled={quoteLoading}
                            style={{ 
                                width: '100%', 
                                padding: '15px', 
                                backgroundColor: '#28a745', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontSize: '16px', 
                                fontWeight: 'bold', 
                                cursor: 'pointer',
                                boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)' 
                            }}
                        >
                            Proceed to Mandatory Details
                        </button>
                    </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px', marginTop: '30px' }}>
                    
                    {/* Features Section */}
                    <div style={sectionCardStyle}>
                        <h3 style={sectionHeaderStyle}>⭐ Key Features</h3>
                        <div style={contentStyle}>{renderContent(plan.features)}</div>
                    </div>

                    {/* Eligibility Section */}
                    <div style={sectionCardStyle}>
                        <h3 style={sectionHeaderStyle}>📋 Eligibility Criteria</h3>
                        <div style={contentStyle}>{renderContent(plan.eligibility)}</div>
                    </div>

                    {/* Documents Section */}
                    <div style={sectionCardStyle}>
                        <h3 style={sectionHeaderStyle}>📄 Documents Required</h3>
                        <div style={contentStyle}>{renderContent(plan.documentsRequired)}</div>
                    </div>

                    {/* Claims Section */}
                    <div style={sectionCardStyle}>
                        <h3 style={sectionHeaderStyle}>⚡ Claim Process</h3>
                        <div style={contentStyle}>{renderContent(plan.claimProcess)}</div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- Styles ---
const sectionCardStyle = {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
};

const sectionHeaderStyle = {
    color: '#0056b3',
    borderBottom: '2px solid #f4f7f6',
    paddingBottom: '10px',
    marginTop: 0,
    marginBottom: '15px',
    fontWeight: '700'
};

const contentStyle = {
    color: '#555',
    lineHeight: '1.6',
    fontSize: '15px'
};


export default PlanDetails;
