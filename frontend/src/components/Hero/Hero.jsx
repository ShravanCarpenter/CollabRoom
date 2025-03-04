import React from "react";
import "../Hero/Hero.css";

const Hero = () => {
  return (
    <section id="hero" className="hero">
      <div className="glass-overlay">
        <div className="hero-content">
          <h1>Collaborate.<br></br> Learn. <br></br> Achieve.</h1>
          <h1>with <span className="typing-effect">CollabRoom</span></h1>
          <p>
          Connect with peers in virtual study groups to make learning interactive and collaborative. Share resources, chat in real-time, and work together seamlessly. Access everything you need to succeed, anytime and anywhere.
          </p>
          <a href="/register" className="cta-btn">Get Started</a>
        </div>
      </div>
    </section>
    
)};

export default Hero;
