import React, { useEffect, useState } from 'react';
import axios from '../lib/httpClient';
import { getApiBase } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = getApiBase();

const AgentAvailability = () => {
    const navigate = useNavigate();
    const [agentId] = useState(localStorage.getItem('userId') || 2); 
    const [availability, setAvailability] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    useEffect(() => {
        if (agentId) {
            fetchAvailability();
        }
    }, [agentId]);

    const fetchAvailability = async () => {
        setIsLoading(true);
        try {
            // Fetch the existing schedule from the backend
            const response = await axios.get(`${API_BASE_URL}/api/availability/agent/${agentId}`);
            const fetchedData = response.data;
            
            // Map fetched data to days and ensure all 7 days are represented
            const scheduleMap = new Map(fetchedData.map(item => [item.dayOfWeek, item]));
            
            const initialSchedule = daysOfWeek.map(day => {
                const existing = scheduleMap.get(day);
                return {
                    // Use existing DB ID for updates, or null for new inserts
                    id: existing ? existing.id : null,
                    agentId: agentId,
                    dayOfWeek: day,
                    // Use existing times or set a default range (09:00 - 17:00)
                    startTime: existing && existing.startTime ? existing.startTime.substring(0, 5) : '09:00',
                    endTime: existing && existing.endTime ? existing.endTime.substring(0, 5) : '17:00',
                    // Default to AVAILABLE unless explicit record says otherwise
                    isAvailable: existing ? existing.isAvailable : true, 
                };
            });
            setAvailability(initialSchedule);
        } catch (error) {
            console.error("Error fetching availability:", error);
            setMessage("Failed to load schedule.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (index, field, value) => {
        setAvailability(prev => {
            const newSchedule = [...prev];
            newSchedule[index][field] = value;
            
            // If the user enables the checkbox, ensure times are sane defaults
            if (field === 'isAvailable' && value === true) {
                 newSchedule[index].startTime = '09:00';
                 newSchedule[index].endTime = '17:00';
            }
            // If the user disables the checkbox, ensure times are 00:00:00 for the backend
            if (field === 'isAvailable' && value === false) {
                 newSchedule[index].startTime = '00:00';
                 newSchedule[index].endTime = '00:00';
            }
            return newSchedule;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        const slotsToSave = availability.map(slot => ({
            id: slot.id,
            agentId: slot.agentId,
            dayOfWeek: slot.dayOfWeek,
            // Format time back to HH:mm:ss for Spring Boot
            startTime: slot.isAvailable ? slot.startTime + ':00' : '00:00:00',
            endTime: slot.isAvailable ? slot.endTime + ':00' : '00:00:00',
            isAvailable: slot.isAvailable
        }));

        try {
            // Send array of all slots to the backend to be processed by a controller that handles both PUT/POST
            // We assume a single endpoint that can take multiple slots is the goal, but we will loop for safety.
            for (const slot of slotsToSave) {
                // If it has an ID, we UPDATE (PUT). If not, we CREATE (POST).
                if (slot.id) {
                    await axios.put(`${API_BASE_URL}/api/availability/${slot.id}`, slot);
                } else {
                    await axios.post(`${API_BASE_URL}/api/availability`, slot);
                }
            }
            
            setMessage("Schedule updated successfully!");
            // Re-fetch to confirm new IDs for newly added slots
            await fetchAvailability(); 
            
        } catch (error) {
            console.error("Error saving schedule:", error);
            setMessage("Failed to save schedule. Check that start time is before end time and that your backend is up.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Schedule Editor...</div>;
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: '#0056b3', marginBottom: '10px' }}>🗓️ Edit Weekly Availability</h1>
            <p style={{ color: '#666', marginBottom: '40px' }}>
                Set the default hours when you are available for consultations.
            </p>

            {message && <div style={messageStyle(message.includes("success") ? 'green' : 'red')}>{message}</div>}

            <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', gap: '15px', fontWeight: '700', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px', color: '#2c3e50' }}>
                    <span>Day</span>
                    <span>Start Time</span>
                    <span>End Time</span>
                    <span>Available</span>
                </div>

                {availability.map((slot, index) => (
                    <div key={slot.dayOfWeek} style={rowStyle(slot.isAvailable)}>
                        <span style={{ fontWeight: '600' }}>{slot.dayOfWeek}</span>
                        
                        <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => handleInputChange(index, 'startTime', e.target.value)}
                            disabled={!slot.isAvailable}
                            required={slot.isAvailable}
                            style={inputStyle}
                        />

                        <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => handleInputChange(index, 'endTime', e.target.value)}
                            disabled={!slot.isAvailable}
                            required={slot.isAvailable}
                            style={inputStyle}
                        />
                        
                        <input
                            type="checkbox"
                            checked={slot.isAvailable}
                            onChange={(e) => handleInputChange(index, 'isAvailable', e.target.checked)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                    </div>
                ))}
                
                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ marginTop: '30px', padding: '15px 30px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)' }}
                >
                    {isLoading ? 'Saving...' : 'Save Schedule'}
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/agent-dashboard')}
                    style={{ marginLeft: '10px', padding: '15px 30px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                    Back to Dashboard
                </button>
            </form>
        </div>
    );
};

// --- STYLES ---

const rowStyle = (isAvailable) => ({
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr 1fr 100px', 
    gap: '15px', 
    alignItems: 'center', 
    padding: '10px 0', 
    borderBottom: '1px dotted #eee',
    opacity: isAvailable ? 1 : 0.6,
    backgroundColor: isAvailable ? 'white' : '#fcfcfc',
});

const inputStyle = {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    width: '90%',
    boxSizing: 'border-box',
};

const messageStyle = (color) => ({
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    backgroundColor: color === 'green' ? '#eaf8e9' : '#fce8e6',
    color: color === 'green' ? '#28a745' : '#dc3545',
    fontWeight: '600',
    border: `1px solid ${color === 'green' ? '#28a745' : '#dc3545'}`,
});

export default AgentAvailability;
