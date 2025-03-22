import React, { useState, useEffect } from "react";
import "../Hero/Hero.css";
import collab1 from '../../../public/Assets/pic1.jpg';
import collab2 from '../../../public/Assets/pic2.jpg';
import collab3 from '../../../public/Assets/pic3.jpg';
import collab4 from '../../../public/Assets/pic4.jpg';
import collab5 from '../../../public/Assets/pic5.jpg';
import collab6 from '../../../public/Assets/pic6.jpg';

const collaborationImages = [
  collab1,
  collab2,
  collab3,
  collab4,
  collab5,
  collab6
];

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % collaborationImages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % collaborationImages.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + collaborationImages.length) % collaborationImages.length);
  };

  return (
    <section id="hero" className="hero">
      <div className="glass-overlay">
        <div className="hero-content">
          <div className="text-content">
            <h1>Collaborate.<br/> Learn. <br/> Achieve.</h1>
            <h1>with <span className="typing-effect">CollabRoom</span></h1>
            <p>
              Connect with peers in virtual study groups to make learning interactive 
              and collaborative. Share resources, chat in real-time, and work together 
              seamlessly.
            </p>
            <a href="/register" className="cta-btn">Get Started</a>
          </div>
          
          <div className="carousel-container">
            <div className="carousel-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
              {collaborationImages.map((img, index) => (
                <div 
                  key={index}
                  className={`carousel-slide ${index === activeIndex ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${img})` }}
                >
                  <div className="image-overlay"></div>
                </div>
              ))}
            </div>
            <button className="carousel-btn prev" onClick={prevSlide}>&#10094;</button>
            <button className="carousel-btn next" onClick={nextSlide}>&#10095;</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
