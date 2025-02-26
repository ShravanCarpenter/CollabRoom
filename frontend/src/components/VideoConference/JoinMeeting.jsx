import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { BiCopy } from 'react-icons/bi';
import './VideoConference.css';

// Environment configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Main Component
const JoinMeeting = () => {
    const { meetingId } = useParams();
    const [searchParams] = useSearchParams();
    const [participants, setParticipants] = useState([]);
    const [meetingDetails, setMeetingDetails] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [isLoadingMeeting, setIsLoadingMeeting] = useState(true);
    const [error, setError] = useState(null);
    const zpRef = useRef(null);
    const meetingName = searchParams.get('name') || 'Instant';
    const [userData, setUserData] = useState({
        name: '',
        email: ''
    });
    const navigate = useNavigate();

    // Fetch user profile data
    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoadingUser(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Authentication required');
                }
                
                    const response = await fetch(`http://localhost:3000/api/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to load user profile');
                }
                
                const data = await response.json();
                setUserData({
                    name: data.name || 'Guest',
                    email: data.email || ''
                });
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError(err.message);
            } finally {
                setIsLoadingUser(false);
            }
        };

        fetchUserData();
    }, []);

    // Fetch meeting details
    const fetchMeetingDetails = async () => {
        try {
            console.log('Fetching meeting details for ID:', meetingId);
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`http://localhost:3000/api/meetings/get/${meetingId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || 'Failed to fetch meeting';
                } catch (e) {
                    errorMessage = 'Server error when fetching meeting details';
                    console.error('Response was not JSON:', errorText.substring(0, 100) + '...');
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Meeting details received:', data);
            return data;
        } catch (err) {
            console.error('Fetch error:', err);
            throw err;
        }
    };

    useEffect(() => {
        const loadMeetingData = async () => {
            setIsLoadingMeeting(true);
            try {
                const meetingData = await fetchMeetingDetails();
                setMeetingDetails(meetingData);
                setParticipants(meetingData.participants || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoadingMeeting(false);
            }
        };

        if (meetingId) {
            loadMeetingData();
        }
    }, [meetingId]);

    // Initialize ZegoCloud meeting
    useEffect(() => {
        const initMeeting = async () => {
            // Wait for all data to be ready
            if (
                zpRef.current || 
                isLoadingUser || 
                isLoadingMeeting || 
                !userData.name || 
                !meetingDetails
            ) {
                return;
            }
            
            try {
                // Check if env variables exist
                const appIDValue = import.meta.env.VITE_ZEGO_APP_ID;
                const serverSecretValue = import.meta.env.VITE_ZEGO_SERVER_SECRET;
                
                if (!appIDValue || !serverSecretValue) {
                    throw new Error('ZEGOCLOUD credentials missing. Please check your environment variables.');
                }
                
                const appID = parseInt(appIDValue);
                if (isNaN(appID)) {
                    throw new Error('Invalid ZEGOCLOUD App ID: must be a number');
                }
                
                // Create the kit token
                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    appID,
                    serverSecretValue,
                    meetingId,
                    Date.now().toString(),
                    userData.name
                );
        
                // Create Zego instance
                const zc = ZegoUIKitPrebuilt.create(kitToken);
                if (!zc) {
                    throw new Error('Failed to create Zego instance');
                }
                zpRef.current = zc;
        
                // Wait for container
                const container = document.getElementById('meeting-container');
                if (!container) {
                    throw new Error('Meeting container element not found');
                }
        
                // Join room
                await zc.joinRoom({
                    container: container,
                    sharedLinks: [{
                        name: 'Meeting Link',
                        url: window.location.href
                    }],
                    scenario: {
                        mode: ZegoUIKitPrebuilt.GroupCall,
                        config: {
                            role: ZegoUIKitPrebuilt.Host
                        }
                    },
                    showScreenSharingButton: true
                });
        
            } catch (error) {
                console.error('Failed to initialize meeting:', error);
                setError(error.message);
            }
        };

        initMeeting();

        // Cleanup function
        return () => {
            if (zpRef.current) {
                zpRef.current.destroy();
                zpRef.current = null;
            }
        };
    }, [meetingId, userData.name, meetingDetails, isLoadingUser, isLoadingMeeting]);

    // Copy meeting link to clipboard
    const copyMeetingLink = () => {
        const meetingLink = `${window.location.origin}/join-meeting?id=${meetingId}&name=${encodeURIComponent(meetingName)}`;
        navigator.clipboard.writeText(meetingLink)
            .then(() => {
                // Could add a toast notification here
                console.log('Meeting link copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy link:', err);
            });
    };

    // Loading state
    if (isLoadingUser || isLoadingMeeting) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading meeting...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error}</p>
                <button 
                    onClick={() => navigate('/')}
                    className="return-button"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    // Render main component
    return (
        <div className="meeting-container">
            {/* <MeetingHeader 
                meetingDetails={meetingDetails} 
                meetingId={meetingId}
                onCopyLink={copyMeetingLink}
            /> */}

            <div id="meeting-container" style={{ width: '100%', height: '100' }}>
                {/* ZegoCloud will render the video interface here */}
            </div>
        </div>
    );
};

export default JoinMeeting;