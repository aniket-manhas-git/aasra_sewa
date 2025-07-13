// pages/Accommodation.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./../Styles/Accommodation.css";

const Accommodation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const property = location.state?.property;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (property) {
        navigate("/home", {
          state: {
            mapLocation: {
              area: property.area || "",
              city: property.location || "",
              pincode: property.pincode || ""
            }
          }
        });
      } else {
        navigate("/home");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, property]);

  return (
    <div className="page-container">
      <h2>Accommodation Confirmed 🎉</h2>
      <p>You have successfully booked this free Shelter.</p>
    </div>
  );
};

export default Accommodation;
