import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { useToast } from './ToastProvider'; // Assuming ToastProvider exists

// Fallback alert wrapper since we don't have ToastProvider in this context
const useToast = { 
    success: (msg) => alert(`Success: ${msg}`), 
    error: (msg) => alert(`Error: ${msg}`), 
    info: (msg) => alert(`Info: ${msg}`) 
};

const MyProfile = () => {
    const toast = useToast; 
    
    // Get current user ID (Must be done after login)
    const userId = localStorage.getItem('userId') || 1; 
    
    const [user, setUser] = useState({ fullName: '', email: '', phoneNumber: '', role: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchUser();
    }, [userId]);

    const fetchUser = async () => {
        setIsLoading(true);
        try {
            // API Call: GET /api/users/{id}
            const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
            const userData = response.data;
            setUser(userData);
            setFormData({ fullName: userData.fullName, phoneNumber: userData.phoneNumber });
            setIsLoading(false);
        } catch (error) {
            toast.error("Failed to load user profile. Ensure backend is running and user ID is valid.");
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // API Call: PUT /api/users/{id}
            await axios.put(`http://localhost:8080/api/users/${userId}`, formData);
            
            // Update UI state and clear editing state
            setUser({ ...user, ...formData });
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to save changes. Please try again.");
        }
    };
    
    const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ced4da', width: '100%', boxSizing: 'border-box', fontSize: '16px', backgroundColor: 'white', marginBottom: '15px' };
    const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50', fontSize: '14px' };

    if (isLoading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Profile...</div>;
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', color: '#0056b3', marginBottom: '10px', fontSize: '30px' }}>
                👤 My Profile & Account
            </h1>
            <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '30px', fontSize: '16px' }}>
                Manage your personal details and contact information.
            </p>

            <div className="card" style={{ padding: '30px', borderLeft: '5px solid #0056b3' }}>
                
                <form onSubmit={handleSave}>
                    
                    {/* Full Name */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={labelStyle}>Full Name</label>
                        <input 
                            name="fullName"
                            value={formData.fullName} 
                            onChange={handleChange} 
                            disabled={!isEditing} 
                            required 
                            style={{ ...inputStyle, backgroundColor: isEditing ? '#fff' : '#f0f0f0' }}
                        />
                    </div>
                    
                    {/* Email (Read-Only) */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={labelStyle}>Email Address (Read-Only)</label>
                        <input 
                            value={user.email} 
                            disabled 
                            style={{ ...inputStyle, backgroundColor: '#f0f0f0' }}
                        />
                    </div>
                    
                    {/* Phone Number */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Phone Number</label>
                        <input 
                            name="phoneNumber"
                            value={formData.phoneNumber} 
                            onChange={handleChange} 
                            disabled={!isEditing} 
                            type="tel"
                            placeholder="e.g., 9876543210"
                            style={{ ...inputStyle, backgroundColor: isEditing ? '#fff' : '#f0f0f0' }}
                        />
                    </div>
                    
                    {/* Role Tag */}
                    <div style={{ marginBottom: '30px' }}>
                        <span style={{ 
                            padding: '5px 15px', 
                            borderRadius: '20px', 
                            fontWeight: 'bold', 
                            fontSize: '12px', 
                            backgroundColor: user.role === 'ADMIN' ? '#dc3545' : user.role === 'AGENT' ? '#0056b3' : '#28a745', 
                            color: 'white'
                        }}>
                            Role: {user.role}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        {isEditing ? (
                            <>
                                <button type="button" onClick={() => { setIsEditing(false); setFormData({ fullName: user.fullName, phoneNumber: user.phoneNumber }); }} style={{ background: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px' }}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px' }}>
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <button type="button" onClick={() => setIsEditing(true)} style={{ background: '#0056b3', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px' }}>
                                Edit Details
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MyProfile;