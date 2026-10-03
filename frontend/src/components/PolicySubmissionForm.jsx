import React, { useState } from 'react';
import axios from '../lib/httpClient';
import { useLocation, useNavigate } from 'react-router-dom';

const PolicySubmissionForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Retrieve the plan data and quote details from the Plan Details page
    const { plan, quoteData } = location.state || {}; // quoteData contains age, term, smoker status
    
    // State for mandatory legal details
    const [formData, setFormData] = useState({
        addressLine1: '',
        nomineeName: '',
        nomineeRelationship: 'SPOUSE', 
        holderDob: '',
    });
    const [processing, setProcessing] = useState(false);

    // Redirect if data is missing (prevents white screen crash)
    if (!plan || !quoteData) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h3 style={{ color: '#dc3545' }}>Error: Quote data missing.</h3>
                <p>Please select a plan from the <a href="/plans">Plans Page</a> and get a quote first.</p>
            </div>
        );
    }
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleProceedToPayment = (e) => {
        e.preventDefault();
        
        // --- Data Consolidation for Payment ---
        const purchaseData = {
            // Data from Quote/Plan Selection 
            planId: plan.planId,
            premiumPaid: plan.basePremium, 
            userId: parseInt(localStorage.getItem('userId')) || 1, 
            
            // Mandatory Legal Data
            holderDob: formData.holderDob,
            addressLine1: formData.addressLine1,
            nomineeName: formData.nomineeName,
            nomineeRelationship: formData.nomineeRelationship,
            
            // Add other quoted parameters here if necessary for backend verification
        };

        // Navigate to Payment, passing the CONSOLIDATED policy object
        navigate('/payment', { state: { plan: plan, finalPolicyData: purchaseData } });
    };
    
    const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' };
    const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ced4da', width: '100%', boxSizing: 'border-box', fontSize: '16px', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };


    return (
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', color: '#0056b3', marginBottom: '10px', fontSize: '30px' }}>
                Mandatory Policy Details
            </h1>
            <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '30px', fontSize: '16px' }}>
                Complete these details to finalize the legal contract for **{plan.planName}**.
            </p>

            <div className="card" style={{ padding: '40px', borderLeft: '5px solid #28a745' }}>
                
                <h3 style={{ borderBottom: '1px dashed #eee', paddingBottom: '10px', color: '#28a745' }}>1. Policy Holder & Nominee Details</h3>
                
                <form onSubmit={handleProceedToPayment}>

                    {/* Policy Holder DOB */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Policy Holder's Date of Birth (For KYC)</label>
                        <input 
                            type="date" 
                            name="holderDob"
                            value={formData.holderDob} 
                            onChange={handleChange} 
                            required 
                            style={inputStyle}
                        />
                    </div>
                    
                    {/* Nominee Details */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 2, minWidth: '250px' }}>
                            <label style={labelStyle}>Nominee's Full Name (Who receives the funds?)</label>
                            <input 
                                type="text"
                                name="nomineeName"
                                value={formData.nomineeName} 
                                onChange={handleChange} 
                                required 
                                placeholder="Nominee Name"
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <label style={labelStyle}>Relationship</label>
                            <select 
                                name="nomineeRelationship"
                                value={formData.nomineeRelationship} 
                                onChange={handleChange} 
                                required 
                                style={inputStyle}
                            >
                                <option value="SPOUSE">Spouse</option>
                                <option value="CHILD">Child</option>
                                <option value="PARENT">Parent</option>
                                <option value="OTHER">Other Relative</option>
                            </select>
                        </div>
                    </div>
                    
                    <h3 style={{ borderBottom: '1px dashed #eee', paddingBottom: '10px', color: '#28a745' }}>2. Residential Address</h3>
                    
                    {/* Address */}
                    <div style={{ marginBottom: '30px' }}>
                        <label style={labelStyle}>Address Line 1 (Street, House No.)</label>
                        <input 
                            type="text"
                            name="addressLine1"
                            value={formData.addressLine1} 
                            onChange={handleChange} 
                            required 
                            placeholder="Flat/House No, Street, Locality"
                            style={inputStyle}
                        />
                         <p style={{ marginTop: '5px', fontSize: '12px', color: '#888' }}>
                            Note: Full address including City/PIN is derived from your registered account.
                        </p>
                    </div>


                    {/* Proceed Button */}
                    <button 
                        type="submit" 
                        disabled={processing}
                        style={{ 
                            width: '100%', 
                            padding: '18px', 
                            backgroundColor: '#0056b3', 
                            color: 'white', 
                            fontWeight: '700',
                            fontSize: '18px',
                            boxShadow: '0 4px 15px rgba(0,86,179,0.3)'
                        }}
                    >
                        {processing ? 'Loading Checkout...' : 'Proceed to Payment (₹' + plan.basePremium.toLocaleString() + ')'}
                    </button>
                    
                </form>
            </div>
        </div>
    );
};

export default PolicySubmissionForm;
