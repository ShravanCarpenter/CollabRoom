import React, { useState } from "react";
import axios from "axios";
import { Form } from "react-bootstrap";
import { Lock, Eye, EyeOff, ArrowLeft, Shield } from 'react-feather';
import "./UpdatePassword.css";

const PasswordChange = () => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);

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

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: "", text: "" });

        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setMessage({ type: "error", text: "Passwords do not match." });
            setIsLoading(false);
            return;
        }

        if (getPasswordStrength(passwordData.newPassword) === 'weak') {
            setMessage({ type: "error", text: "Please choose a stronger password." });
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:3000/api/auth/update-password", passwordData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage({ type: "success", text: "Password updated successfully!" });
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            });
        } catch (error) {
            setMessage({ 
                type: "error", 
                text: error.response?.data?.message || "Failed to update password." 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <div className="password-update-container">
            <div className="password-update-header">
                <h1>Change Password</h1>
                <Shield size={24} className="shield-icon" />
            </div>

            {message.text && (
                <div className={`message-banner ${message.type}`}>
                    {message.text}
                </div>
            )}

            <Form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                    <div className="input-icon">
                        <Lock size={20} />
                    </div>
                    <Form.Control
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Current Password"
                        required
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => togglePasswordVisibility('current')}
                    >
                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <div className="form-group">
                    <div className="input-icon">
                        <Lock size={20} />
                    </div>
                    <Form.Control
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="New Password"
                        required
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => togglePasswordVisibility('new')}
                    >
                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {passwordData.newPassword && (
                        <div className={`password-strength ${getPasswordStrength(passwordData.newPassword)}`}>
                            Password Strength: {getPasswordStrength(passwordData.newPassword)}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <div className="input-icon">
                        <Lock size={20} />
                    </div>
                    <Form.Control
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmNewPassword"
                        value={passwordData.confirmNewPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm New Password"
                        required
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => togglePasswordVisibility('confirm')}
                    >
                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <button 
                    type="submit" 
                    className={`submit-button ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="loader"></div>
                    ) : (
                        'Update Password'
                    )}
                </button>

                <div className="back-link">
                    <a href="/profile/update" className="action-link">
                        <ArrowLeft size={18} />
                        Back to Profile
                    </a>
                </div>
            </Form>
        </div>
    );
};

export default PasswordChange;
