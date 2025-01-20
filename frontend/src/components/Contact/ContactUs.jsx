import React from "react";
import "./ContactUs.css";

const ContactUs = () => {
  return (
    <section id="contact-us" className="contact-us">
      <div className="contact-form-section">
        <h1>Get In Touch</h1>
        <p>We value your feedback and inquiries.<br></br> Drop us a message, and we’ll get back to you shortly</p>
        <form className="contact-form">
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows="6" required></textarea>
          <p>By submitting this form, you agree to our <a href="" >Privacy Policy</a>.</p>
          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      </div>

      <div className="map-section">
      <div className="follow-us">
                    <h2>Follow Us:</h2>
                    <div className="social-icons">
                        <a href="https://facebook.com" target="_blank" rel="noreferrer">
                            <img src="facebook.svg" alt="Facebook" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer">
                            <img src="twitter.svg" alt="Twitter" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer">
                            <img src="instagram.svg" alt="Instagram" />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                            <img src="linkedin.svg" alt="LinkedIn" />
                        </a>
                    </div>
                </div>
        <h2>Our Location</h2>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.051445819254!2d75.8577273746391!3d22.719568331702288!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd18d7dcfb37%3A0x69a9dd894b051111!2sIndore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1690550045693!5m2!1sen!2sin"
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Indore Map"
        ></iframe>
      </div>
    </section>
  );
};

export default ContactUs;
