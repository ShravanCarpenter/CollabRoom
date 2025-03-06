import React from 'react';
import './Features.css'; // Importing CSS for features section

const Features = () => {
    const features = [
        {
            icon: "/edit.gif",
            title: "Real Time Document Editing",
            description: "Collaborate on documents simultaneously with live updates and version control."
        },
        {
            icon: "/studyRoom.gif",
            title: "Study Rooms",
            description: "Create dedicated virtual spaces for different subjects or projects."
        },
        {
            icon: "/realTimeMessaging.gif",
            title: "Real-Time Messaging",
            description: "Integrated chat with markdown support and file sharing capabilities."
        },
        {
            icon: "/videoConferencing.gif",
            title: "Video Conferencing",
            description: "HD video calls with screen sharing and collaborative whiteboards."
        }
    ];

    return (
        <section id='features' className="features">
            <div className="container">
                <h2>Key Features of CollabRoom</h2>
                <div className="features-list">
                    {features.map((feature, index) => (
                        <div 
                            key={index}
                            className="feature-item"
                            data-aos="fade-up"
                            data-aos-delay={(index + 1) * 100}
                        >
                            <img src={feature.icon} alt={feature.title} />
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
