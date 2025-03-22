import React from 'react';
import logo from '../../../public/Assets/CollabRoom logo.png';
import "./Header.css";

const Header = () => {
  return (
    <nav className="header-navbar-part">
      <img className="header-navbar-logo" src={logo} alt='logo' width={160}/>

      <ul className="header-navbar-links">
        <li><a href="#hero">Home</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#about-us">About</a></li>
        <li><a href="#contact-us">Contact</a></li>

        <li><a href="/login" className="btn-1">LogIn</a></li>
        <li><a href="/register" className="btn">SignUp For Free</a></li>
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
  const links = document.querySelector(".header-navbar-links");
  links.classList.toggle("active");
};

export default Header;
