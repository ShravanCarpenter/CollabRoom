import React from 'react';
import './Features.css'; // Importing CSS for features section

const Features = () => {
    return (
        <section id='features' className="features">
            <div className="container">
                <h2>Key Features of CollabRoom</h2>
                <div className="features-list">
                    <div className="feature-item">
                        <img src="/edit.gif" alt="Real Time Document Editing" />
                        <h3>Real Time Document Editing</h3>
                        <p>Create and edit documents with your fellow mates anywhere in real time.</p>
                    </div>
                    <div className="feature-item">
                        <img src="/studyRoom.gif" alt="Study Room" />
                        <h3>Study Rooms</h3>
                        <p>Create and join virtual study rooms for focused learning sessions.</p>
                    </div>
                    <div className="feature-item">
                        <img src="/realTimeMessaging.gif" alt="Real-Time Messaging" />
                        <h3>Real-Time Messaging</h3>
                        <p>Communicate instantly with study group members to collaborate effectively.</p>
                    </div>
                    <div className="feature-item">
                        <img src='/videoConferencing.gif' alt='Video Conferencing Image' />
                        <h3>Video Conferencing</h3>
                        <p>Host virtual study sessions with real-time video and face-to-face interaction.</p>
                    </div>
                    <div className="feature-item">
                        <img src="/documentSharing.gif" alt="Document Sharing" />
                        <h3>Document Sharing</h3>
                        <p>Upload and share study materials and resources with ease.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
