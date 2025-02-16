import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import "./LR.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    mode: "student",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage(""); // Clear errors when user types
  };

  // Validation Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[A-Za-z\s]+$/;
  const mobileRegex = /^[0-9]{10}$/;

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Basic Validations
    if (!nameRegex.test(formData.name)) {
      setErrorMessage("❌ Name should only contain alphabets.");
      setIsLoading(false);
      return;
    }

    if (!emailRegex.test(formData.email)) {
      setErrorMessage("❌ Enter a valid email address.");
      setIsLoading(false);
      return;
    }

    if (!mobileRegex.test(formData.mobile)) {
      setErrorMessage("❌ Enter a valid 10-digit mobile number.");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("❌ Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("❌ Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/auth/register", formData);
      setSuccessMessage(response.data.message || "✅ Registration successful!");
  
      setFormData({ name: "", email: "", mobile: "", mode: "student", password: "", confirmPassword: "" });
  
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Registration Error:", error); // Log full error object
      setErrorMessage(error.response?.data?.error || "❌ An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container register">
      <h2>Create Account</h2>

      <form onSubmit={handleRegister}>
        {/* Name Field */}
        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />

        {/* Email Field */}
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />

        {/* Mobile Number */}
        <input type="text" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} required />

        {/* User Mode (Student/Educator) */}
        <select name="mode" value={formData.mode} onChange={handleChange} required>
          <option value="student">Student</option>
          <option value="educator">Educator</option>
        </select>

        {/* Password Field */}
        <div className="password-field">
          <input type={isPasswordVisible ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="toggle-password">
            {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Confirm Password Field */}
        <div className="password-field">
          <input type={isConfirmPasswordVisible ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
          <button type="button" onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} className="toggle-password">
            {isConfirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Register Button */}
        <button className="submit-btn" type="submit" disabled={isLoading}>
          {isLoading ? <FaSpinner className="spinner-icon" /> : "Register"}
        </button>
      </form>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <p>
        Already have an account? <a href="/login">Login here</a>
      </p>
      <p>
        <a href="/" style={{ textDecoration: "none" }}>Go Back</a>
      </p>
    </div>
  );
};

export default Register;
