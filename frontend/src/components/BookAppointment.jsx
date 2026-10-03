import React, { useEffect, useState, useMemo } from 'react';
import axios from '../lib/httpClient';
import { useNavigate } from 'react-router-dom';

const AGENTS = [ // Simulated Agent Data for the Frontend
    { id: 1, name: 'Amit Sharma', specialty: 'Life & Health', rating: 4.8, available: true },
    { id: 2, name: 'Priya Verma', specialty: 'Motor Claims', rating: 4.5, available: true },
    { id: 3, name: 'Rahul Singh', specialty: 'Investment Plans', rating: 4.9, available: false },
];

const BookAppointment = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [selectedAgentId, setSelectedAgentId] = useState(AGENTS[0].id);
    const [isLoading, setIsLoading] = useState(false);

    const userId = localStorage.getItem('userId') || 1; 

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = () => {
        axios.get(`/api/appointments/user/${userId}`)
            .then(response => {
                const sortedAppts = response.data.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
                setAppointments(sortedAppts);
            })
            .catch(error => {
                console.error("Error fetching appointments:", error);
            });
    };
    
    // Simulating available time slots based on the selected agent and day
    const availableSlots = useMemo(() => {
        if (!date) return [];
        // In a real app, this would be an API call to the backend: /api/agents/availability?date={date}&agentId={id}
        // Simulation: 30-minute slots from 10:00 to 16:00
        const slots = ['10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
        return slots.filter(slot => {
            // Filter out already booked slots for this agent on this date
            const isBooked = appointments.some(appt => 
                appt.appointmentDate === date && appt.timeSlot.substring(0, 5) === slot && appt.agentId === selectedAgentId
            );
            return !isBooked;
        });
    }, [date, selectedAgentId, appointments]);

    const handleBook = async (e) => {
        e.preventDefault();
        if (!date || !time || !selectedAgentId) {
            alert('Please select a date, time, and agent.');
            return;
        }
        setIsLoading(true);

        const appointmentData = {
            customerId: userId,
            agentId: selectedAgentId, 
            appointmentDate: date,
            timeSlot: time + ":00", 
            status: "SCHEDULED"
        };

        try {
            await axios.post('/api/appointments/book', appointmentData);
            alert("Appointment Booked Successfully! Check your email for meeting link.");
            fetchAppointments(); 
            setDate('');
            setTime('');
            setSelectedAgentId(AGENTS[0].id);
        } catch (error) {
            alert("Failed to book appointment. Ensure your backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'SCHEDULED': return { color: '#0056b3', backgroundColor: '#e6f2ff', icon: '🕑' };
            case 'COMPLETED': return { color: '#28a745', backgroundColor: '#eaf8e9', icon: '✅' };
            case 'CANCELLED': return { color: '#dc3545', backgroundColor: '#fce8e6', icon: '❌' };
            default: return { color: '#666', backgroundColor: '#f7f7f7', icon: '❓' };
        }
    };

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', color: '#0056b3', marginBottom: '40px', fontSize: '32px' }}>
                Schedule a Consultation
            </h1>

            {/* 1. AGENT SELECTION & BOOKING CARD */}
            <div className="card" style={{ padding: '40px', marginBottom: '50px', borderLeft: '5px solid #0056b3' }}>
                <h3 style={{ borderBottom: '1px solid #0056b31a', paddingBottom: '15px', marginBottom: '30px', color: '#2c3e50', fontWeight: '700' }}>
                    Select Agent & Time Slot
                </h3>
                
                {/* Agent Selector Section */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={labelStyle}>Choose Your Expert</label>
                    <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {AGENTS.map(agent => (
                            <div 
                                key={agent.id}
                                onClick={() => agent.available && setSelectedAgentId(agent.id)}
                                style={{
                                    ...agentCardStyle,
                                    border: selectedAgentId === agent.id ? '2px solid #0056b3' : '1px solid #ddd',
                                    opacity: agent.available ? 1 : 0.5,
                                    cursor: agent.available ? 'pointer' : 'not-allowed',
                                }}
                            >
                                <span style={{fontSize: '24px', marginBottom: '5px'}}>👤</span>
                                <span style={{ fontWeight: '600' }}>{agent.name}</span>
                                <span style={{ fontSize: '12px', color: '#666' }}>{agent.specialty}</span>
                                {agent.available ? (
                                    <span style={{ fontSize: '12px', color: '#28a745', fontWeight: 'bold' }}>★ {agent.rating} Rating</span>
                                ) : (
                                    <span style={{ fontSize: '12px', color: '#dc3545', fontWeight: 'bold' }}>Unavailable</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Booking Form Section */}
                <form onSubmit={handleBook} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    
                    {/* Date Input */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={labelStyle}>Select Date</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            required 
                            min={new Date().toISOString().split('T')[0]}
                            style={inputStyle}
                        />
                    </div>

                    {/* Time Slot Selector */}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={labelStyle}>Select Available Time</label>
                        <select 
                            value={time} 
                            onChange={(e) => setTime(e.target.value)} 
                            required 
                            style={inputStyle}
                        >
                            <option value="" disabled>-- Choose Slot --</option>
                            {availableSlots.length === 0 ? (
                                <option disabled>No slots available on this date</option>
                            ) : (
                                availableSlots.map(slot => (
                                    <option key={slot} value={slot}>{slot} IST</option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Button */}
                    <button 
                        type="submit" 
                        disabled={isLoading || !date || !time || availableSlots.length === 0}
                        style={{ padding: '14px 30px', backgroundColor: '#28a745', fontWeight: '700', minWidth: '220px', boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)' }}
                    >
                        {isLoading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                </form>
            </div>

            {/* 2. UPCOMING APPOINTMENTS LIST */}
            <h2 style={{ color: '#2c3e50', marginBottom: '25px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                Your Scheduled Consultations
            </h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
                {appointments.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f9f9f9' }}>
                        <p style={{ color: '#888', fontStyle: 'italic', margin: 0 }}>
                            No scheduled consultations found. Book a slot above!
                        </p>
                    </div>
                ) : (
                    appointments.map(appt => {
                        const statusStyle = getStatusStyle(appt.status);
                        const agent = AGENTS.find(a => a.id === appt.agentId) || { name: 'Unknown Agent' };
                        return (
                            <div key={appt.appointmentId} className="card" style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '25px', 
                                borderLeft: `6px solid ${statusStyle.color}`,
                            }}>
                                
                                {/* Appointment Details */}
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#0056b3', marginBottom: '5px' }}>
                                        {statusStyle.icon} Session with {agent.name}
                                    </div>
                                    <p style={{ margin: '0', color: '#444' }}>
                                        <span style={{ fontWeight: '600' }}>Date:</span> {appt.appointmentDate} &nbsp; | &nbsp; 
                                        <span style={{ fontWeight: '600' }}>Time:</span> {appt.timeSlot ? appt.timeSlot.substring(0, 5) : 'N/A'} IST
                                    </p>
                                </div>
                                
                                {/* Status and Action */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    {/* Status Badge */}
                                    <span style={{ 
                                        ...statusStyle, 
                                        padding: '6px 12px', 
                                        borderRadius: '20px', 
                                        fontWeight: 'bold', 
                                        fontSize: '13px', 
                                        textTransform: 'uppercase' 
                                    }}>
                                        {appt.status}
                                    </span>

                                    {/* Action Button */}
                                    {appt.status === 'SCHEDULED' && (
                                        <a 
                                            href={appt.meetingLink} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            style={{ 
                                                backgroundColor: '#0056b3', 
                                                color: 'white', 
                                                padding: '10px 18px', 
                                                borderRadius: '6px', 
                                                textDecoration: 'none', 
                                                fontWeight: '600',
                                                boxShadow: '0 4px 8px rgba(0,86,179,0.3)'
                                            }}
                                        >
                                            Join Video Call
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const labelStyle = {
    display: 'block', 
    marginBottom: '8px', 
    fontWeight: '600', 
    color: '#2c3e50', 
    fontSize: '14px'
};

const inputStyle = {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    width: '100%',
    boxSizing: 'border-box',
    fontSize: '16px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

const agentCardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    minWidth: '150px',
    textAlign: 'center',
    transition: 'all 0.2s',
};


export default BookAppointment;
