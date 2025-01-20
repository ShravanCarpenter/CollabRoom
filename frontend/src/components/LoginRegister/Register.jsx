import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginRegister.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mode: 'student',
    password: '',
    confirmPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);  // Add state for password visibility
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);  // For confirm password
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation for password matching
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        mode: formData.mode,
        password: formData.password,
      });
      setSuccessMessage(response.data.message || 'Registration successful!');
      setErrorMessage('');
      setFormData({ name: '', email: '', mode: 'student', password: '', confirmPassword: '' });

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container register">
      <h2>Create Account</h2>
      {isRedirecting ? (
        <div className="loading-container">
          <FaSpinner className="loading-icon" />
        </div>
      ) : (
        <>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <select name="mode" value={formData.mode} onChange={handleChange} required>
              <option value="student">Student</option>
              <option value="educator">Educator</option>
            </select>
            <div className="password-field">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}  // Toggle password visibility
                className="toggle-password"
              >
                {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}  {/* Show/Hide Eye Icon */}
              </button>
            </div>
            <div className="password-field">
              <input
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}  // Toggle confirm password visibility
                className="toggle-password"
              >
                {isConfirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}  {/* Show/Hide Eye Icon */}
              </button>
            </div>
            <button className='submit-btn' type="submit" disabled={isLoading}>
              {isLoading ? <FaSpinner className="spinner-icon" /> : 'Register'}
            </button>
          </form>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
          <p>
            Already have an account? <a href="/login">Login here</a>
          </p>
          <p>
            <a href="/">Go Back</a>
          </p>
        </>
      )}
    </div>
  );
};

export default Register;