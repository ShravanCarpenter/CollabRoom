import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdLogOut, IoMdSettings, IoMdMenu } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { BiHome, BiBookAlt, BiEdit, BiVideo, BiChat, BiCog, BiCalendar } from "react-icons/bi";
import { RxLink2 } from "react-icons/rx";
import './Dashboard.css';
import TaskManagement from '../TaskManagement/TaskManagement';
import Whiteboard from '../StudyRoom/Whiteboard';
import JoinCreateRoom from '../StudyRoom/JoinCreateRoom';
import { v4 as uuidv4 } from 'uuid';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Home');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userData, setUserData] = useState({
        name: '',
        mode: '',
        email: ''
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const profileDropdownRef = useRef(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [roomJoined, setRoomJoined] = useState(false);
    
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                setFilteredResults([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Save dashboard state
        localStorage.setItem('lastSection', 'dashboard');

        // Cleanup
        return () => {
            const currentSection = localStorage.getItem('lastSection');
            if (currentSection === 'dashboard') {
                localStorage.removeItem('lastSection');
            }
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

    const handleLogout = async () => {
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

    return (
        <div className="dashboard-container">
            {/* Navbar */}
            <div className="dash-navbar">
                <div className="logo">
                    <img src="/CollabRoom logo.png" alt="Logo" />
                </div>

                <div className="nav-profile">
                    <div
                        className="profile-trigger"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        ref={dropdownRef}
                    >
                        <div className="profile-circle">
                            {userData.name?.charAt(0) || '?'}
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
                                    {userData.name?.charAt(0) || '?'}
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

            {/* Main Layout with Sidebar and Content Areas */}
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
                    <div className="main-content">
                        {activeTab === 'Home' && (
                            <div className="home-section">
                                <div className="home-section-content">
                                    <h2>Welcome to the CollabRoom, {userData.name}...</h2>
                                    {/* Main content goes here */}
                                    <div className="dashboard-info">
                                        <p>This is your personal workspace. Navigate through different sections using the sidebar.</p>
                                    </div>
                                </div>
                                {/* Task Management Panel - Fixed on right side */}
                                <div className="task-management-panel">
                                    <TaskManagement />
                                </div>
                            </div>
                        )}

                        {activeTab === 'Study Room' && (
                            <div className="study-room-section" style={{ textAlign: 'center', marginTop: '100px' }}>
                                <h2>Study Room</h2>
                                <p style={{ marginBottom: '20px', fontSize: '18px' }}>Join a study room or create your own.</p>
                                <button onClick={() => navigate('/study-room')} style={{padding: '10px 20px', fontSize: '14px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Let's Start</button>
                            </div>
                        )}

                        {activeTab === 'Video Conferencing' && (
                            <div className="video-conference-section">
                                <h2 style={{ textAlign: 'center', marginTop: '10px', marginBottom: '50px', fontSize: '30px', fontWeight: 'bold' }}>Video Conference</h2>
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;