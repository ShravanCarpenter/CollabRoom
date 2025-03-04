import React from 'react';
import './Footer.css';
import logo from '../../assets/CollabRoom Logo.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="footer-logo-container">
            <img src={logo} alt="CollabRoom Logo" className="footer-logo" />
          </div>
          <p className="footer-description">
            Empowering collaboration and learning through innovation and technology. Join us today!
          </p>
        </div>

        <div className="footer-center">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-right">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" className="social-icon"><img src="/facebook.svg" alt="Facebook" /></a>
            <a href="#" className="social-icon"><img src="/twitter.svg" alt="Twitter" /></a>
            <a href="#" className="social-icon"><img src="/instagram.svg" alt="Instagram" /></a>
            <a href="#" className="social-icon"><img src="/linkedin.svg" alt="LinkedIn" /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 CollabRoom. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
