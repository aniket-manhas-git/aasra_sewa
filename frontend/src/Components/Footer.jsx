// Footer.jsx
import React from "react";
import { FaPhoneAlt, FaEnvelope, FaCopyright } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import "./../Styles/Footer.css"; // Ensure this path is correct

export default function Footer() {
  return (
    <footer>
      <div className="footer-columns">
        <div className="footer-column">
          <h4>Contact</h4>
          <ul>
            <li>
              <FaPhoneAlt /> +91-9876543210
            </li>
            <li>
              <FaEnvelope /> contact@aasrasewa.in
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>About</h4>
          <p>
            AasraSewa is a community-driven platform dedicated to providing
            shelter and support to families affected by natural disasters.
            Together, we can make a difference.
          </p>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <FiExternalLink />
              <a href="/terms" className="footer-link">Terms & Conditions</a>
            </li>
            <li>
              <FiExternalLink />
              <a href="/privacy" className="footer-link">Privacy Policy</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-link">
          <FaCopyright /> {new Date().getFullYear()} <strong>AasraSewa</strong>. Developed by Team Innovexia
        </span>
      </div>
    </footer>
  );
}
