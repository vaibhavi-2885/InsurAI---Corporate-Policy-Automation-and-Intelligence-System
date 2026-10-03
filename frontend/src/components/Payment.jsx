import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from '../lib/httpClient';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { policyId } = useParams(); // Check if policyId is present in URL (means it's a renewal)

    // Data handling: If policyId is present in URL, use policyToRenew state.
    // Otherwise, use new policy data (from new purchase flow).
    const isRenewal = !!policyId;
    const renewalPolicy = location.state?.policyToRenew;
    const newPolicyData = location.state?.finalPolicyData; // Contains full legal data + quote
    const newPlan = location.state?.plan;

    // Determine the data source and premium
    // Priority: 1. Renewal Data -> 2. New Purchase Data (consolidated)
    const dataSource = isRenewal ? renewalPolicy : newPolicyData;
    const premiumAmount = dataSource ? (dataSource.premiumPaid || (newPlan ? newPlan.basePremium : 0)) : 0;
    
    // Identifier for the summary box
    const policyIdentifier = isRenewal 
        ? `Policy #${policyId}` 
        : (newPlan ? newPlan.planName : 'New Policy');

    // State for Payment Form
    const [paymentMethod, setPaymentMethod] = useState('CARD'); 
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');


    // Redirect if data is completely missing
    if (!dataSource || premiumAmount === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h3 style={{ color: '#dc3545' }}>Error: Payment Details Missing.</h3>
                <p>Ensure you selected a plan or are renewing a valid policy.</p>
                <button 
                    onClick={() => navigate('/plans')}
                    style={{ backgroundColor: '#0056b3', color: 'white', padding: '10px 20px', borderRadius: '5px' }}
                >
                    Go Back to Plans
                </button>
            </div>
        );
    }
    
    // --- Validation Logic (Simplified for Demo) ---
    const validatePaymentForm = () => {
        setError('');
        if (paymentMethod === 'CARD' && (cardNumber.replace(/\s/g, '').length < 13 || cvv.length < 3)) {
            setError('Invalid Card details.');
            return false;
        }
        // Add UPI/NetBanking validation here if needed
        return true;
    };

    // --- Final Submission Handler ---
    const handlePayment = async (e) => {
        e.preventDefault();
        if (!validatePaymentForm()) return;
        
        setProcessing(true);
        
        setTimeout(async () => {
            try {
                let response;
                let apiEndpoint;
                
                if (isRenewal) {
                    // RENEWAL: PUT request to /api/policies/renew/{policyId}
                    apiEndpoint = `/api/policies/renew/${policyId}`;
                    response = await axios.put(apiEndpoint, {}); // Body is empty for renewal PUT
                } else {
                    // NEW PURCHASE: POST request to /api/policies/buy
                    apiEndpoint = '/api/policies/buy';
                    response = await axios.post(apiEndpoint, newPolicyData); // Body contains full legal data
                }
                
                const messageType = isRenewal ? 'Renewal' : 'Purchase';
                
                // Show Success Notification
                alert(`✅ Payment Successful! ${messageType} confirmed for ${policyIdentifier}. Receipt sent.`);
                
                // Navigate to the Dashboard
                navigate('/dashboard'); 

            } catch (error) {
                console.error("Transaction Failed:", error.response?.data || error);
                alert(`❌ ${isRenewal ? 'Renewal' : 'Purchase'} Failed. Check console.`);
                setProcessing(false);
            }
        }, 2000); 
    };

    const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ced4da', width: '100%', boxSizing: 'border-box', fontSize: '16px', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
    const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', backgroundColor: '#f4f7f6', minHeight: '80vh' }}>
            <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '30px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
                
                {/* Header */}
                <h2 style={{ textAlign: 'center', color: isRenewal ? '#ffc107' : '#0056b3', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                    {isRenewal ? 'Policy Renewal Payment' : 'New Policy Checkout'}
                </h2>
                
                {/* Order Summary */}
                <div style={{ marginBottom: '25px', backgroundColor: '#e6f4ea', padding: '15px', borderRadius: '8px', border: '1px solid #28a74550' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#1e7e34' }}>{isRenewal ? `Renewing ${policyIdentifier}` : `Purchasing ${policyIdentifier}`}</h4>
                    <div style={{ borderTop: '1px dashed #ccc', margin: '10px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', color: '#0056b3' }}>
                        <span>Total Payable:</span> 
                        <strong style={{ fontWeight: '800' }}>₹{premiumAmount.toLocaleString()}</strong>
                    </div>
                </div>
                
                {error && <div style={{ color: '#dc3545', textAlign: 'center', marginBottom: '15px' }}>{error}</div>}

                <form onSubmit={handlePayment}>
                    
                    {/* Payment Method Selector */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={labelStyle}>Select Method</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['CARD', 'UPI', 'NETBANKING'].map(method => (
                                <button 
                                    key={method}
                                    type="button"
                                    onClick={() => { setPaymentMethod(method); setError(''); }}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: paymentMethod === method ? '2px solid #0056b3' : '1px solid #ddd', backgroundColor: paymentMethod === method ? '#eef7ff' : 'white', color: paymentMethod === method ? '#0056b3' : '#666', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    {method === 'CARD' ? '💳 Card' : method === 'UPI' ? '📱 UPI' : '🏦 NetBanking'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CARD FORM */}
                    {paymentMethod === 'CARD' && (
                        <>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>Card Number</label>
                                <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required placeholder="0000 0000 0000 0000" maxLength="16" style={inputStyle} />
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Expiry (MM/YY)</label>
                                    <input type="text" value={expiry} onChange={e => setExpiry(e.target.value)} required placeholder="MM/YY" maxLength="5" style={inputStyle} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>CVV</label>
                                    <input type="password" value={cvv} onChange={e => setCvv(e.target.value)} required placeholder="123" maxLength="3" style={inputStyle} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={processing} 
                        style={{ width: '100%', padding: '18px', backgroundColor: processing ? '#6c757d' : '#28a745', color: 'white', fontWeight: '700', fontSize: '18px', boxShadow: '0 6px 15px rgba(40, 167, 69, 0.4)' }}
                    >
                        {processing ? 'Processing Securely...' : `Pay ₹${premiumAmount.toLocaleString()}`}
                    </button>
                    
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#888' }}>
                    🔒 256-bit SSL Encrypted & Trusted
                </div>
            </div>
        </div>
    );
};

export default Payment;
