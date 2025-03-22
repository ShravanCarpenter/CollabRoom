import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BiCopy } from 'react-icons/bi';
import './ChatRoom.css';
import logo from '../../../public/Assets/CollabRoom logo.png';

const CreateRoom = () => {
    const [roomName, setRoomName] = useState('');
    const [roomLink, setRoomLink] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Fetch user details on component mount
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
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

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/chat/create', { name: roomName });
            const { roomId } = response.data;
            setRoomLink(`${roomId}`);
        } catch (err) {
            console.error('Failed to create room:', err);
        }
    };

    return (
        <>
            <img src={logo} alt="logo" className="create-room-logo" style={{ width: '150px', marginTop: '20px', marginLeft: '44%' }} />

            {/* User Info Display */}
            <div className="user-info">
                {user && (
                    <div className="user-info">
                        <p className='user-info-name'>Welcome! {user.name}</p>
                        <p className='user-info-email'>{user.email}</p>
                    </div>
                )}
            </div>

            <div className="create-room-container">

                <div className="create-room-header">
                    <h2>Create Chat Room</h2>
                    <p>Enter the name of the chat room you want to create.</p>
                </div>

                <div className="create-room-form">
                    <form onSubmit={handleCreateRoom}>
                        <input
                            type="text"
                            placeholder="Enter Room Name"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            required
                        />
                        <button type="submit">Create</button>
                    </form>
                </div>

                <div className="create-room-link">
                    {roomLink && (
                        <div className="create-room-link-container">
                            <div className="create-room-link-container-info">
                                <p className='create-room-link'>Room Link:</p>
                                <p className="create-room-link-text">{roomLink}</p>
                                <button onClick={() => navigator.clipboard.writeText(roomLink)}>
                                    <BiCopy size={20} />
                                </button>
                            </div>
                            <div className="create-room-button">
                                <button onClick={() => navigate(`/chat/${roomLink}`)}>Join Room</button>
                            </div>
                        </div>
                    )}
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

export default CreateRoom;
