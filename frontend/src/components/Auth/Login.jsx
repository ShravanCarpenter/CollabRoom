import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/CollabRoom logo.png';
import './LR.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { auth, login } = useAuth();

  // Check for existing auth on component mount
  useEffect(() => {
    if (auth?.token) {
      navigate('/dashboard');
    }
  }, [auth, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage(''); // Clear error when user types
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', formData);
      const { token, user } = response.data;

      // Use the login function from auth context
      login(token, user);

      setIsSuccess(true);
      document.body.style.background = 'rgb(255, 255, 255)';

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Login Error:', error);
      setErrorMessage(error.response?.data?.error || 'Invalid credentials. Please try again.');
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
          <p>Logging in...</p>
        </div>
      ) : (
        <div className="auth-container login">
          <h2>Welcome Back!</h2>
          <form onSubmit={handleLogin}>
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
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="toggle-password"
              >
                {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button className='login-submit-btn' type="submit" disabled={isLoading}>
              {isLoading ? <FaSpinner className="spinner-icon" /> : 'Sign In'}
            </button>
          </form>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <p>
            Don't have an account? <Link to="/register">Create Account</Link>
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

export default Login;
