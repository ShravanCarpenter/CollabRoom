import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import logo from '../../../public/CollabRoom logo.png';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return '';
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;

    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;

    if (length < 8) return 'weak';
    if (strength <= 2) return 'weak';
    if (strength === 3) return 'medium';
    return 'strong';
  };

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

    // Password strength validation
    const passwordStrength = getPasswordStrength(formData.password);
    if (passwordStrength === 'weak') {
      setErrorMessage("❌ Password is too weak. Include uppercase, lowercase, numbers, and special characters.");
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
      setIsSuccess(true);
      document.body.style.background = 'rgb(255, 255, 255)';

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Registration Error:", error);
      setErrorMessage(error.response?.data?.error || "❌ An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <>
      <img src={logo} alt="logo" className="logo" style={{ height: '40px', marginTop: '20px', marginLeft: '44%' }} />
      {isSuccess ? (
        <div className="success-container">
          <FaSpinner className="spinner-icon" />
          <p>Registration successful...</p>
        </div>
      ) : (
        <div className="auth-container register">
          <h2>Create Your Account</h2>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="text"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                required
              >
                <option value="student">Student</option>
                <option value="educator">Educator</option>
              </select>
            </div>

            <div className="password-field">
              <input
                type={isPasswordVisible ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="toggle-password"
              >
                {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
              {formData.password && (
                <div className={`password-strength ${getPasswordStrength(formData.password)}`}>
                  Password Strength: {getPasswordStrength(formData.password)}
                </div>
              )}
            </div>

            <div className="password-field">
              <input
                type={isConfirmPasswordVisible ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                className="toggle-password"
              >
                {isConfirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button className="submit-btn" type="submit" disabled={isLoading}>
              {isLoading ? <FaSpinner className="spinner-icon" /> : "Create Account"}
            </button>
          </form>

          {errorMessage && (
            <p className="error-message" style={{
              padding: '10px',
              marginTop: '10px',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              borderRadius: '5px'
            }}>
              {errorMessage}
            </p>
          )}

          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
          <p>
            <button
              onClick={handleBackToHome}
              style={{
                background: 'none',
                border: 'none',
                color: '#3498db',
                cursor: 'pointer',
                textDecoration: 'none',
                fontSize: '1em',
                padding: 0
              }}
            >
              Back to Home
            </button>
          </p>
        </div>
      )}
    </>
  );
};

export default Register;
