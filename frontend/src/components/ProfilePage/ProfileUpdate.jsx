import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form } from "react-bootstrap";
import { Edit2, User, Mail, Lock, ArrowLeft } from 'react-feather';
import "./ProfileUpdate.css";

const ProfileUpdate = () => {
    const [user, setUser] = useState({ name: "", email: "" });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const { data } = await axios.get("http://localhost:3000/api/auth/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser({ name: data.name || "", email: data.email || "" });
            } catch {
                setMessage({ type: "error", text: "Failed to fetch user data." });
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .trim()
            .split(" ")
            .map((part) => part.charAt(0).toUpperCase())
            .join("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:3000/api/auth/profile/update", user, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage({ type: "success", text: "Profile updated successfully!" });
            setIsEditing(false);
        } catch {
            setMessage({ type: "error", text: "Failed to update profile." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="profileContainer">
            <div className="profile-header">
                <h1>Profile Settings</h1>
                <button 
                    className="edit-toggle"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    <Edit2 size={20} />
                </button>
            </div>

            <div className="profile-avatar">
                <div className="initials">{getInitials(user.name)}</div>
                {isEditing && <div className="avatar-overlay">
                    <Edit2 size={24} />
                </div>}
            </div>

            {message.text && (
                <div className={`message-banner ${message.type}`}>
                    {message.text}
                </div>
            )}

            <Form onSubmit={handleSubmit} className={isEditing ? 'editing' : ''}>
                <div className="form-group">
                    <div className="input-icon">
                        <User size={20} />
                    </div>
                    <Form.Control 
                        type="text"
                        name="name"
                        value={user.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Your Name"
                        required
                    />
                </div>

                <div className="form-group">
                    <div className="input-icon">
                        <Mail size={20} />
                    </div>
                    <Form.Control 
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Your Email"
                        required
                    />
                </div>

                {isEditing && (
                    <button 
                        type="submit" 
                        className={`submit-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="loader"></div>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                )}

                <div className="profile-actions">
                    <a href="/update-password" className="action-link">
                        <Lock size={18} />
                        Change Password
                    </a>
                    <a href="/dashboard" className="action-link">
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </a>
                </div>
            </Form>
        </div>
    );
};

export default ProfileUpdate;
