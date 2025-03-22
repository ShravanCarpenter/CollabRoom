import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../Assets/CollabRoom logo.png';
import './VideoConference.css';

const JoinMeetingSetup = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [userData, setUserData] = useState({ name: '', email: '' });
    const [formData, setFormData] = useState({ meetingId: '' });

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch user data');

                const data = await response.json();
                setUserData({ name: data.name, email: data.email });
            } catch (err) {
                console.error('Error fetching user data:', err);
            }
        };

        fetchUserData();
    }, [token]);

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle meeting join
    const handleSubmission = async (e) => {
        e.preventDefault();
        const { meetingId } = formData; // ✅ Use meetingId correctly

        let cleanedMeetingId = meetingId.trim();
        if (cleanedMeetingId.includes('/')) {
            cleanedMeetingId = cleanedMeetingId.split('/').pop();  // Extract last part after '/'
        }

        if (!cleanedMeetingId) {
            alert('Invalid Meeting ID. Please enter a valid ID.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/meetings/${cleanedMeetingId}/participants`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: userData.name, email: userData.email })
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to join meeting');
            }

            navigate(`/join-meeting/${cleanedMeetingId}`);
        } catch (err) {
            console.error('Submission failed:', err);
            alert(err.message || 'Failed to join meeting. Please try again.');
        }
    };

    return (
        <>
            <img src={logo} alt="logo" className="logo" style={{ height: '40px', marginTop: '20px', marginLeft: '43%' }} />
            <div className='join-meeting-container'>
                <div className="user-info-section">
                    <h3>Welcome, {userData.name}!</h3>
                    <p className="user-email">{userData.email}</p>
                </div>
                <h2>Join Meeting</h2>
                <form onSubmit={handleSubmission}>
                    <div className='form-group'>
                        <label htmlFor='meetingId'>Meeting ID</label>
                        <input
                            type='text'
                            id='meetingId'
                            name='meetingId'
                            value={formData.meetingId}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type='submit' className='join-meeting-submit-btn'>Join Meeting</button>
                </form>
                <p>
                    <a href='/dashboard' style={{ color: '#001e80', textDecoration: 'none', fontSize: '14px', marginTop: '10px', marginLeft: '150px' }}>
                        Back to Dashboard
                    </a>
                </p>
            </div>

        </>
    );
};

export default JoinMeetingSetup;
