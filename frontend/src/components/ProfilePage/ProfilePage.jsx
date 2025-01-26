import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import './ProfilePage.css';

const ProfilePage = () => {
  // States for user profile data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [error, setError] = useState(null);

  // Fetch user data on mount
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
        const { name, email, mobile, profilePicture } = response.data;
        setName(name);
        setEmail(email);
        setMobile(mobile);
        setProfilePicture(profilePicture);
      } catch (error) {
        if (error.response) {
          console.error('Error fetching user data:', error.response.data);  // Log response data
          setError(error.response.data.message || 'Failed to load user data.');
        } else {
          console.error('Error fetching user data:', error.message);  // Log other errors
          setError('An error occurred while fetching user data');
        }
      }
    };

    fetchUserData();
  }, []); // Empty dependency array ensures this runs once on component mount

  const getInitials = (name) => {
    if (!name) return '?';
    const initials = name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
    return initials || '?';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicture(reader.result); // Set the base64 string of the image
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    const profileData = { name, email, mobile, password };

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/auth/update-profile',
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.success) {
        alert('Profile updated successfully!');
      } else {
        setError('Error updating profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error updating profile.');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-left">
        {profilePicture ? (
          <img
            id="profile-picture"
            src={profilePicture}
            alt="Profile"
            onClick={() => document.getElementById('image-input').click()}
          />
        ) : (
          <div
            id="profile-initials"
            onClick={() => document.getElementById('image-input').click()}
          >
            {getInitials(name)}
          </div>
        )}
        <input
          type="file"
          id="image-input"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
      </div>

      <div className="profile-right">
        {error && <div className="error-message">{error}</div>} {/* Display error message if any */}
        <form id="profile-form">
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="text"
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="button"
            id="update-profile"
            onClick={handleUpdateProfile}
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
