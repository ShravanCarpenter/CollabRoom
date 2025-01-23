import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Navbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userData, setUserData] = useState({ name: '', mode: '', image: '' });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const response = await axios.get('http://localhost:3000/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 200) {
                    setUserData(response.data);
                } else {
                    console.error('Failed to fetch user data:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching user data:', error.message);
            }
        };

        fetchUserData();
    }, []);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const getInitials = (name) => {
        if (!name || typeof name !== 'string') return '?';
        return name
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase())
            .join('');
    };

    return (
        <div className="dash-navbar">
            <div className="logo">
                <img src="/logo.png" alt="Logo" />
            </div>

            <div className="profile" onClick={toggleDropdown}>
                <div className="profile-image">
                    {userData.image ? (
                        <img src={userData.image} alt="Profile" className="profile-pic" />
                    ) : (
                        <div className="profile-initials">{getInitials(userData.name)}</div>
                    )}
                </div>
                <div className="profile-info">
                    <span>{userData.name || 'Guest'}</span>
                    <small>{userData.mode || 'User'}</small>
                </div>

                {dropdownOpen && (
                    <div className="dropdown-menu">
                        <ul>
                            <li>Profile</li>
                            <li>Settings</li>
                            <li onClick={handleLogout}>Logout</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
