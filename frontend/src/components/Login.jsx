import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from '../lib/httpClient';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState('');

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Email is required'),
            password: Yup.string().required('Password is required'),
        }),
        onSubmit: async (values) => {
            try {
                const response = await axios.post('/api/users/login', values);
                alert(`Welcome back, ${response.data.fullName}!`);
                
                // 1. Save user info to LocalStorage
                localStorage.setItem('userRole', response.data.role);
                localStorage.setItem('userId', response.data.id);

                // 2. Redirect based on Role
                // We use window.location.href instead of navigate() to FORCE a page reload.
                // This ensures the Navbar updates instantly to show the correct links.
                if (response.data.role === 'ADMIN') {
                    window.location.href = '/admin';
                } else if (response.data.role === 'AGENT') {
                    window.location.href = '/agent-dashboard';
                } else {
                    window.location.href = '/dashboard';
                }
                
            } catch (error) {
                setErrorMsg('Invalid Email or Password');
            }
        },
    });

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '30px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '10px', backgroundColor: 'white' }}>
                <h2 style={{ textAlign: 'center', color: '#0056b3', marginBottom: '10px' }}>🔐 Login Portal</h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>Access your InsurAI Account</p>
                
                {errorMsg && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{errorMsg}</div>}

                <form onSubmit={formik.handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{display:'block', marginBottom:'5px', fontWeight:'bold', color:'#333'}}>Email Address</label>
                        <input name="email" type="email" {...formik.getFieldProps('email')} style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ccc', boxSizing: 'border-box'}} />
                        {formik.touched.email && formik.errors.email ? <div style={{ color: 'red', fontSize: '12px', marginTop:'5px' }}>{formik.errors.email}</div> : null}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{display:'block', marginBottom:'5px', fontWeight:'bold', color:'#333'}}>Password</label>
                        <input name="password" type="password" {...formik.getFieldProps('password')} style={{width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ccc', boxSizing: 'border-box'}} />
                        {formik.touched.password && formik.errors.password ? <div style={{ color: 'red', fontSize: '12px', marginTop:'5px' }}>{formik.errors.password}</div> : null}
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                        <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>Forgot Password?</Link>
                    </div>

                    <button type="submit" style={{ width: '100%', backgroundColor: '#0056b3', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>Secure Login</button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
                    Don't have an account? <Link to="/register" style={{ fontWeight: 'bold', color: '#28a745', textDecoration: 'none' }}>Register Here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
