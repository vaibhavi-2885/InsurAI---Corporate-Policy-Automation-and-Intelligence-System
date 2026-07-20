import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Compare = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Retrieve the plans array passed from the Plans page
    const { plans } = location.state || { plans: [] };

    // Redirect if fewer than two plans are selected
    if (plans.length < 2) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h3 style={{ color: '#dc3545' }}>⚠️ Insufficient Plans Selected</h3>
                <p>Please select at least 2 policies for comparison.</p>
                <button 
                    onClick={() => navigate('/plans')}
                    style={{ backgroundColor: '#0056b3', color: 'white', padding: '10px 20px', borderRadius: '5px' }}
                >
                    Go Back to Plans
                </button>
            </div>
        );
    }

    // Prepare features list (get all unique feature names from all selected plans)
    const allFeatureNames = [
        'Base Premium (Yearly)', 
        'Max Coverage Amount', 
        'Category', 
        'Description'
    ];
    
    // Dynamically extract bullet points from the rich text fields
    const getRichFeatures = (plan, fieldName) => {
        const text = plan[fieldName];
        if (!text) return [];
        // Split by newline and filter out empty lines, then clean up bullets/dashes
        return text.split('\n')
                   .filter(line => line.trim())
                   .map(line => line.replace(/•/g, '').replace(/-/g, '').trim());
    };

    // Extract all unique feature bullet points for the rows
    let uniqueFeatureDetails = new Set();
    plans.forEach(plan => {
        getRichFeatures(plan, 'features').forEach(feature => uniqueFeatureDetails.add(feature));
    });
    
    // Add rich feature details to the rows after core stats
    const featureRows = Array.from(uniqueFeatureDetails);

    // Combine all static and dynamic rows for the table structure
    const allRows = [
        ...allFeatureNames, 
        '--- POLICY DETAILS ---',
        ...featureRows,
        '--- CLAIM PROCESS ---',
        'Claim Process Snapshot',
        '--- ELIGIBILITY ---',
        'Eligibility Criteria',
        '--- DOCUMENTATION ---',
        'Required Documents'
    ];


    // Helper function to render a single cell's content
    const renderCellContent = (plan, rowName) => {
        switch (rowName) {
            case 'Base Premium (Yearly)':
                return <span style={{ color: '#28a745', fontWeight: 'bold' }}>₹{plan.basePremium.toLocaleString()}/yr</span>;
            case 'Max Coverage Amount':
                return <span style={{ fontWeight: 'bold' }}>₹{plan.coverageAmount.toLocaleString()}</span>;
            case 'Category':
                return <span style={{ background: '#e6f2ff', color: '#0056b3', padding: '4px 8px', borderRadius: '4px' }}>{plan.category}</span>;
            case 'Description':
                return plan.description;
            case 'Claim Process Snapshot':
                return getRichFeatures(plan, 'claimProcess')[0] || "See full details";
            case 'Eligibility Criteria':
                return getRichFeatures(plan, 'eligibility')[0] || "Varies by Age/Income";
            case 'Required Documents':
                return getRichFeatures(plan, 'documentsRequired')[0] || "KYC + Income Proof";
            default:
                // Check if the row matches a specific rich feature bullet point
                const hasFeature = getRichFeatures(plan, 'features').includes(rowName);
                return hasFeature ? (
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>✔ Included</span>
                ) : (
                    <span style={{ color: '#dc3545' }}>— N/A</span>
                );
        }
    };


    return (
        <div style={{ padding: '40px 20px', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <h1 style={{ color: '#0056b3', marginBottom: '10px' }}>Policy Comparison Matrix</h1>
                <p style={{ color: '#666', marginBottom: '30px' }}>Comparing {plans.length} plans side-by-side.</p>
                
                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
                        
                        {/* Table Header (Plan Names) */}
                        <thead>
                            <tr style={{ background: '#0056b3', color: 'white' }}>
                                <th style={thStyle}>Feature</th>
                                {plans.map(plan => (
                                    <th key={plan.planId} style={thStyle}>
                                        {plan.planName}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* Table Body (Feature Rows) */}
                        <tbody>
                            {allRows.map((rowName, index) => {
                                // Separator Row Check
                                if (rowName.startsWith('---')) {
                                    return (
                                        <tr key={index} style={{ background: '#f7f9fc' }}>
                                            <td colSpan={plans.length + 1} style={{ ...tdStyle, fontWeight: '700', color: '#0056b3', textAlign: 'center', background: '#f0f4f8' }}>
                                                {rowName.replace(/---/g, '').trim()}
                                            </td>
                                        </tr>
                                    );
                                }

                                return (
                                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                        {/* Feature Name Column (Leftmost) */}
                                        <td style={{ ...tdStyle, fontWeight: '600', background: '#fafafa', width: '20%' }}>
                                            {rowName}
                                        </td>
                                        
                                        {/* Dynamic Plan Columns */}
                                        {plans.map(plan => (
                                            <td key={plan.planId} style={tdStyle}>
                                                {renderCellContent(plan, rowName)}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button 
                        onClick={() => navigate('/plans')}
                        style={{ backgroundColor: '#0056b3', color: 'white', padding: '12px 30px', borderRadius: '8px' }}
                    >
                        Change Plans to Compare
                    </button>
                </div>
            </div>
        </div>
    );
};

// Internal styles
const thStyle = { padding: '15px', textAlign: 'center', borderRight: '1px solid #00416a', fontWeight: '700', fontSize: '15px' };
const tdStyle = { padding: '15px', borderRight: '1px solid #eee', fontSize: '14px', verticalAlign: 'top' };

export default Compare;