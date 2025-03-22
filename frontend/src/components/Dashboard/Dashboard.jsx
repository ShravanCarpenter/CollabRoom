import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdLogOut, IoMdSettings, IoMdMenu } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { BiHome, BiBookAlt, BiEdit, BiVideo, BiChat, BiCog, BiCalendar } from "react-icons/bi";
import { RxLink2 } from "react-icons/rx";
import './Dashboard.css';
import logo from '../../Assets/CollabRoom logo.png';
import TaskManagement from '../TaskManagement/TaskManagement';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Home');
    const [userData, setUserData] = useState({
        name: '',
        mode: '',
        email: ''
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get('http://localhost:3000/api/auth/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setUserData(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleLogout = async (event) => {
        event.stopPropagation();
        console.log("Logout button clicked");
        try {
            localStorage.removeItem('token');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleUpdateProfile = () => {
        navigate('/profile/update');
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const handleCreateRoom = () => {
        navigate('/create-room');
    };

    const handleJoinRoom = () => {
        navigate('/join-room');
    };

    const handleCreateDocumentEditing = () => {
        navigate('/create-document-editing');
    };

    const handleJoinDocumentEditing = () => {
        navigate('/join-document-editing');
    };

    const sidebarItems = [
        { name: 'Home', icon: <BiHome size={24} /> },
        { name: 'Study Room', icon: <BiBookAlt size={24} /> },
        { name: 'Document Editing', icon: <BiEdit size={24} /> },
        { name: 'Video Conferencing', icon: <BiVideo size={24} /> },
        { name: 'Chat', icon: <BiChat size={24} /> },
        { name: 'Settings', icon: <BiCog size={24} /> }
    ];

    const getInitials = (name) => {
        if (!name || typeof name !== 'string') return '?';
        const nameParts = name.trim().split(' ');
        const initials = nameParts
            .filter(part => part.length > 0)
            .map(part => part.charAt(0).toUpperCase())
            .join('');
        return initials || '?';
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'Home':
                return (
                    <div className="home-section">
                        <div className="home-section-content">
                            <h2>Welcome to the CollabRoom, {userData.name}...</h2>
                            <div className="dashboard-info">
                                <p>This is your personal workspace. Navigate through different sections using the sidebar.</p>
                            </div>
                        </div>
                        <div className="task-management-panel">
                            <TaskManagement />
                        </div>
                    </div>
                );
            case 'Study Room':
                return (
                    <div className="study-room-section">
                        <h2>Study Room</h2>
                        <p>Join a study room or create your own.</p>
                        <button onClick={() => navigate('/study-room')}>Let's Start</button>
                    </div>
                );
            case 'Document Editing':
                return (
                    <div className="document-editing-section">
                        <div className="document-editing-section-content">
                            <h2>Document Editing</h2>
                            <p>Join a document editing room or create your own.</p>
                            <div className="document-editing-section-content-buttons">
                                <button onClick={handleCreateDocumentEditing}>Create Document</button>
                                <button onClick={handleJoinDocumentEditing}>Join Document</button>
                            </div>
                        </div>
                    </div>
                );
            case 'Video Conferencing':
                return (
                    <div className="video-conference-section">
                        <h2>Video Conference</h2>
                        <div className="options-container">
                            <div className="option-card" onClick={() => navigate('/create-meeting')}>
                                <BiVideo size={38} color='white' />
                                <h2>Create New Meeting</h2>
                                <p>Start a new video conference</p>
                            </div>
                            <div className="option-card" onClick={() => navigate('/join-meeting')}>
                                <RxLink2 size={38} color='white' />
                                <h2>Join via Link</h2>
                                <p>Join using a meeting link</p>
                            </div>
                            <div className="option-card" onClick={() => navigate('/my-meetings')}>
                                <BiCalendar size={38} color='white' />
                                <h2>My Meetings</h2>
                                <p>View your scheduled and past meetings</p>
                            </div>
                        </div>
                    </div>
                );
            case 'Chat':
                return (
                    <div className="chat-section-wrapper">
                        <div className="chat-section">
                            <div className="chat-section-header">
                                <h2>Chat</h2>
                                <p>Create a new chat room or join an existing one.</p>
                            </div>
                            <div className="chat-section-content">
                                <button onClick={handleCreateRoom}>Create Room</button>
                                <button onClick={handleJoinRoom}>Join Room</button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`dashboard-container`}>
            {/* Navbar */}
            <div className="dash-navbar">
                <button className='menu-btn' onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <IoMdMenu size={24} />
                </button>
                <div className="logo">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="nav-profile" ref={dropdownRef}>
                    <div
                        className="profile-trigger"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        ref={dropdownRef}
                    >
                        <div className="profile-circle">
                            {getInitials(userData.name)}
                        </div>
                        <div className="profile-details">
                            <div className="profile-name">{userData.name || 'Guest'}</div>
                            <div className="profile-subtitle">{userData.mode?.toUpperCase() || 'WELCOME'}</div>
                        </div>
                    </div>

                    {isDropdownOpen && (
                        <div className="profile-dropdown">
                            <div className="profile-header">
                                <div className="profile-circle large">
                                    {getInitials(userData.name)}
                                </div>
                                <div className="profile-info">
                                    <div className="info-name">{userData.name}</div>
                                    <div className="info-email">{userData.email}</div>
                                    <div className="info-role">{userData.mode?.toUpperCase()}</div>
                                </div>
                            </div>

                            <div className="profile-actions">
                                <button className="action-btn" onClick={handleUpdateProfile}>
                                    <CgProfile />
                                    <span>Profile Settings</span>
                                </button>
                                <button className="action-btn">
                                    <IoMdSettings />
                                    <span>Preferences</span>
                                </button>
                                <button className="action-btn logout" onClick={handleLogout}>
                                    <IoMdLogOut />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Layout */}
            <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                {/* Sidebar */}
                <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                    {sidebarItems.map((item) => (
                        <div
                            key={item.name}
                            className={`sidebar-item ${activeTab === item.name ? 'active' : ''}`}
                            onClick={() => handleTabClick(item.name)}
                        >
                            <span className="icon">{item.icon}</span>
                            <span className="text">{item.name}</span>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="content-wrapper">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;