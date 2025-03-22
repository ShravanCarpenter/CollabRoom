import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VideoConference.css';
import logo from '../../Assets/CollabRoom logo.png';

const NewMeetingSetup = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        name: '',
        email: ''
    });
    const [formData, setFormData] = useState({
        meetingName: '',
        meetingType: 'instant',
        scheduleDateTime: ''
    });
    const [showModal, setShowModal] = useState(false);

    // Generate unique meeting ID
    const generateMeetingId = () => {
        // Get current timestamp in milliseconds
        const timestamp = Date.now();

        // Convert timestamp to base36 and take last 4 characters
        const timeComponent = timestamp.toString(36).slice(-4);

        // Generate 4 random characters
        const randomComponent = Math.random().toString(36).substring(2, 6);

        // Combine and ensure exactly 8 characters
        const meetingId = (timeComponent + randomComponent).slice(0, 8);

        console.log('Generated meeting ID:', meetingId);
        return meetingId;
    };

    // Generate initial meeting ID
    const [meetingId, setMeetingId] = useState(generateMeetingId());

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setUserData({
                        name: data.name,
                        email: data.email
                    });
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const createMeetingRecord = async () => {
        try {
            console.log('Starting meeting creation...');

            // Generate a new meeting ID for this attempt
            const newMeetingId = generateMeetingId();
            setMeetingId(newMeetingId);

            if (!newMeetingId || !formData.meetingName || !userData.name || !userData.email) {
                console.error('Validation failed:', { newMeetingId, formData, userData });
                throw new Error('Missing required fields in frontend validation');
            }

            const meetingData = {
                meetingId: newMeetingId,
                meetingName: formData.meetingName,
                host: {
                    name: userData.name,
                    email: userData.email
                },
                type: formData.meetingType || 'instant',
                scheduledTime: formData.meetingType === 'scheduled' ? formData.scheduleDateTime : null
            };

            console.log('Meeting payload:', JSON.stringify(meetingData, null, 2));

            const response = await fetch('http://localhost:3000/api/meetings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(meetingData)
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Meeting creation failed');
            }

            console.log('Meeting created successfully:', responseData);
            return { ...responseData, meetingId: newMeetingId };
        } catch (err) {
            console.error('Meeting creation error:', {
                error: err.message,
                stack: err.stack
            });
            throw err;
        }
    };

    const handleSubmission = async (e) => {
        e.preventDefault();
        try {
            const result = await createMeetingRecord();
            if (formData.meetingType === 'instant') {
                navigate(`/create-meeting/${result.meetingId}`);
            } else {
                setShowModal(true);
                setTimeout(() => {
                    setShowModal(false);
                    navigate('/my-meetings'); // Redirect to My Meetings
                }, 3000);
            }
        } catch (err) {
            console.error('Submission failed:', err);
            alert(err.message || 'Failed to create meeting. Please try again.');
        }
    };

    return (
        <>
            <img src={logo} alt="logo" className="logo" style={{ height: '40px', marginTop: '20px', marginLeft: '43%' }} />
            <div className="meeting-setup-container">
                <div className="user-info-section">
                    <h3>Welcome, {userData.name}!</h3>
                    <p className="user-email">{userData.email}</p>
                </div>

                <form onSubmit={handleSubmission} className="meeting-setup-form">
                    <h2>Create New Meeting</h2>

                    <div className="form-group">
                        <label>Meeting Name</label>
                        <input
                            type="text"
                            name="meetingName"
                            placeholder='Enter Meeting Name'
                            value={formData.meetingName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Meeting Type</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="meetingType"
                                    value="instant"
                                    checked={formData.meetingType === 'instant'}
                                    onChange={handleChange}
                                />
                                Instant Meeting
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="meetingType"
                                    value="scheduled"
                                    checked={formData.meetingType === 'scheduled'}
                                    onChange={handleChange}
                                />
                                Schedule for Later
                            </label>
                        </div>
                    </div>

                    {formData.meetingType === 'scheduled' && (
                        <div className="form-group">
                            <label>Schedule Date & Time</label>
                            <input
                                type="datetime-local"
                                name="scheduleDateTime"
                                value={formData.scheduleDateTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="submit-btn">
                        {formData.meetingType === 'instant' ? 'Create Meeting' : 'Schedule Meeting'}
                    </button>
                </form>

                {showModal && (
                    <div className="scheduled-modal">
                        <div className="modal-content">
                            <h3>Meeting Scheduled</h3>
                            <p><strong>ID:</strong> {meetingId}</p>
                            <p><strong>Name:</strong> {formData.meetingName}</p>
                            <p><strong>Date:</strong> {new Date(formData.scheduleDateTime).toLocaleString()}</p>
                            <button
                                onClick={() => setShowModal(false)}
                                className="close-btn"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
                <p>
                    <a href='/dashboard' style={{color: '#001e80', textDecoration: 'none', fontSize: '14px', marginTop: '10px', marginLeft: '150px'}}>
                        Back to Dashboard
                    </a>
                </p>
            </div>
        </>
    );
};

export default NewMeetingSetup; 