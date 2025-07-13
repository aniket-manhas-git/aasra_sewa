// pages/Transport.jsx
import React, { useState } from "react";
import { Users, UserCheck, Baby } from "lucide-react";
import "./../Styles/Transport.css";

const Transport = () => {
  const [formData, setFormData] = useState({
    adults: 0,
    elders: 0,
    children: 0,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseInt(e.target.value),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const totalMembers = formData.adults + formData.elders + formData.children;

  return (
    <div className="transport-page">
      <h2>🚐 Transport Facility</h2>
      {!submitted ? (
        <form className="transport-form" onSubmit={handleSubmit}>
          <label>
            <span className="icon-label">
              <Users size={18} style={{ marginRight: "6px" }} /> Adults:
            </span>
            <input
              type="number"
              name="adults"
              min="0"
              value={formData.adults}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span className="icon-label">
              <UserCheck size={18} style={{ marginRight: "6px" }} /> Elders:
            </span>
            <input
              type="number"
              name="elders"
              min="0"
              value={formData.elders}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span className="icon-label">
              <Baby size={18} style={{ marginRight: "6px" }} /> Children/Infants:
            </span>
            <input
              type="number"
              name="children"
              min="0"
              value={formData.children}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit">Confirm Booking</button>
        </form>
      ) : (
        <div className="ticket">
          <h3>🎫 Transport Ticket</h3>
          <p>
            <strong>Total Members:</strong> {totalMembers}
          </p>
          <p>
            <strong>Adults:</strong> {formData.adults}
          </p>
          <p>
            <strong>Elders:</strong> {formData.elders}
          </p>
          <p>
            <strong>Children/Infants:</strong> {formData.children}
          </p>
          <p>
            <strong>Status:</strong> Booked ✅
          </p>
        </div>
      )}
    </div>
  );
};

export default Transport;
