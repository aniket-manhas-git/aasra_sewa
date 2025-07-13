// pages/PropertyDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Home,
  Mail,
  Users,
  IndianRupee,
  Info,
  Ruler,
  Phone,
  User,
  Star,
  CheckCircle
} from "lucide-react";

import apiService from "../services/api.js";
import "./../Styles/PropertyDetails.css";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const result = await apiService.getPropertyById(id);
        
        if (result.success) {
          setProperty(result.data.property);
        } else {
          setError(result.error || "Property not found");
        }
      } catch (error) {
        setError("Failed to load property details");
        console.error("Property fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="property-details">
        <div className="spacer"></div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="property-details">
        <div className="spacer"></div>
        <div className="error-container">
          <h2>Property not found</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/home")} className="back-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleRentClick = () => {
    console.log("Property Address:", property.fullAddress);
    console.log("Property Location:", property.landmark);
    console.log("Property Details:", {
      title: property.title,
      address: property.fullAddress,
      location: property.landmark,
      pincode: property.pincode,
      price: property.pricePerNight
    });
    navigate(`/payment/${property._id}`);
  };

  const handleTransportClick = () => {
    navigate("/transport");
  };

  const allImages = [
    property.propertyImage,
    property.images?.frontWall,
    property.images?.backWall,
    property.images?.leftWall,
    property.images?.rightWall,
  ].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="property-details">
      <div className="spacer"></div>
      <div className="property-card">
        <div className="property-image-gallery">
          <div className="main-image-container">
            <img 
              src={allImages[currentImageIndex]} 
              alt={`${property.title} - Image ${currentImageIndex + 1}`} 
              className="property-img" 
            />
            {allImages.length > 1 && (
              <>
                <button 
                  className="nav-arrow prev-arrow" 
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button 
                  className="nav-arrow next-arrow" 
                  onClick={nextImage}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="image-thumbnails">
              {allImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => goToImage(index)}
                />
              ))}
            </div>
          )}

          {allImages.length > 1 && (
            <div className="image-counter">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>

        <div className="property-info">
          <h2>{property.title}</h2>
          <p><MapPin style={{ marginRight: "6px" }} /> <strong>Location:</strong> {property.location || property.landmark}</p>
          <p><Home style={{ marginRight: "6px" }} /> <strong>Address:</strong> {property.fullAddress}</p>
          <p><Mail style={{ marginRight: "6px" }} /> <strong>Pincode:</strong> {property.pincode}</p>
          <p><Users style={{ marginRight: "6px" }} /> <strong>Capacity:</strong> {property.capacity} people</p>
          <p><IndianRupee style={{ marginRight: "6px" }} /> <strong>Price per Night:</strong> ₹{property.pricePerNight === 0 ? "Free" : property.pricePerNight}</p>
          <p className="description"><Info style={{ marginRight: "6px" }} /> <strong>Description:</strong> {property.description}</p>
          <p><Ruler style={{ marginRight: "6px" }} /> <strong>Distance:</strong> {property.distance}</p>
          <p><Mail style={{ marginRight: "6px" }} /> <strong>Contact:</strong> {property.createdBy?.email || 'N/A'}</p>
          <p><Phone style={{ marginRight: "6px" }} /> <strong>Phone:</strong> {property.createdBy?.phone || 'N/A'}</p>
          <p><CheckCircle style={{ marginRight: "6px" }} /> <strong>Status:</strong> <span className={`status-${property.status}`}>{property.status}</span></p>
          <p><Star style={{ marginRight: "6px" }} /> <strong>Rating:</strong> {property.star}/5</p>

          {property.createdBy && (
            <div className="host-info">
              <h3><User style={{ marginRight: "6px" }} /> Host Information</h3>
              <p><strong>Name:</strong> {property.createdBy.fullName}</p>
              <p><strong>Email:</strong> {property.createdBy.email}</p>
              <p><strong>Phone:</strong> {property.createdBy.phone}</p>
            </div>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button className="rent-btn" onClick={handleRentClick}>
          Rent
        </button>
        <button className="transport-btn" onClick={handleTransportClick}>
          Book Transport
        </button>
      </div>
    </div>
  );
};

export default PropertyDetails;
