import React, { useState } from 'react';
import axios from '../lib/httpClient';

const ClaimVision = () => {
    const [image, setImage] = useState(null);
    const [desc, setDesc] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('description', desc);

        setLoading(true);
        try {
            const res = await axios.post('/api/v1/claims/inspect', formData);
            setResult(res.data);
        } catch (err) {
            alert("Upload failed. Check backend.");
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '15px', border: '1px solid #ddd' }}>
            <h2 style={{ color: '#d9534f' }}>📸 AI Damage Inspection</h2>
            <input type="file" onChange={(e) => setImage(e.target.files[0])} style={{ marginBottom: '15px' }} />
            <textarea 
                placeholder="Describe the incident..." 
                onChange={(e) => setDesc(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}
            />
            <button onClick={handleUpload} style={{ width: '100%', padding: '12px', backgroundColor: '#d9534f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                {loading ? "AI Analyzing Image..." : "Submit for Inspection"}
            </button>

            {result && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fdf7f7', borderLeft: '5px solid #d9534f' }}>
                    <h4>Claim ID: {result.claimId}</h4>
                    <p><strong>AI Status:</strong> {result.aiAssessment}</p>
                    <p><strong>Confidence:</strong> {result.confidenceScore}</p>
                    <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Est. Payout: ₹{result.estimatedPayout}</p>
                </div>
            )}
        </div>
    );
};

export default ClaimVision;
