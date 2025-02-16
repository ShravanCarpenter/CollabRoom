import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMdLogOut, IoMdSettings } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import axios from 'axios';
import './Dashboard.css';

const Navbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userData, setUserData] = useState({ name: '', mode: '' });

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            console.log('Sending token:', token);
            if (!token) {
                console.error('Token is missing from localStorage.');
                return;
            }

            try {
                const response = await axios.get('http://localhost:3000/api/auth/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Profile data:', response.data);
                setUserData(response.data);
            } catch (error) {
                if (error.response) {
                    console.error('Error fetching user data:', error.response.data);  // Log response data
                } else {
                    console.error('Error fetching user data:', error.message);  // Log any other errors
                }
            }
        };

        fetchUserData();
    }, []);

    const getInitials = (name) => {
        if (!name || typeof name !== 'string') return '?';

        const nameParts = name.trim().split(' '); 
        const initials = nameParts
            .filter(part => part.length > 0)  
            .map(part => part.charAt(0).toUpperCase())
            .join('');

        return initials || '?';
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const navigate = useNavigate();

    const handleProfile = () => {
        navigate('/profile');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="dash-navbar">
            <div className="logo">
                <img src="/logo.png" alt="Logo" />
            </div>

            <div className="profile" onClick={toggleDropdown}>
                <div className="profile-image">

                    <div className="profile-initials">{getInitials(userData.name)}</div>

                </div>
                <div className="profile-info">
                    <span>{userData.name}</span>
                    <small>{userData.mode.toUpperCase()}</small>
                </div>

                {dropdownOpen && (
                    <div className="dropdown-menu">
                        <ul>
                            <li onClick={handleProfile}><CgProfile />Profile</li>
                            <li><IoMdSettings />Settings</li>
                            <li onClick={handleLogout}><IoMdLogOut />Logout</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;
