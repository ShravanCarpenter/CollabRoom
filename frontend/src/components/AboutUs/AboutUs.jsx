import React, { useState } from 'react';
import './AboutUs.css'; // Import the CSS file for styling

const AboutUs = () => {
  const [isVisionHovered, setIsVisionHovered] = useState(false);
  const [isMissionHovered, setIsMissionHovered] = useState(false);

  return (
    <section id='about-us' className="vision-mission">
      <h1 className="page-title">Our Vision & Mission</h1>
      
      <div className="vision-section" 
           onMouseEnter={() => setIsVisionHovered(true)}
           onMouseLeave={() => setIsVisionHovered(false)}>
        <div className={`vision-card ${isVisionHovered ? 'hovered' : ''}`}>
          <h2>Our Vision</h2>
          <p>
            To create a world where collaborative learning and access to
            resources empower individuals to achieve their fullest potential
            and contribute to a better tomorrow.
          </p>
        </div>
        <div className="vision-image">
          <img src="/vision.jpg" alt="Vision illustration" />
        </div>
      </div>

      <div className="mission-section" 
           onMouseEnter={() => setIsMissionHovered(true)}
           onMouseLeave={() => setIsMissionHovered(false)}>
        <div className="mission-image">
          <img src="/mission.jpg" alt="Mission illustration" />
        </div>
        <div className={`mission-card ${isMissionHovered ? 'hovered' : ''}`}>
          <h2>Our Mission</h2>
          <p>
            To provide an inclusive platform that fosters knowledge-sharing,
            collaboration, and innovative learning solutions accessible to
            everyone, everywhere.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
