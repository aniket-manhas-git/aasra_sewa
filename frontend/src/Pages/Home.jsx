// pages/Home.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthTest from "../Components/AuthTest.jsx";
import TopRatedShelters from "../Components/TopRatedShelters.jsx";
import "./../Styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mapLocation = location.state?.mapLocation;

  const handleExplore = () => {
    navigate("/results");
  };

  const handleEmergency = () => {
    navigate("/emergency");
  };

  const generateGoogleMapURL = () => {
    if (!mapLocation) return "https://www.google.com/maps/embed?pb=!1m18...";
    const query = `${mapLocation.area}, ${mapLocation.city}, ${mapLocation.pincode}`;
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  };

  return (
    <div className="home-page">
      {/* Auth Test Component - Remove this in production */}
      <AuthTest />
      
      <section className="home-section">
        <div className="home-container">
          <div className="home-map-wrapper">
            <div className="home-map">
              <iframe
                title="Aasra Map"
                src={generateGoogleMapURL()}
                className="home-iframe"
                allowFullScreen
                loading="lazy"
              />
            </div>

            <div className="home-button-container">
              <button className="home-explore-button" onClick={handleExplore}>
                Explore
              </button>
              <button className="home-emergency-button" onClick={handleEmergency}>
                Emergency
              </button>
            </div>
          </div>

          {/* Replace dummy data with real TopRatedShelters component */}
          <TopRatedShelters />
        </div>
      </section>
    </div>
  );
};

export default Home;
