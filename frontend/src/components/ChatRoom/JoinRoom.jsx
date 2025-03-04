import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/CollabRoom logo.png';
import './ChatRoom.css';

const JoinRoom = () => {
    const [roomId, setRoomId] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3000/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (err) {
                console.error('Failed to fetch user details:', err);
            }
        };
        fetchUserDetails();
    }, []);


    const handleJoinRoom = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const userResponse = await axios.get('http://localhost:3000/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userId = userResponse.data._id;

            // Call the backend API to join the room
            const response = await axios.post(
                `http://localhost:3000/api/chat/join`,
                { roomId, userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // If successful, navigate to the chat room
            navigate(`/chat/${roomId}`);
        } catch (err) {
            console.error('Error joining room:', err);
            setError(err.response?.data?.error || 'Failed to join room');
        }
    };

    return (
        <>
            <img
                src={logo}
                alt="logo"
                className="join-room-logo"
                style={{ width: '150px', marginTop: '20px', marginLeft: '44%' }}
            />
            {/* User Info Display */}
            <div className="user-info">
                {user && (
                    <div className="user-info">
                        <p className='user-info-name'>Welcome! {user.name}</p>
                        <p className='user-info-email'>{user.email}</p>
                    </div>
                )}
            </div>
            <div className="join-room-container">
                <div className="join-room-container-info">
                    <div className="join-room-header">
                        <h2>Join a Chat Room</h2>
                        <p>Enter the Room ID to join a chat room.</p>
                    </div>
                    <div className="join-room-form">
                        <input
                            type="text"
                            placeholder="Room ID"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            required
                        />
                        <button onClick={handleJoinRoom}>Join Room</button>
                        {error && <p className="error-message">{error}</p>}
                    </div>
                </div>
                <div>
                    <p>
                        <a href='/dashboard' style={{ color: '#001e80', textDecoration: 'none', fontSize: '14px', marginTop: '30px' }}>
                            Back to Dashboard
                        </a>
                    </p>
                </div>
            </div>

        </>
    );
};

export default JoinRoom;