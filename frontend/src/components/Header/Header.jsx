import React from 'react';
import "../Header/Header.css";

const Header = () => {
  return (
    <nav className="navbar">
      <img className="navbar-logo" src='/logo.png' alt='logo' width={200}/>

      <ul className="navbar-links">
        <li><a href="#hero">Home</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#about-us">About</a></li>
        <li><a href="#contact-us">Contact</a></li>
        
        <li><a href="/login" className="btn-1">LogIn</a></li>
        <li><a href="/login" className="btn">SignUp For Free</a></li>
      </ul>

      <div className="hamburger-menu" onClick={() => toggleMenu()}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

const toggleMenu = () => {
  const links = document.querySelector(".navbar-links");
  links.classList.toggle("active");
};

export default Header;
