import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';

const SOCKET_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3000/api';

const ChatPage = () => {
    // 1. State hooks (always first)
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [username, setUsername] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    // 2. Refs (after state hooks)
    const messagesEndRef = useRef(null);
    const socket = useRef(null);

    // 3. Router/navigation hooks
    const navigate = useNavigate();
    const { roomId } = useParams();

    // 4. Effects (in order of execution)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/api/auth/profile',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUsername(response.data.name);
                setUserId(response.data._id);

                // Add yourself to participants list
                setParticipants(prev => {
                    if (!prev.some(p => p._id === response.data._id)) {
                        return [...prev, {
                            _id: response.data._id,
                            name: response.data.name,
                            status: 'online'
                        }];
                    }
                    return prev;
                });
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (messages.length > 0 && userId) {
            // Extract unique participants from messages
            const uniqueSenders = {};

            messages.forEach(msg => {
                if (!uniqueSenders[msg.senderId] && msg.senderId !== userId) {
                    uniqueSenders[msg.senderId] = {
                        _id: msg.senderId,
                        name: msg.senderName,
                        status: 'online' // Assume online for now
                    };
                }
            });

            const messageParticipants = Object.values(uniqueSenders);

            // Update participants list with unique senders
            setParticipants(prev => {
                const existingIds = prev.map(p => p._id);
                const newParticipants = messageParticipants.filter(p => !existingIds.includes(p._id));
                return [...prev, ...newParticipants];
            });
        }
    }, [messages, userId]);

    useEffect(() => {
        // Initialize socket with proper room handling
        const token = localStorage.getItem('token');
        socket.current = io(SOCKET_URL, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
            autoConnect: true,
            forceNew: true
        });

        // Handle incoming messages
        const handleReceiveMessage = (message) => {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        };

        // Handle socket events
        socket.current.on('connect', () => {
            console.log('Connected to WebSocket');
            setConnectionStatus('connected');
            socket.current.emit('joinRoom', roomId);
        });

        socket.current.on('receiveMessage', handleReceiveMessage);

        socket.current.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setConnectionStatus('disconnected');
        });

        // Fetch initial messages after socket connection
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${API_URL}/chat/message/${roomId}`);
                setMessages(response.data);
                scrollToBottom();
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setLoading(false);
            }
        };

        if (socket.current.connected) {
            fetchMessages();
        } else {
            socket.current.once('connect', fetchMessages);
        }

        // Cleanup
        return () => {
            if (socket.current) {
                socket.current.off('receiveMessage', handleReceiveMessage);
                socket.current.emit('leaveRoom', roomId);
                socket.current.disconnect();
            }
        };
    }, [roomId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket.current) return;

        try {
            const messageData = {
                roomId,
                text: newMessage,
                senderId: userId,
                senderName: username,
                timestamp: new Date().toISOString()
            };

            // Optimistic update
            setMessages(prev => [...prev, { ...messageData, _id: Date.now().toString() }]);
            setNewMessage('');
            scrollToBottom();

            // Send via WebSocket
            socket.current.emit('sendMessage', messageData);

            // HTTP fallback/persistence
            await axios.post(`${API_URL}/chat/message/send`, messageData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

        } catch (error) {
            console.error('Failed to send message:', error);
            // Rollback optimistic update
            setMessages(prev => prev.filter(msg => msg._id !== Date.now().toString()));
            alert('Failed to send message. Please try again.');
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleLeaveRoom = () => {
        if (socket.current) {
            socket.current.emit('leaveRoom', roomId);
        }
        navigate('/dashboard');
    };

    // Render logic last
    if (!userId || !username) {
        return <div className="error-message">Authentication required...</div>;
    }

    return (
        <div className="chat-page">
            <div className="chat-container">
                <div className="chat-header">
                    <div className="chat-header-left">
                        <h1>Chat Room: {roomId}</h1>
                        <h2>Room ID: {roomId}</h2>
                    </div>
                    <button className="leave-button" onClick={handleLeaveRoom}>Leave Room</button>
                </div>

                <div className="chat-body">
                    <div className="participants-sidebar">
                        <div className="participants-header">
                            <h3>Participants ({participants.length})</h3>
                        </div>
                        <div className="participants-list">
                            {participants.map((participant) => (
                                <div key={participant._id} className="participant-item">
                                    <div className="participant-status-indicator online"></div>
                                    <div className="participant-name">
                                        {participant._id === userId ? `${participant.name} (You)` : participant.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="chat-content">
                        <div className="messages-container">
                            {loading ? (
                                <div className="loading-messages">Loading messages...</div>
                            ) : messages.length === 0 ? (
                                <div className="empty-chat">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`message ${msg.senderName === username ? 'user-message' : 'other-message'}`}
                                    >
                                        <div className="message-content">
                                            <div className="message-sender" style={{ color: msg.senderName === username ? 'white' : '#2d3748' }}>
                                                {msg.senderName === username ? 'You' : msg.senderName}
                                            </div>
                                            <div className="message-text">{msg.text}</div>
                                            {msg.timestamp && (
                                                <div className="message-time">{formatTime(msg.timestamp)}</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-input-container" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                className="message-input"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                            />
                            <button
                                type="submit"
                                className="send-button"
                                disabled={!newMessage.trim()}
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;