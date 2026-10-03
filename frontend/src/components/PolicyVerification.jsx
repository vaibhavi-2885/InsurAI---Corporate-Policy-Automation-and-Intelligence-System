import React, { useState, useEffect } from 'react';
import axios from '../lib/httpClient';

const PolicyVerification = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                // Fetching the real persistent data from your new repository
                const response = await axios.get('/api/v1/documents/my-policies');
                setPolicies(response.data);
            } catch (error) {
                console.error("Error fetching policies:", error);
            }
            setLoading(false);
        };
        fetchPolicies();
    }, []);

    return (
        <div style={{ padding: '30px', backgroundColor: '#f4f7f6', borderRadius: '15px' }}>
            <h2 style={{ color: '#0056b3' }}>📜 Your Digital Policy Vault</h2>
            <p style={{ color: '#666' }}>All documents are secured with an AI-generated digital signature.</p>

            {loading ? <p>Loading Vault...</p> : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {policies.map(policy => (
                        <div key={policy.id} style={{ 
                            padding: '20px', backgroundColor: 'white', borderRadius: '10px', 
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #28a745' 
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Policy: {policy.policyNumber}</strong>
                                <span style={{ color: '#28a745', fontWeight: 'bold' }}>● {policy.status}</span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                                🔑 Digital Hash: <code style={{ backgroundColor: '#eee', padding: '2px 5px' }}>{policy.digitalSignatureHash}</code>
                            </p>
                            <button style={{ 
                                marginTop: '10px', padding: '8px 15px', backgroundColor: '#0056b3', 
                                color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' 
                            }}>
                                Download Verified PDF
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PolicyVerification;
