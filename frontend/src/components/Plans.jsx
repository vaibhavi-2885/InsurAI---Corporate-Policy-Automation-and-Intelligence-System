import React, { useEffect, useState } from 'react';
import axios from '../lib/httpClient';
import { useNavigate } from 'react-router-dom';

const Plans = () => {
    const [plans, setPlans] = useState([]);
    const [checkedPlans, setCheckedPlans] = useState([]); // State to track plans selected for comparison
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/plans')
            .then(response => { setPlans(response.data); })
            .catch(error => { console.error("Error fetching plans:", error); });
    }, []);

    const handleViewDetails = (plan) => {
        navigate(`/plan/${plan.planId}`, { state: { plan: plan } });
    };

    // Handler for the "Add to Compare" checkbox
    const handleCompareChange = (plan, isChecked) => {
        if (isChecked) {
            if (checkedPlans.length >= 3) {
                alert("You can only compare a maximum of 3 policies.");
                return;
            }
            setCheckedPlans([...checkedPlans, plan]);
        } else {
            setCheckedPlans(checkedPlans.filter(p => p.planId !== plan.planId));
        }
    };
    
    // Handler to navigate to the comparison page
    const handleCompare = () => {
        if (checkedPlans.length < 2) {
            alert("Please select at least 2 policies to compare.");
            return;
        }
        navigate('/compare', { state: { plans: checkedPlans } });
    };


    return (
        <div style={{ padding: '40px 20px', backgroundColor: '#f8f9fa', minHeight: '100vh', position: 'relative' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '10px' }}>Explore Our Insurance Plans</h2>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '15px' }}>
                Select up to 3 plans to compare features side-by-side.
            </p>

            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {plans.map(plan => {
                    const isChecked = checkedPlans.some(p => p.planId === plan.planId);
                    return (
                        <div key={plan.planId} style={{ backgroundColor: 'white', borderRadius: '12px', width: '320px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', transition: 'transform 0.3s', border: '1px solid #eee', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '20px', flexGrow: 1 }}>
                                <span style={{ backgroundColor: '#e6f2ff', color: '#0056b3', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>{plan.category}</span>
                                <h3 style={{ color: '#2c3e50', marginTop: '10px' }}>{plan.planName}</h3>
                                <p style={{ color: '#666', fontSize: '14px', height: '40px', overflow: 'hidden' }}>{plan.description}</p>
                                
                                <div style={{ margin: '20px 0', borderTop: '1px dashed #ddd', borderBottom: '1px dashed #ddd', padding: '15px 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ color: '#888' }}>Cover Amount</span>
                                        <strong style={{fontSize: '16px'}}>₹{plan.coverageAmount.toLocaleString()}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#888' }}>Yearly Premium (Base)</span>
                                        <strong style={{ color: '#28a745', fontSize: '16px' }}>₹{plan.basePremium.toLocaleString()}/yr</strong>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Footer */}
                            <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
                                <button onClick={() => handleViewDetails(plan)} style={{ width: '100%', padding: '12px', backgroundColor: 'white', color: '#0056b3', border: '2px solid #0056b3', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
                                    View Details & Quote
                                </button>
                                
                                {/* Comparison Checkbox */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <input 
                                        type="checkbox" 
                                        id={`compare-${plan.planId}`} 
                                        checked={isChecked}
                                        onChange={(e) => handleCompareChange(plan, e.target.checked)}
                                        disabled={!isChecked && checkedPlans.length >= 3}
                                        style={{ width: '16px', height: '16px', marginRight: '8px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor={`compare-${plan.planId}`} style={{ fontSize: '14px', color: '#555', cursor: 'pointer' }}>
                                        Add to Compare ({checkedPlans.length}/3)
                                    </label>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FLOATING COMPARE BUTTON */}
            {checkedPlans.length >= 2 && (
                <div style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000 }}>
                    <button 
                        onClick={handleCompare}
                        style={{ 
                            padding: '15px 30px', 
                            backgroundColor: '#dc3545', 
                            color: 'white', 
                            borderRadius: '30px', 
                            fontWeight: '700', 
                            fontSize: '18px',
                            boxShadow: '0 6px 20px rgba(220, 53, 69, 0.4)' 
                        }}
                    >
                        Compare {checkedPlans.length} Policies
                    </button>
                </div>
            )}
        </div>
    );
};

export default Plans;
