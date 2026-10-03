import React, { useState } from 'react';
import axios from '../lib/httpClient';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/users/forgot-password', { email });
            setMessage('✅ ' + res.data);
        } catch (error) {
            setMessage('❌ Error: Email not found.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '30px', textAlign: 'center' }}>
                <h2 style={{ color: '#dc3545' }}>Reset Password</h2>
                <p style={{ color: '#666', fontSize: '14px' }}>Enter your registered email to receive a reset link.</p>
                
                {message && <div style={{ margin: '15px 0', fontWeight: 'bold' }}>{message}</div>}

                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ marginBottom: '20px' }}
                    />
                    <button type="submit" style={{ width: '100%', backgroundColor: '#dc3545' }}>Send Reset Link</button>
                </form>

                <div style={{ marginTop: '20px' }}>
                    <Link to="/login" style={{ fontSize: '14px', color: '#333' }}>Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
