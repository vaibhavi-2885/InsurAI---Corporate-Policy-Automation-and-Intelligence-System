import React, { useState, useEffect, useRef } from 'react';
import axios from '../lib/httpClient';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi! Type a message or click the Mic.' }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    
    // Check browser support for speech recognition
    const [supportVoice, setSupportVoice] = useState(false);

    const messagesEndRef = useRef(null);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            setSupportVoice(true);
        }
    }, []);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert("Your browser does not support Voice. Please use Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();
        setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setIsListening(false);
            sendMessage(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech error:", event.error);
            setIsListening(false);
            // alert("Voice error: " + event.error); // Optional: alert on error
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };
    };

    const sendMessage = async (text) => {
        if (!text) return;
        const newMessages = [...messages, { sender: 'user', text: text }];
        setMessages(newMessages);
        setInput('');

        try {
            const response = await axios.post('/api/chat/ask', { message: text });
            const botReply = response.data.response;
            setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
            
            // Speak response
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(botReply);
                window.speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: "I can't connect to the server right now." }]);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
            {/* Toggle Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    style={{ 
                        width: '60px', height: '60px', borderRadius: '50%', 
                        backgroundColor: '#0056b3', color: 'white', border: 'none', 
                        fontSize: '30px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    💬
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{ 
                    width: '350px', height: '500px', backgroundColor: 'white', 
                    border: '1px solid #ddd', borderRadius: '12px', display: 'flex', 
                    flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', overflow: 'hidden' 
                }}>
                    <div style={{ padding: '15px', backgroundColor: '#0056b3', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>InsurAI Assistant</span>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                    </div>

                    <div style={{ flex: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{ 
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', 
                                backgroundColor: msg.sender === 'user' ? '#0056b3' : '#e9ecef', 
                                color: msg.sender === 'user' ? 'white' : '#333', 
                                padding: '10px 15px', borderRadius: '15px', maxWidth: '80%', fontSize: '14px' 
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ padding: '10px', borderTop: '1px solid #eee', backgroundColor: 'white', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        
                        {/* MIC BUTTON - Now Always Visible if supported */}
                        <button 
                            onClick={startListening}
                            style={{ 
                                backgroundColor: isListening ? '#dc3545' : '#28a745', 
                                color: 'white', border: 'none', width: '40px', height: '40px', 
                                borderRadius: '50%', cursor: 'pointer', display: 'flex', 
                                justifyContent: 'center', alignItems: 'center', fontSize: '20px',
                                minWidth: '40px' 
                            }}
                            title="Click to Speak"
                        >
                            {isListening ? '🛑' : '🎤'}
                        </button>

                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                            placeholder="Type a message..."
                            style={{ 
                                flex: 1, padding: '10px', borderRadius: '20px', 
                                border: '1px solid #ccc', outline: 'none' 
                            }}
                        />

                        <button 
                            onClick={() => sendMessage(input)} 
                            style={{ 
                                backgroundColor: '#0056b3', color: 'white', border: 'none', 
                                padding: '10px 15px', borderRadius: '20px', cursor: 'pointer' 
                            }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
