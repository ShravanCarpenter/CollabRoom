import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ChatRoom.css';

const ChatRoom = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomLink, setRoomLink] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    mode: '',
    email: '',
    _id: ''
  });
  const [joinRoomId, setJoinRoomId] = useState('');
  const [chatRooms, setChatRooms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  const API_BASE_URL = 'http://localhost:3000/api';
  const linkRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    const fetchChatRooms = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/chatrooms`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChatRooms(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
        setError('Failed to fetch chat rooms: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };

    fetchUserData();
    fetchChatRooms();
  }, [navigate]);

  // Fetch users for inviting to rooms
  const fetchUsers = async (searchQuery) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/users/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter out current user and already selected participants
      const filteredUsers = response.data.filter(user => 
        user._id !== userData._id && 
        !selectedParticipants.some(p => p._id === user._id)
      );
      
      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Debounced user search
  useEffect(() => {
    if (userSearchTerm.length > 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        fetchUsers(userSearchTerm);
      }, 500);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [userSearchTerm]);

  // Filter chat rooms based on search term
  const filteredChatRooms = chatRooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      // Get participant IDs from selected users
      const participantIds = selectedParticipants.map(p => p._id);
      
      const response = await axios.post(`${API_BASE_URL}/chatrooms/create`, {
        name: roomName,
        participants: participantIds // Server will add current user
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newRoomId = response.data.roomId;
      setRoomId(newRoomId);
      
      // Generate shareable link
      const baseUrl = window.location.origin;
      const roomLink = `${baseUrl}/join-room/${newRoomId}`;
      setRoomLink(roomLink);
      
      setChatRooms([...chatRooms, response.data]);
      setShowCreateForm(false);
      setRoomName('');
      setSelectedParticipants([]);
      setError('');
      setLoading(false);
    } catch (error) {
      console.error('Error creating chat room:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Failed to create chat room: ${errorMsg}`);
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/chatrooms/join`, {
        roomId: joinRoomId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowJoinForm(false);
      setJoinRoomId('');
      setError('');
      
      // Refresh chat rooms list
      const response = await axios.get(`${API_BASE_URL}/chatrooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatRooms(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error joining chat room:', error);
      setError('Failed to join chat room: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const leaveRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to leave this chat room?')) {
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/chatrooms/${roomId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update chat rooms list
      setChatRooms(chatRooms.filter(room => room.roomId !== roomId));
      setLoading(false);
    } catch (error) {
      console.error('Error leaving chat room:', error);
      setError('Failed to leave chat room: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const copyRoomLink = () => {
    if (linkRef.current) {
      linkRef.current.select();
      document.execCommand('copy');
    } else {
      navigator.clipboard.writeText(roomLink);
    }
    alert('Room link copied to clipboard!');
  };

  const enterChatRoom = (roomId) => {
    navigate(`/chat/${roomId}`);
  };

  const addParticipant = (user) => {
    setSelectedParticipants([...selectedParticipants, user]);
    setAvailableUsers(availableUsers.filter(u => u._id !== user._id));
    setUserSearchTerm('');
  };

  const removeParticipant = (userId) => {
    setSelectedParticipants(selectedParticipants.filter(p => p._id !== userId));
  };

  const formatDate = (dateString) => {
    const options = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getParticipantNames = (participants, max = 3) => {
    if (!participants || participants.length === 0) return 'No participants';
    
    const names = participants.map(p => p.name).slice(0, max);
    const remaining = participants.length > max ? ` +${participants.length - max} more` : '';
    
    return names.join(', ') + remaining;
  };

  return (
    <div className="chat-room-container">
      <div className="chat-header">
        <h2>Your Chat Rooms</h2>
        <div className="chat-actions">
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={() => setShowCreateForm(true)}>Create Room</button>
        </div>
      </div>
      <div className="chat-list">
        {filteredChatRooms.map(room => (
          <div key={room.roomId} className="chat-room-item">
            <div className="room-info">
              <h3>{room.name}</h3>
              <p>{getParticipantNames(room.participants)}</p>
            </div>
            <div className="room-actions">
              <button onClick={() => enterChatRoom(room.roomId)}>Join</button>
              <button onClick={() => leaveRoom(room.roomId)}>Leave</button>
            </div>
          </div>
        ))}
      </div>
      {showCreateForm && (
        <div className="create-room-form">
          <h2>Create New Room</h2>
          <form onSubmit={handleCreateRoom}>
            <div className="form-group">
              <label htmlFor="roomName">Room Name:</label>
              <input
                type="text"
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="participants">Participants:</label>
              <input
                type="text"
                id="participants"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Search for participants..."
              />
              <div className="user-list">
                {availableUsers.map(user => (
                  <div key={user._id} className="user-item">
                    <input
                      type="checkbox"
                      id={`participant-${user._id}`}
                      checked={selectedParticipants.some(p => p._id === user._id)}
                      onChange={() => addParticipant(user)}
                    />
                    <label htmlFor={`participant-${user._id}`}>{user.name}</label>
                  </div>
                ))}
              </div>
              <button type="submit">Create Room</button>
              <button onClick={() => setShowCreateForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {showJoinForm && (
        <div className="join-room-form">
          <h2>Join Existing Room</h2>
          <form onSubmit={handleJoinRoom}>
            <div className="form-group">
              <label htmlFor="roomId">Room ID:</label>
              <input
                type="text"
                id="roomId"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                required
              />
            </div>
            <button type="submit">Join Room</button>
            <button onClick={() => setShowJoinForm(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>  
  );
};

export default ChatRoom;

