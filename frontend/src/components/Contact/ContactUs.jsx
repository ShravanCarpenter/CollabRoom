import React, { useState } from "react";
import "./ContactUs.css";

const ContactUs = () => {
  const [formStatus, setFormStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.target);
      formData.append("access_key", "33e14bad-f9b9-4f85-8bea-ed234e6b3b50");

      // Example using fetch to submit form
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setFormStatus("success");
        event.target.reset(); // Reset the form
      } else {
        setFormStatus("error");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setFormStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-us" className="contact-us">
      <div className="contact-form-section">
        <h1>Get In Touch</h1>
        <p className="form-description">
          We value your feedback and inquiries. Drop us a message, and we'll get back to you shortly
        </p>

        {formStatus === "success" && (
          <div className="success-message">Thank you! Your message has been sent successfully.</div>
        )}

        {formStatus === "error" && (
          <div className="error-message">Something went wrong. Please try again later.</div>
        )}

        <form onSubmit={onSubmit} className="contact-form">
          <input type="text" name="name" placeholder="Your Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <textarea name="message" placeholder="Your Message" rows="6" required></textarea>
          <p className="privacy-notice">
            By submitting this form, you agree to our{" "}
            <a href="/privacy-policy" className="privacy-link">Privacy Policy</a>.
          </p>
          <button
            type="submit"
            className="absolute-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
            {!isSubmitting && <span className="arrow-icon">→</span>}
          </button>
        </form>
      </div>

      <div className="map-section">
        <h2 className="location-heading">Our Location</h2>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.051445819254!2d75.8577273746391!3d22.719568331702288!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd18d7dcfb37%3A0x69a9dd894b051111!2sIndore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1690550045693!5m2!1sen!2sin"
          style={{ border: 0, width: "100%", height: "400px" }}
          allowFullScreen
          loading="lazy"
          title="Indore Map"
        ></iframe>
      </div>
    </section>
  );
};

export default ContactUs;