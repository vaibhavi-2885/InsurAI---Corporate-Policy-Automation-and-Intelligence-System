import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Simulated Agent Data (Ideally fetched from /api/users/agent/{id} in a real system)
const AGENTS = [
    { id: 1, name: 'Amit Sharma', specialty: 'Life & Health', rating: 4.8 },
    { id: 2, name: 'Priya Verma', specialty: 'Motor Claims', rating: 4.5 },
];
const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];


const AgentDashboard = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' or 'schedule'
    const [isLoading, setIsLoading] = useState(false);
    
    // Form State for adding new availability
    const [newSlot, setNewSlot] = useState({
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '17:00'
    });

    // Get Agent ID (Must be done carefully in a real app; using 1 for demo based on login)
    const agentId = parseInt(localStorage.getItem('userId')) || 1; 
    const agentInfo = AGENTS.find(a => a.id === agentId) || { name: 'Your Name', specialty: 'General' };

    useEffect(() => {
        fetchAppointments();
        fetchAvailability();
    }, [agentId]);

    // --- DATA FETCHING ---
    const fetchAppointments = () => {
        axios.get(`http://localhost:8080/api/appointments/agent/${agentId}`)
            .then(response => {
                const sortedAppts = response.data.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
                setAppointments(sortedAppts);
            })
            .catch(error => console.error("Error fetching agent appointments:", error));
    };

    const fetchAvailability = () => {
        axios.get(`http://localhost:8080/api/availability/agent/${agentId}`)
            .then(response => {
                setAvailability(response.data);
            })
            .catch(error => console.error("Error fetching agent availability:", error));
    };


    // --- SCHEDULE MANAGEMENT ACTIONS ---
    const handleAddOrUpdateSlot = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const slotData = {
            agentId: agentId,
            dayOfWeek: newSlot.dayOfWeek,
            startTime: newSlot.startTime + ":00",
            endTime: newSlot.endTime + ":00",
            isAvailable: true 
        };

        try {
            await axios.post('http://localhost:8080/api/availability', slotData);
            alert(`Schedule updated for ${newSlot.dayOfWeek}.`);
            fetchAvailability();
        } catch (error) {
            alert(`Error: ${error.response?.data || "Could not connect to backend."}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm("Are you sure you want to delete this availability slot?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/availability/${id}`);
            alert('Slot deleted.');
            fetchAvailability();
        } catch (error) {
            alert(`Error deleting slot: ${error.message}`);
        }
    };


    // --- HELPER FUNCTIONS ---
    const getStatusStyle = (status) => {
        switch (status) {
            case 'SCHEDULED': return { color: '#0056b3', backgroundColor: '#e6f2ff', icon: '🕑' };
            case 'COMPLETED': return { color: '#28a745', backgroundColor: '#eaf8e9', icon: '✅' };
            case 'CANCELLED': return { color: '#dc3545', backgroundColor: '#fce8e6', icon: '❌' };
            default: return { color: '#666', backgroundColor: '#f7f7f7', icon: '❓' };
        }
    };

    const getAgentStatusTag = (available) => {
        const style = available 
            ? { background: '#eaf8e9', color: '#28a745' }
            : { background: '#f8d7da', color: '#dc3545' };
        return <span style={{ ...style, padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>
            {available ? 'Available' : 'Off Duty'}
        </span>;
    };


    return (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ color: '#0056b3', marginBottom: '10px' }}>
                👋 Welcome, Agent {agentInfo.name}
            </h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Managing {agentInfo.specialty} portfolio. Your ID: #{agentId}
            </p>

            {/* QUICK STATS */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div style={statCardStyle}>
                    <h3>{appointments.filter(a => a.status === 'SCHEDULED').length}</h3>
                    <p>Upcoming Meetings</p>
                </div>
                <div style={statCardStyle}>
                    <h3>{appointments.length}</h3>
                    <p>Total Appointments</p>
                </div>
                <div style={statCardStyle}>
                    <h3>{availability.length}</h3>
                    <p>Active Slots Set</p>
                </div>
            </div>

            {/* TABBED INTERFACE */}
            <div style={{ display: 'flex', borderBottom: '2px solid #ddd', marginBottom: '20px' }}>
                <button 
                    onClick={() => setActiveTab('appointments')}
                    style={activeTab === 'appointments' ? activeTabStyle : inactiveTabStyle}
                >
                    Scheduled Appointments
                </button>
                <button 
                    onClick={() => setActiveTab('schedule')}
                    style={activeTab === 'schedule' ? activeTabStyle : inactiveTabStyle}
                >
                    Availability Management
                </button>
            </div>

            {/* --- APPOINTMENTS TAB --- */}
            {activeTab === 'appointments' && (
                <div className="card" style={{ padding: '30px' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                        Your Client Schedule
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f7f7f7' }}>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Time</th>
                                <th style={thStyle}>Client ID</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No appointments currently scheduled.</td></tr>
                            ) : (
                                appointments.map(appt => {
                                    const statusStyle = getStatusStyle(appt.status);
                                    return (
                                        <tr key={appt.appointmentId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={tdStyle}>{appt.appointmentDate}</td>
                                            <td style={tdStyle}>{appt.timeSlot ? appt.timeSlot.substring(0, 5) : 'N/A'} IST</td>
                                            <td style={tdStyle}>Customer #{appt.customerId}</td>
                                            <td style={tdStyle}>
                                                <span style={{ ...statusStyle, padding: '4px 10px', borderRadius: '15px', fontSize: '12px' }}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                {appt.status === 'SCHEDULED' && (
                                                    <a href={appt.meetingLink} target="_blank" rel="noreferrer" style={joinCallButtonStyle}>
                                                        Join Call
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- AVAILABILITY MANAGEMENT TAB --- */}
            {activeTab === 'schedule' && (
                <div style={{ display: 'flex', gap: '30px' }}>
                    
                    {/* FORM: Add/Update Slot */}
                    <div className="card" style={{ flex: 1, padding: '30px', minWidth: '350px' }}>
                        <h3 style={formHeaderStyle}>Set Your Weekly Hours</h3>
                        <form onSubmit={handleAddOrUpdateSlot}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>Day of Week</label>
                                <select 
                                    value={newSlot.dayOfWeek} 
                                    onChange={e => setNewSlot({...newSlot, dayOfWeek: e.target.value})}
                                    style={inputStyle}
                                >
                                    {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Start Time</label>
                                    <input type="time" value={newSlot.startTime} onChange={e => setNewSlot({...newSlot, startTime: e.target.value})} required style={inputStyle} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>End Time</label>
                                    <input type="time" value={newSlot.endTime} onChange={e => setNewSlot({...newSlot, endTime: e.target.value})} required style={inputStyle} />
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} style={{ width: '100%', background: '#0056b3', padding: '12px' }}>
                                {isLoading ? 'Saving...' : 'Add / Update Slot'}
                            </button>
                            <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                                Note: Adding a day overwrites the existing entry for that day.
                            </p>
                        </form>
                    </div>

                    {/* TABLE: Current Schedule */}
                    <div className="card" style={{ flex: 2, padding: '30px' }}>
                        <h3 style={formHeaderStyle}>Your Current Availability</h3>
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr style={{ background: '#f7f7f7' }}>
                                    <th style={thStyle}>Day</th>
                                    <th style={thStyle}>Hours</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DAYS_OF_WEEK.map(day => {
                                    const slot = availability.find(a => a.dayOfWeek === day);
                                    const time = slot ? `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}` : 'OFF';
                                    const isAvailable = slot?.isAvailable || false;
                                    return (
                                        <tr key={day} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={tdStyle}>{day}</td>
                                            <td style={tdStyle}>{time}</td>
                                            <td style={tdStyle}>{getAgentStatusTag(isAvailable)}</td>
                                            <td style={tdStyle}>
                                                {slot && (
                                                    <button 
                                                        onClick={() => handleDeleteSlot(slot.id)} 
                                                        style={{ background: '#dc3545', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '12px' }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const statCardStyle = {
    flex: 1,
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    textAlign: 'center',
    borderBottom: '3px solid #0056b3'
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
    borderRight: '1px solid #ddd'
};

const thStyle = { padding: '12px', textAlign: 'left', fontSize: '14px', color: '#444', fontWeight: '700', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '12px', fontSize: '14px', color: '#333' };

const joinCallButtonStyle = {
    backgroundColor: '#0056b3', 
    color: 'white', 
    padding: '8px 12px', 
    borderRadius: '4px', 
    textDecoration: 'none', 
    fontWeight: '600',
};

const formHeaderStyle = { 
    color: '#0056b3', 
    borderBottom: '1px solid #0056b31a', 
    paddingBottom: '15px', 
    marginBottom: '20px', 
    fontWeight: '700' 
};

const labelStyle = {
    display: 'block', 
    marginBottom: '8px', 
    fontWeight: '600', 
    color: '#2c3e50', 
    fontSize: '14px'
};

const inputStyle = {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '16px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

export default AgentDashboard;