import React, { useEffect, useState } from 'react';
import axios from '../lib/httpClient';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [policies, setPolicies] = useState([]);
    const [activeTab, setActiveTab] = useState('active');
    const [stats, setStats] = useState({ totalPolicies: 0, totalCoverage: 0, totalPremium: 0 });
    
    // In a real app, this comes from the logged-in session
    const userId = localStorage.getItem('userId') || 1; 
    const userName = "Rajesh Kumar"; // Use a mock name or fetch from API

    useEffect(() => {
        fetchPolicies();
    }, [userId]);

    const fetchPolicies = async () => {
        try {
            const response = await axios.get(`/api/policies/user/${userId}`);
            const data = response.data || [];
            
            // Sort by policy ID descending for new policies to appear first
            const sortedData = data.sort((a, b) => b.policyId - a.policyId);
            
            setPolicies(sortedData);
            calculateStats(sortedData);
        } catch (error) {
            console.error("Error fetching policies:", error);
        }
    };

    const calculateStats = (data) => {
        // --- Simplified Stat Calculation ---
        const totalCov = data.reduce((sum, item) => sum + 500000, 0); // Assuming 5L coverage per plan for demo
        const totalPrem = data.reduce((sum, item) => sum + item.premiumPaid, 0);
        
        setStats({
            totalPolicies: data.length,
            totalCoverage: totalCov,
            totalPremium: totalPrem
        });
    };

    const downloadPdf = async (policyId) => {
        try {
            const response = await axios.get(`/api/policies/${policyId}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Policy-${policyId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            alert("PDF Generation Failed. Ensure backend is running and the policy ID is valid.");
        }
    };

    // --- POLICY AMENDMENT HANDLER (Restored) ---
    const handleAmend = (policyId) => {
        navigate(`/amend/${policyId}`); // Navigate to the amendment form
    };
    
    // --- RENEWAL HANDLER ---
    const handleRenewal = (policy) => {
        navigate(`/pay-renewal/${policy.policyId}`, { state: { policyToRenew: policy } });
    };


    // Filter policies based on tab
    const displayedPolicies = policies.filter(p => 
        activeTab === 'active' ? p.status === 'ACTIVE' : p.status !== 'ACTIVE'
    );

    const getStatusBadge = (status) => {
        const style = { padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' };
        if (status === 'ACTIVE') return { ...style, backgroundColor: '#e6f4ea', color: '#1e7e34' };
        if (status === 'PENDING_APPROVAL') return { ...style, backgroundColor: '#fff3cd', color: '#856404' };
        return { ...style, backgroundColor: '#fce8e6', color: '#c53030' };
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
            
            {/* 1. WELCOME HEADER & CTA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#0056b3', fontSize: '30px' }}>Hello, {userName} 👋</h1>
                    <p style={{ color: '#666', margin: '5px 0' }}>Manage your insurance portfolio securely.</p>
                </div>
                <button 
                    onClick={() => navigate('/plans')}
                    style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)' }}
                >
                    + Buy New Policy
                </button>
            </div>

            {/* 2. STATS CARDS */}
            <div style={statContainerStyle}>
                <div style={cardStyle}>
                    <span style={{ fontSize: '30px', color: '#0056b3' }}>🛡️</span>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{stats.totalPolicies}</h3>
                        <span style={{ color: '#888', fontSize: '14px' }}>Total Policies</span>
                    </div>
                </div>
                <div style={cardStyle}>
                    <span style={{ fontSize: '30px', color: '#28a745' }}>💰</span>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>₹{stats.totalCoverage.toLocaleString()}</h3>
                        <span style={{ color: '#888', fontSize: '14px' }}>Max Total Coverage</span>
                    </div>
                </div>
                <div style={cardStyle}>
                    <span style={{ fontSize: '30px', color: '#dc3545' }}>🧾</span>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>₹{stats.totalPremium.toLocaleString()}</h3>
                        <span style={{ color: '#888', fontSize: '14px' }}>Total Yearly Premium</span>
                    </div>
                </div>
            </div>

            {/* 3. MAIN CONTENT AREA */}
            <div style={{ backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                    <button 
                        onClick={() => setActiveTab('active')}
                        style={{ ...tabStyle, borderBottom: activeTab === 'active' ? '3px solid #0056b3' : 'none', color: activeTab === 'active' ? '#0056b3' : '#666' }}
                    >
                        Active Policies
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        style={{ ...tabStyle, borderBottom: activeTab === 'history' ? '3px solid #0056b3' : 'none', color: activeTab === 'history' ? '#0056b3' : '#666' }}
                    >
                        History / Expired
                    </button>
                </div>

                {/* Table */}
                <div style={{ padding: '20px' }}>
                    {displayedPolicies.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                            <p>No policies found in this category.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left' }}>
                                    <th style={thStyle}>Policy No.</th>
                                    <th style={thStyle}>Premium (₹)</th>
                                    <th style={thStyle}>Renewal Date</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedPolicies.map(policy => (
                                    <tr key={policy.policyId} style={{ borderBottom: '1px solid #f9f9f9', transition: '0.2s' }}>
                                        <td style={tdStyle}>#{policy.policyId}</td>
                                        <td style={tdStyle}>₹{policy.premiumPaid.toLocaleString()}</td>
                                        <td style={tdStyle}>{policy.endDate}</td>
                                        <td style={tdStyle}>
                                            <span style={getStatusBadge(policy.status)}>
                                                {policy.status}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button 
                                                    onClick={() => downloadPdf(policy.policyId)}
                                                    style={{ border: '1px solid #007bff', backgroundColor: 'white', color: '#007bff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
                                                >
                                                    ⬇ Doc
                                                </button>
                                                
                                                {/* RENEWAL BUTTON */}
                                                {policy.status === 'ACTIVE' && (
                                                    <button 
                                                        onClick={() => handleRenewal(policy)}
                                                        style={{ backgroundColor: '#ffc107', color: '#333', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', border: 'none' }}
                                                    >
                                                        Pay Renewal
                                                    </button>
                                                )}

                                                {/* EDIT POLICY BUTTON (AMENDMENT) */}
                                                {policy.status === 'ACTIVE' && (
                                                    <button 
                                                        onClick={() => handleAmend(policy.policyId)}
                                                        style={{ backgroundColor: '#e9f2ff', color: '#0056b3', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', border: 'none' }}
                                                    >
                                                        Edit Policy
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* 4. AGENT CONTACT CARD */}
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e9f2ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#004085' }}>Need Help?</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#004085' }}>Your dedicated agent is available for consultation.</p>
                </div>
                <button 
                    onClick={() => navigate('/appointments')}
                    style={{ backgroundColor: '#0056b3', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Book Call Now
                </button>
            </div>

        </div>
    );
};

// --- STYLES ---
const cardStyle = {
    flex: 1,
    minWidth: '200px',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
};

const tabStyle = {
    padding: '15px 25px',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.3s'
};

const thStyle = { padding: '15px', fontSize: '14px', color: '#888', fontWeight: '600' };
const tdStyle = { padding: '15px', fontSize: '14px', color: '#333' };

// Stat Container Style (for better flex handling)
const statContainerStyle = {
    display: 'flex', 
    gap: '20px', 
    marginBottom: '30px', 
    flexWrap: 'wrap'
};


export default Dashboard;
