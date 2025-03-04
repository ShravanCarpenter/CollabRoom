import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';

const socket = io('http://localhost:3000');

const ChatPage = () => {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [username, setUsername] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Fetch logged-in user's info from MongoDB
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

    // Extract unique participants from message history
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
        // Fetch messages from MongoDB
        setLoading(true);
        axios.get(`http://localhost:3000/api/chat/message/${roomId}`)
            .then((response) => {
                setMessages(response.data);
                setLoading(false);
                scrollToBottom();
            })
            .catch((err) => {
                console.error('Failed to fetch messages:', err);
                setLoading(false);
            });

        // Join the chat room
        socket.emit('joinRoom', roomId);

        // Listen for new messages
        socket.on('receiveMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);

            // Add new participant if not already in list
            if (message.senderId !== userId) {
                setParticipants(prev => {
                    if (!prev.some(p => p._id === message.senderId)) {
                        return [...prev, {
                            _id: message.senderId,
                            name: message.senderName,
                            status: 'online'
                        }];
                    }
                    return prev;
                });
            }
        });

        return () => {
            socket.off('receiveMessage');
            socket.emit('leaveRoom', roomId);
        };
    }, [roomId, userId]);

    // Scroll to the latest message
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !userId) return;

        const messageData = {
            roomId,
            name,
            senderId: userId,
            senderName: username,
            text: newMessage
        };

        try {
            const response = await axios.post('http://localhost:3000/api/chat/message/send', messageData, { withCredentials: true });
            socket.emit('sendMessage', response.data);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleLeaveRoom = () => {
        socket.emit('leaveRoom', roomId);
        navigate('/dashboard');
    };

    return (
        <div className="chat-page">
            <div className="chat-container">
                <div className="chat-header">
                    <div className="chat-header-left">
                        <h1>Chat Room: {name}</h1>
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