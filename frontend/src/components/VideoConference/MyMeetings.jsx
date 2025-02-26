import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MyMeetings.css'; // Assume you have styling

const MyMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [updateDate, setUpdateDate] = useState('');
  const [updateTime, setUpdateTime] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, []);
  
  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      console.log('Using token:', token.substring(0, 10) + '...');
      
      // API URL with proper error handling
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      console.log('Fetching from:', `${API_BASE}/api/meetings/my-meetings`);
      
      const response = await fetch(`${API_BASE}/api/meetings/my-meetings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Adding credentials may be needed for cookies
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      
      // Enhanced error handling
      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized error
          localStorage.removeItem('token'); // Clear invalid token
          throw new Error('Session expired. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('API endpoint not found. Please check server configuration.');
        } else {
          // Try to get error message from response
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || `Server error (${response.status}): Failed to fetch meetings`
          );
        }
      }

      const data = await response.json();
      console.log('Meetings data received:', data);
      
      // Validate data structure - updated to handle both formats
      const meetingsArray = Array.isArray(data) ? data : (data.meetings && Array.isArray(data.meetings) ? data.meetings : []);
      
      if (meetingsArray.length === 0 && data && !Array.isArray(data) && !data.meetings) {
        console.error('Unexpected data format:', data);
        console.warn('Expected meetings array not found in response, using empty array');
      }
      
      setMeetings(meetingsArray);
      setError(null);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      
      // Detailed network error debugging
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        console.log('Network error detected - details:', {
          apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
          currentOrigin: window.location.origin
        });
        
        setError('Cannot connect to server. Please check your network connection and ensure the server is running.');
      } else {
        setError(err.message || 'Failed to load meetings. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle closing a meeting
  const handleCloseMeeting = async (meetingId) => {
    if (!confirm('Are you sure you want to close this meeting?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/meetings/${meetingId}/close`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Failed to close meeting (${response.status})`
        );
      }
      
      // Update the meetings list with the closed meeting
      setMeetings(meetings.map(meeting => 
        meeting.meetingId === meetingId 
          ? { ...meeting, status: 'cancelled' } 
          : meeting
      ));
      
      alert('Meeting closed successfully');
    } catch (err) {
      console.error('Error closing meeting:', err);
      alert(err.message || 'Failed to close meeting. Please try again.');
    }
  };

  // Handle opening the update modal
  const openUpdateModal = (meeting) => {
    setSelectedMeeting(meeting);
    
    // Pre-fill the form with current date and time
    if (meeting.scheduledTime) {
      const dateTime = new Date(meeting.scheduledTime);
      
      // Format date as YYYY-MM-DD for input[type="date"]
      const formattedDate = dateTime.toISOString().split('T')[0];
      setUpdateDate(formattedDate);
      
      // Format time as HH:MM for input[type="time"]
      const hours = String(dateTime.getHours()).padStart(2, '0');
      const minutes = String(dateTime.getMinutes()).padStart(2, '0');
      setUpdateTime(`${hours}:${minutes}`);
    } else {
      // If no scheduled time, use current date/time
      const now = new Date();
      setUpdateDate(now.toISOString().split('T')[0]);
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setUpdateTime(`${hours}:${minutes}`);
    }
    
    setUpdateModalOpen(true);
  };

  // Handle updating a meeting
  const handleUpdateMeeting = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Combine date and time into a single datetime
      const scheduledDateTime = new Date(`${updateDate}T${updateTime}`);
      
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/meetings/${selectedMeeting.meetingId}/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scheduledTime: scheduledDateTime.toISOString()
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Failed to update meeting (${response.status})`
        );
      }
      
      // Update the meetings list with the updated meeting
      setMeetings(meetings.map(meeting => 
        meeting.meetingId === selectedMeeting.meetingId 
          ? { ...meeting, scheduledTime: scheduledDateTime.toISOString() } 
          : meeting
      ));
      
      setUpdateModalOpen(false);
      alert('Meeting updated successfully');
    } catch (err) {
      console.error('Error updating meeting:', err);
      alert(err.message || 'Failed to update meeting. Please try again.');
    }
  };

  // Filter meetings based on status - now using the correct status values
  const activeMeetings = meetings.filter(meeting => meeting.status === 'active');
  const pendingMeetings = meetings.filter(meeting => meeting.status === 'pending');
  const completedMeetings = meetings.filter(meeting => meeting.status === 'completed');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Get meetings for the active tab - updated to match your schema
  const getActiveMeetings = () => {
    switch (activeTab) {
      case 'active':
        return activeMeetings;
      case 'pending':
        return pendingMeetings;
      case 'completed':
        return completedMeetings;
      default:
        return [];
    }
  };

  const displayMeetings = getActiveMeetings();

  // Helper function to convert meeting status to user-friendly text
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  // Helper function to determine button text based on status
  const getActionText = (status) => {
    switch (status) {
      case 'active': return 'Join Now';
      case 'pending': return 'Start';
      default: return 'View';
    }
  };

  if (isLoading) {
    return <div className="loading">Loading your meetings...</div>;
  }

  // Show user-friendly error with retry button
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button 
          className="retry-button" 
          onClick={() => fetchMeetings()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="my-meetings-container">
      <div className="header-container">
        <h2>My Meetings</h2>
        <Link to="/dashboard" className="back-button">Back to Dashboard</Link>
      </div>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => handleTabChange('active')}
        >
          Active ({activeMeetings.length})
        </button>
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => handleTabChange('pending')}
        >
          Pending ({pendingMeetings.length})
        </button>
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => handleTabChange('completed')}
        >
          Completed ({completedMeetings.length})
        </button>
      </div>

      <div className="meetings-grid">
        {displayMeetings.length > 0 ? (
          displayMeetings.map(meeting => (
            <div key={meeting._id || meeting.meetingId} className="meeting-card">
              <h3>{meeting.meetingName}</h3>
              <p><strong>ID:</strong> {meeting.meetingId}</p>
              <p><strong>Host:</strong> {meeting.host?.name}</p>
              <p><strong>Status:</strong> {getStatusText(meeting.status)}</p>
              <p>
                <strong>Scheduled:</strong> {
                  meeting.scheduledTime 
                  ? new Date(meeting.scheduledTime).toLocaleString() 
                  : 'N/A'
                }
              </p>
              <div className="meeting-actions">
                {meeting.status !== 'completed' && meeting.status !== 'cancelled' && (
                  <Link 
                    to={`/join-meeting/${meeting.meetingId}`}
                    className="join-button"
                  >
                    {getActionText(meeting.status)}
                  </Link>
                )}
                
                {/* Update button for pending meetings */}
                {meeting.status === 'pending' && (
                  <button 
                    className="update-button"
                    onClick={() => openUpdateModal(meeting)}
                  >
                    Update
                  </button>
                )}
                
                {/* Close button for active and pending meetings */}
                {(meeting.status === 'active' || meeting.status === 'pending') && (
                  <button 
                    className="close-button"
                    onClick={() => handleCloseMeeting(meeting.meetingId)}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-meetings">No {activeTab} meetings found.</p>
        )}
      </div>

      <div className="table-view">
        <h3>All Meetings</h3>
        <table>
          <thead>
            <tr>
              <th>Meeting Name</th>
              <th>Meeting ID</th>
              <th>Host</th>
              <th>Status</th>
              <th>Scheduled Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.length > 0 ? (
              meetings.map(meeting => (
                <tr key={meeting._id || meeting.meetingId}>
                  <td>{meeting.meetingName}</td>
                  <td>{meeting.meetingId}</td>
                  <td>{meeting.host?.name}</td>
                  <td>
                    <span className={`status-badge ${meeting.status}`}>
                      {getStatusText(meeting.status)}
                    </span>
                  </td>
                  <td>
                    {meeting.scheduledTime 
                      ? new Date(meeting.scheduledTime).toLocaleString() 
                      : 'N/A'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {meeting.status !== 'completed' && meeting.status !== 'cancelled' ? (
                        <>
                          <Link 
                            to={`/join-meeting/${meeting.meetingId}`}
                            className="join-link"
                          >
                            {getActionText(meeting.status)}
                          </Link>
                          
                          {/* Update button for pending meetings */}
                          {meeting.status === 'pending' && (
                            <button 
                              className="update-button-small"
                              onClick={() => openUpdateModal(meeting)}
                            >
                              Update
                            </button>
                          )}
                          
                          {/* Close button for active and pending meetings */}
                          {(meeting.status === 'active' || meeting.status === 'pending') && (
                            <button 
                              className="close-button-small"
                              onClick={() => handleCloseMeeting(meeting.meetingId)}
                            >
                              Close
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="completed-text">Ended</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-meetings-row">
                  No meetings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Update Meeting Modal */}
      {updateModalOpen && selectedMeeting && (
        <div className="modal-overlay">
          <div className="update-modal">
            <h3>Update Meeting Schedule</h3>
            <p><strong>Meeting:</strong> {selectedMeeting.meetingName}</p>
            
            <form onSubmit={handleUpdateMeeting}>
              <div className="form-group">
                <label htmlFor="update-date">Date:</label>
                <input 
                  type="date" 
                  id="update-date"
                  value={updateDate}
                  onChange={(e) => setUpdateDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="update-time">Time:</label>
                <input 
                  type="time" 
                  id="update-time"
                  value={updateTime}
                  onChange={(e) => setUpdateTime(e.target.value)}
                  required
                />
              </div>
              
              <div className="modal-buttons">
                <button type="submit" className="save-button">Save Changes</button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setUpdateModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMeetings;