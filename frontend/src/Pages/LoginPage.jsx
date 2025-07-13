import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import "../Styles/LoginPage.css";
import logo from "../assets/logo.png";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Eye icons

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        if (formData.rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        navigate("/home");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="image-container">
          <img src={logo} alt="Logo" className="login-logo" />
        </div>

        <h2>Welcome </h2>
        <p>Please login to continue</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="login-input"
            required
            disabled={loading}
          />

          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="login-input"
              required
              disabled={loading}
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          <label className="remember-label">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="remember-checkbox"
              disabled={loading}
            />
            Remember Me
          </label>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-text">
          Don't have an account?{" "}
          <span className="signup-link" onClick={() => navigate("/signup")}>
            SignUp
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
