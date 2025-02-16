import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Spinner } from "react-bootstrap";
import "./ProfileUpdate.css";

const ProfileUpdate = () => {
    const [user, setUser] = useState({ name: "", email: "" });
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);

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
        } catch {
            setMessage({ type: "error", text: "Failed to update profile." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="profileContainer">
            <h1>Profile</h1>
            <div className="initials">{getInitials(user.name)}</div>

            {message.text && <div className={`${message.type}-message`}>{message.text}</div>}

            <Form onSubmit={handleSubmit}>
                {["name", "email"].map((field) => (
                    <Form.Group key={field}>
                        <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                        <Form.Control 
                            type={field} 
                            name={field} 
                            value={user[field]} 
                            onChange={handleChange} 
                            required 
                        />
                    </Form.Group>
                ))}

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Spinner animation="border" size="sm" /> : "Update Profile"}
                </Button>

                <div className="links-bottom">
                    <p><a href="/update-password">Change Password</a></p>
                    <p><a href="/dashboard">Go Back</a></p>
                </div>
            </Form>
        </div>
    );
};

export default ProfileUpdate;
