import React, { useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import "./UpdatePassword.css";

const UpdatePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    const [isPasswordVisible, setIsPasswordVisible] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "newPassword") {
            checkPasswordStrength(value);
        }

        setErrorMessage("");
    };

    // Toggle password visibility
    const togglePasswordVisibility = (field) => {
        setIsPasswordVisible((prevState) => ({
            ...prevState,
            [field]: !prevState[field],
        }));
    };

    // Password strength checker
    const checkPasswordStrength = (password) => {
        const lengthRequirement = password.length >= 8;
        const uppercaseRequirement = /[A-Z]/.test(password);
        const lowercaseRequirement = /[a-z]/.test(password);
        const numberRequirement = /\d/.test(password);
        const specialCharRequirement = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const passedChecks =
            lengthRequirement +
            uppercaseRequirement +
            lowercaseRequirement +
            numberRequirement +
            specialCharRequirement;

        if (passedChecks === 5) {
            setPasswordStrength("Strong");
        } else if (passedChecks >= 3) {
            setPasswordStrength("Medium");
        } else {
            setPasswordStrength("Weak");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const { currentPassword, newPassword, confirmNewPassword } = formData;
        if (newPassword !== confirmNewPassword) {
            setErrorMessage("❌ Passwords do not match.");
            setIsLoading(false);
            return;
        }

        if (passwordStrength !== "Strong") {
            setErrorMessage("❌ Password is not strong enough.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/api/auth/update-password", {
                currentPassword,
                newPassword,
            });

            setSuccessMessage(response.data.message || "✅ Password updated successfully!");
            setFormData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
            setPasswordStrength(""); // Reset password strength
        } catch (error) {
            setErrorMessage(error.response?.data?.error || "❌ An error occurred. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="update-password-container">
            <h2>Update Password</h2>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <form onSubmit={handleSubmit}>
                {/* Current Password */}
                <div className="password-field">
                    <input
                        type={isPasswordVisible.current ? "text" : "password"}
                        name="currentPassword"
                        placeholder="Current Password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                    />
                    <button type="button" onClick={() => togglePasswordVisibility("current")} className="toggle-password">
                        {isPasswordVisible.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                {/* Password Strength Indicator */}
                <div className={`password-strength ${passwordStrength.toLowerCase()}`}>
                    Password Strength: {passwordStrength}
                </div>

                {/* New Password */}
                <div className="password-field">
                    <input
                        type={isPasswordVisible.new ? "text" : "password"}
                        name="newPassword"
                        placeholder="New Password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        className={`password-input ${passwordStrength.toLowerCase()}`}
                    />
                    <button type="button" onClick={() => togglePasswordVisibility("new")} className="toggle-password">
                        {isPasswordVisible.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                {/* Confirm New Password */}
                <div className="password-field">
                    <input
                        type={isPasswordVisible.confirm ? "text" : "password"}
                        name="confirmNewPassword"
                        placeholder="Confirm New Password"
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        required
                    />
                    <button type="button" onClick={() => togglePasswordVisibility("confirm")} className="toggle-password">
                        {isPasswordVisible.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                {/* Submit Button */}
                <button className="submit-btn" type="submit" disabled={isLoading}>
                    {isLoading ? <FaSpinner className="spinner-icon" /> : "Update Password"}
                </button>
                <p>
                    <a href="/dashboard" style={{textDecoration: "none"}}>Go Back</a>
                </p>
            </form>
        </div>
    );
};

export default UpdatePassword;
