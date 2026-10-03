import React, { useState } from 'react';
import axios from '../lib/httpClient';

const DocumentUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!file) return alert("Please select a file first!");
        setUploading(true);
        
        // Simulating AI Verification
        setTimeout(() => {
            alert("AI Verification Successful: ID matches profile data.");
            setUploading(false);
        }, 2000);
    };

    return (
        <div style={{ padding: '20px', border: '2px dashed #0056b3', borderRadius: '10px', textAlign: 'center' }}>
            <h3>KYC Document Verification</h3>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleUpload} disabled={uploading} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
                {uploading ? "AI is Verifying..." : "Upload & Verify"}
            </button>
        </div>
    );
};

export default DocumentUpload;
