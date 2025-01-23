import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import './LR.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);  // Add state for password visibility
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      setIsRedirecting(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000); // Simulated delay before redirecting
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container login">
      <h2>Login</h2>
      {isRedirecting ? (
        <div className="loading-container">
          <FaSpinner className="loading-icon" />
        </div>
      ) : (
        <>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
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
            <button className='submit-btn' type="submit" disabled={isLoading}>
              {isLoading ? <FaSpinner className="spinner-icon" /> : 'Login'}
            </button>
          </form>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <p>
            Don't have an account? <a href="/register">Register here</a>
          </p>
          <p>
            <a href="/">Go Back</a>
          </p>
        </>
      )}
    </div>
  );
};

export default Login;
