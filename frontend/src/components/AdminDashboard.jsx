import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Component for the Edit/Create Modal Form (Product Management)
const PlanFormModal = ({ isOpen, onClose, planData, onSave }) => {
    const isNew = !planData.planId;
    const [formData, setFormData] = useState(planData);
    
    // Reset form data when modal opens/changes context
    useEffect(() => {
        if (isOpen) {
            setFormData(planData);
        }
    }, [isOpen, planData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };
    
    // Style helper for input fields (consistent)
    const inputStyle = {
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        width: '100%',
        boxSizing: 'border-box',
        marginBottom: '15px',
        fontSize: '14px'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: '600',
        color: '#495057',
        fontSize: '14px'
    };


    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', color: '#0056b3' }}>
                    {isNew ? '➕ Create New Plan' : `✏️ Edit Plan #${planData.planId}`}
                </h2>
                <form onSubmit={handleSubmit}>
                    
                    {/* Basic Info: Name, Category, Description */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 2 }}>
                            <label style={labelStyle}>Plan Name</label>
                            <input name="planName" value={formData.planName} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} required style={inputStyle}>
                                <option value="LIFE">LIFE</option>
                                <option value="HEALTH">HEALTH</option>
                                <option value="VEHICLE">VEHICLE</option>
                                <option value="TRAVEL">TRAVEL</option>
                                <option value="INVESTMENT">INVESTMENT</option>
                            </select>
                        </div>
                    </div>

                    <label style={labelStyle}>Description (Short Summary)</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="2" style={inputStyle} />

                    {/* Financial Info: Premium, Coverage */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Base Premium (₹)</label>
                            <input name="basePremium" type="number" value={formData.basePremium} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Coverage Amount (₹)</label>
                            <input name="coverageAmount" type="number" value={formData.coverageAmount} onChange={handleChange} required style={inputStyle} />
                        </div>
                    </div>
                    
                    {/* Rich Text Fields (The Industrial Detail) */}
                    <label style={labelStyle}>Key Features (Use newline for bullets)</label>
                    <textarea name="features" value={formData.features} onChange={handleChange} rows="3" style={inputStyle} />

                    <label style={labelStyle}>Eligibility Criteria</label>
                    <textarea name="eligibility" value={formData.eligibility} onChange={handleChange} rows="3" style={inputStyle} />
                    
                    <label style={labelStyle}>Claim Process</label>
                    <textarea name="claimProcess" value={formData.claimProcess} onChange={handleChange} rows="3" style={inputStyle} />
                    
                    <label style={labelStyle}>Documents Required</label>
                    <textarea name="documentsRequired" value={formData.documentsRequired} onChange={handleChange} rows="3" style={inputStyle} />


                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <button type="button" onClick={onClose} style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px' }}>
                            Cancel
                        </button>
                        <button type="submit" style={{ backgroundColor: '#0056b3', color: 'white', padding: '10px 20px' }}>
                            {isNew ? 'Create Plan' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminDashboard = () => {
    const [data, setData] = useState({ users: [], policies: [], claims: [], plans: [], grievances: [] }); // Added grievances
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'plans', or 'grievances'
    
    // Modal State for Plan CRUD
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch all necessary data
            const [u, p, c, pl, g] = await Promise.all([
                axios.get('http://localhost:8080/api/users/all'),
                axios.get('http://localhost:8080/api/policies/all'),
                axios.get('http://localhost:8080/api/claims/all'),
                axios.get('http://localhost:8080/api/plans'),
                axios.get('http://localhost:8080/api/grievances/all'), // Fetch ALL Grievances
            ]);

            const rev = p.data.reduce((sum, x) => sum + x.premiumPaid, 0);
            
            setData({ 
                users: u.data, 
                policies: p.data, 
                claims: c.data, 
                plans: pl.data.sort((a, b) => a.planId - b.planId),
                grievances: g.data.filter(g => g.status === 'NEW' || g.status === 'IN_REVIEW')
            });
            setTotalRevenue(rev);
        } catch (error) { 
            console.error("Backend connection/fetch error:", error);
        }
    };
    
    // --- PLAN CRUD HANDLERS (Same as before) ---
    const handleEditPlan = (plan) => {
        setCurrentPlan(plan);
        setIsModalOpen(true);
    };

    const handleCreateNew = () => {
        // Empty template for a new plan
        setCurrentPlan({
            planId: null, planName: '', category: 'LIFE', basePremium: 0, coverageAmount: 0,
            description: '', features: '', eligibility: '', documentsRequired: '', claimProcess: ''
        });
        setIsModalOpen(true);
    };

    const handleSavePlan = async (planData) => {
        try {
            if (planData.planId) {
                // UPDATE (PUT request)
                await axios.put(`http://localhost:8080/api/plans/${planData.planId}`, planData);
                alert(`Plan #${planData.planId} updated successfully.`);
            } else {
                // CREATE (POST request)
                await axios.post('http://localhost:8080/api/plans', planData);
                alert(`New plan '${planData.planName}' created successfully.`);
            }
            fetchData(); // Refresh data after action
        } catch (error) {
            alert(`Save failed: ${error.message}`);
        }
    };

    const handleDeletePlan = async (id) => {
        if (window.confirm(`Are you sure you want to delete Plan #${id}? This cannot be undone.`)) {
            try {
                await axios.delete(`http://localhost:8080/api/plans/${id}`);
                alert(`Plan #${id} deleted.`);
                fetchData();
            } catch (error) {
                alert(`Delete failed: ${error.message}`);
            }
        }
    };
    
    // --- GRIEVANCE ACTION HANDLERS (New) ---
    const handleGrievanceAction = async (grievanceId, status) => {
        if (!window.confirm(`Confirm action: Mark Grievance #${grievanceId} as ${status}?`)) return;
        
        try {
            await axios.put(`http://localhost:8080/api/grievances/${grievanceId}/status`, status, {
                headers: { 'Content-Type': 'text/plain' }
            });
            alert(`Grievance #${grievanceId} marked as ${status}.`);
            fetchData(); // Refresh data
        } catch (error) {
            alert(`Action failed: ${error.message}`);
        }
    };


    // --- RENDER LOGIC ---
    const getClaimStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return { color: '#28a745' };
            case 'REJECTED': return { color: '#dc3545' };
            case 'PENDING': default: return { color: '#ffc107' };
        }
    };
    
    const getGrievancePriorityStyle = (priority) => {
        switch (priority) {
            case 'HIGH': return { background: '#f8d7da', color: '#721c24' };
            case 'MEDIUM': return { background: '#fff3cd', color: '#856404' };
            default: return { background: '#f0f0f0', color: '#666' };
        }
    };


    return (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', color: '#0056b3', marginBottom: '10px', fontSize: '32px' }}>
                🏢 Admin Control Center
            </h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>
                Full administrative and product management access.
            </p>

            {/* MODAL FOR PLAN CRUD */}
            <PlanFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                planData={currentPlan || {}}
                onSave={handleSavePlan}
            />

            {/* TABBED INTERFACE */}
            <div style={{ display: 'flex', borderBottom: '2px solid #ddd', marginBottom: '30px' }}>
                <button 
                    onClick={() => setActiveTab('analytics')}
                    style={activeTab === 'analytics' ? activeTabStyle : inactiveTabStyle}
                >
                    Analytics & Claims
                </button>
                <button 
                    onClick={() => setActiveTab('plans')}
                    style={activeTab === 'plans' ? activeTabStyle : inactiveTabStyle}
                >
                    Product Management
                </button>
                <button 
                    onClick={() => setActiveTab('grievances')}
                    style={activeTab === 'grievances' ? activeTabStyleRed : inactiveTabStyle}
                >
                    Grievance Queue ({data.grievances.length})
                </button>
            </div>


            {/* --- TAB 1: ANALYTICS & CLAIMS --- */}
            {activeTab === 'analytics' && (
                <>
                    {/* STATS CARDS */}
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
                        <div style={statCardStyle}><h3>Revenue</h3><h2>₹{totalRevenue.toLocaleString()}</h2></div>
                        <div style={statCardStyle}><h3>Total Users</h3><h2>{data.users.length}</h2></div>
                        <div style={statCardStyle}><h3>Active Policies</h3><h2>{data.policies.filter(p => p.status === 'ACTIVE').length}</h2></div>
                        <div style={statCardStyleRed}><h3>Pending Claims</h3><h2>{data.claims.filter(c => c.status === 'PENDING').length}</h2></div>
                    </div>

                    {/* CLAIMS MANAGEMENT */}
                    <h3 style={{ color: '#dc3545', borderBottom: '1px solid #dc354530', paddingBottom: '10px' }}>
                        Claims Management Queue
                    </h3>
                    <div className="card" style={{ padding: '20px' }}>
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr style={{ background: '#f7f7f7' }}>
                                    <th style={thStyle}>ID</th>
                                    <th style={thStyle}>Date</th>
                                    <th style={thStyle}>Policy ID</th>
                                    <th style={thStyle}>Amount</th>
                                    <th style={thStyle}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.claims.map(claim => (
                                    <tr key={claim.claimId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={tdStyle}>#{claim.claimId}</td>
                                        <td style={tdStyle}>{claim.incidentDate}</td>
                                        <td style={tdStyle}>P-{claim.policyId}</td>
                                        <td style={tdStyle}>₹{claim.claimAmount}</td>
                                        <td style={tdStyle}>
                                            <span style={{ ...getClaimStatusStyle(claim.status), fontWeight: 'bold' }}>
                                                {claim.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* --- TAB 2: PRODUCT MANAGEMENT --- */}
            {activeTab === 'plans' && (
                <div className="card" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#0056b3' }}>Policy Catalog ({data.plans.length} Products)</h3>
                        <button onClick={handleCreateNew} style={{ background: '#28a745', color: 'white', padding: '10px 20px' }}>
                            + Add New Plan
                        </button>
                    </div>

                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr style={{ background: '#f7f7f7' }}>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Plan Name</th>
                                <th style={thStyle}>Category</th>
                                <th style={thStyle}>Premium (₹)</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.plans.map(plan => (
                                <tr key={plan.planId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={tdStyle}>#{plan.planId}</td>
                                    <td style={tdStyle}>{plan.planName}</td>
                                    <td style={tdStyle}>{plan.category}</td>
                                    <td style={tdStyle}>₹{plan.basePremium.toLocaleString()}</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleEditPlan(plan)} style={{ background: '#0056b3', color: 'white', padding: '6px 12px', fontSize: '12px' }}>
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeletePlan(plan.planId)} style={{ background: '#dc3545', color: 'white', padding: '6px 12px', fontSize: '12px' }}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* --- TAB 3: GRIEVANCE REVIEW --- */}
            {activeTab === 'grievances' && (
                <div className="card" style={{ padding: '30px' }}>
                    <h3 style={{ color: '#dc3545', borderBottom: '1px solid #dc354530', paddingBottom: '10px', marginBottom: '20px' }}>
                        Grievance & Feedback Queue ({data.grievances.length} Pending)
                    </h3>
                    
                    {data.grievances.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No pending submissions requiring review. ✅</p>
                    ) : (
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr style={{ background: '#f7f7f7' }}>
                                    <th style={thStyle}>ID</th>
                                    <th style={thStyle}>Type</th>
                                    <th style={thStyle}>Priority</th>
                                    <th style={thStyle}>Description</th>
                                    <th style={thStyle}>Submission Date</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.grievances.map(grievance => (
                                    <tr key={grievance.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={tdStyle}>#{grievance.id}</td>
                                        <td style={tdStyle}>
                                            <span style={{ background: '#e6f2ff', color: '#0056b3', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                                {grievance.type}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ ...getGrievancePriorityStyle(grievance.priority), padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                                {grievance.priority}
                                            </span>
                                        </td>
                                        <td style={tdStyle} title={grievance.description}><div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{grievance.description}</div></td>
                                        <td style={tdStyle}>{grievance.submissionDate.split('T')[0]}</td>
                                        <td style={tdStyle}>
                                            <button onClick={() => handleGrievanceAction(grievance.id, 'RESOLVED')} style={{ background: '#28a745', color: 'white', padding: '6px 12px', fontSize: '12px' }}>
                                                Mark Resolved
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

        </div>
    );
};

// --- MODAL STYLES ---
const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    width: '100%',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
};


// --- GENERAL STYLES ---
const statCardStyle = {
    flex: 1,
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    textAlign: 'center',
    borderBottom: '3px solid #0056b3',
    color: '#0056b3'
};

const statCardStyleRed = {
    ...statCardStyle,
    borderBottom: '3px solid #dc3545',
    color: '#dc3545'
};

const activeTabStyle = {
    padding: '12px 25px',
    border: 'none',
    background: 'white',
    borderBottom: '3px solid #0056b3',
    color: '#0056b3',
    fontWeight: '700',
    fontSize: '16px',
    cursor: 'pointer',
    transition: '0.3s',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px'
};

const activeTabStyleRed = {
    ...activeTabStyle,
    borderBottom: '3px solid #dc3545',
    color: '#dc3545',
};

const inactiveTabStyle = {
    padding: '12px 25px',
    border: 'none',
    background: '#f0f0f0',
    color: '#666',
    fontWeight: '500',
    fontSize: '16px',
    cursor: 'pointer',
    transition: '0.3s',
    borderRight: '1px solid #ddd',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px'
};

const thStyle = { padding: '12px', textAlign: 'left', fontSize: '14px', color: '#444', fontWeight: '700', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '12px', fontSize: '14px', color: '#333' };


export default AdminDashboard;