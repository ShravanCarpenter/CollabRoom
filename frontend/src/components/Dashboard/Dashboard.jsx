import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdLogOut, IoMdSettings } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { BiHome, BiBookAlt, BiEdit, BiVideo, BiChat, BiCog, BiCalendar } from "react-icons/bi";
import { RxLink2 } from "react-icons/rx";
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Home');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userData, setUserData] = useState({
        name: '',
        mode: '',
        email: ''
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const profileDropdownRef = useRef(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setDropdownOpen(false); 
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
                    <img src="/logo.png" alt="Logo" />
                </div>

                <div className="nav-profile">
                    <div 
                        className="profile-trigger"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <div className="profile-circle">
                            {getInitials(userData.name)}
                        </div>
                        <div className="profile-details">
                            <div className="profile-name">{userData.name || 'Guest'}</div>
                            <div className="profile-subtitle">{userData.mode?.toUpperCase() || 'WELCOME'}</div>
                        </div>
                    </div>

                    {dropdownOpen && (
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

            {/* Sidebar */}
            <div className={`dashboard-content ${isSidebarOpen ? 'open' : ''}`}>
                <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
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
                <div className="main-content">
                    <h1>{activeTab}</h1>
                    {activeTab === 'Dashboard'}
                    {activeTab === 'Video Conferencing' && (
                        <div className="video-conference-section">
                            <div className="options-container">
                                <div className="option-card" onClick={() => navigate('/create-meeting')}>
                                    <BiVideo size={48} />
                                    <h2>Create New Meeting</h2>
                                    <p>Start a new video conference</p>
                                </div>
                                <div className="option-card" onClick={() => navigate('/join-meeting')}>
                                    <RxLink2 size={48} />
                                    <h2>Join via Link</h2>
                                    <p>Join using a meeting link</p>
                                </div>
                                <div className="option-card" onClick={() => navigate('/my-meetings')}>
                                    <BiCalendar size={48} />
                                    <h2>My Meetings</h2>
                                    <p>View your scheduled and past meetings</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
