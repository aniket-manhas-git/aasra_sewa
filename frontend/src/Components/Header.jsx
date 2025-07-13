import React, { useState } from "react";
import { FaGlobe, FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import logo from "../assets/logo.png";
import "./../Styles/Header.css";

function HostButton({ onClick }) {
  return (
    <button className="host-button" onClick={onClick}>
      Host
    </button>
  );
}

function LanguageButton() {
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const handleSelect = (lang) => {
    setSelectedLanguage(lang);
    setOpen(false);
    // Optionally save to localStorage
    localStorage.setItem("preferredLanguage", lang);
  };

  return (
    <div className="dropdown-wrapper">
      <button className="icon-button" onClick={() => setOpen((prev) => !prev)}>
        <FaGlobe className="icon" />
      </button>
      {open && (
        <div className="dropdown-menu">
          <ul className="dropdown-list">
            <li className="dropdown-item" onClick={() => handleSelect("English")}>
              English
            </li>
            <li className="dropdown-item" onClick={() => handleSelect("Hindi")}>
              Hindi
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

function DropdownButton({ open, setOpen }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect to login
      navigate("/login");
    }
  };

  return (
    <div className="dropdown-wrapper">
      <button className="icon-button" onClick={() => setOpen((prev) => !prev)}>
        <FaBars className="icon" />
      </button>
      {open && (
        <div className="dropdown-menu">
          <ul className="dropdown-list">
            <li className="dropdown-item">Help Center</li>
            <li className="dropdown-item">Settings</li>
            <li className="dropdown-item logout" onClick={handleLogout}>
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleHostClick = () => {
    navigate("/host");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-wrapper">
          <img
            src={logo}
            alt="Logo"
            className="logo"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <span className="brand-name">AasraSewa</span>
        </div>

        <div className="header-buttons">
          <HostButton onClick={handleHostClick} />
          <LanguageButton />
          <DropdownButton open={dropdownOpen} setOpen={setDropdownOpen} />
        </div>
      </div>
    </header>
  );
}
