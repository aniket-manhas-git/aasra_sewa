import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import cloudinaryService from "../services/cloudinary.js";
import apiService from "../services/api.js";
import "../Styles/Host.css"; // Assuming you have a CSS file for styling

export default function HostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    landmark: "",
    pincode: "",
    fullAddress: "",
    pricePerNight: "",
    description: "",
    capacity: "",
  });

  const [propertyImage, setPropertyImage] = useState(null);
  const [propertyImagePreview, setPropertyImagePreview] = useState(null);

  const [wallImages, setWallImages] = useState({
    frontWall: null,
    backWall: null,
    leftWall: null,
    rightWall: null,
  });

  const [wallImagePreviews, setWallImagePreviews] = useState({
    frontWall: null,
    backWall: null,
    leftWall: null,
    rightWall: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePropertyImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPropertyImage(file);
      setPropertyImagePreview(URL.createObjectURL(file));
    }
  };

  const handleWallImageUpload = (e, wall) => {
    const file = e.target.files[0];
    if (file) {
      setWallImages((prev) => ({
        ...prev,
        [wall]: file,
      }));
      setWallImagePreviews((prev) => ({
        ...prev,
        [wall]: URL.createObjectURL(file),
      }));
    }
  };

  const removePropertyImage = () => {
    setPropertyImage(null);
    setPropertyImagePreview(null);
  };

  const removeWallImage = (wall) => {
    setWallImages((prev) => ({
      ...prev,
      [wall]: null,
    }));
    setWallImagePreviews((prev) => ({
      ...prev,
      [wall]: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    const requiredFields = [
      "title",
      "landmark",
      "pincode",
      "fullAddress",
      "pricePerNight",
      "description",
      "capacity",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      setError(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    // Check if all wall images are uploaded
    const requiredWalls = ["frontWall", "backWall", "leftWall", "rightWall"];
    const missingWalls = requiredWalls.filter((wall) => !wallImages[wall]);
    if (missingWalls.length > 0) {
      setError(
        `Please upload images for all walls: ${missingWalls.join(", ")}`
      );
      return;
    }

    setLoading(true);

    try {
      // Upload property image if provided
      let propertyImageUrl = null;
      if (propertyImage) {
        const propertyUploadResult = await cloudinaryService.uploadImage(
          propertyImage,
          "properties"
        );
        if (!propertyUploadResult.success) {
          setError("Failed to upload property image. Please try again.");
          return;
        }
        propertyImageUrl = propertyUploadResult.url;
      }

      // Upload all wall images
      const wallUploadPromises = Object.entries(wallImages).map(
        async ([wall, file]) => {
          const result = await cloudinaryService.uploadImage(file, "walls");
          return { wall, result };
        }
      );

      const wallUploadResults = await Promise.all(wallUploadPromises);

      // Check if all wall uploads were successful
      const failedUploads = wallUploadResults.filter(
        ({ result }) => !result.success
      );
      if (failedUploads.length > 0) {
        setError("Failed to upload some wall images. Please try again.");
        return;
      }

      // Prepare images object
      const images = {};
      wallUploadResults.forEach(({ wall, result }) => {
        images[wall] = result.url;
      });

      // 1. First, call building health analysis to get the PDF URL
      const analyzeResponse = await fetch("http://localhost:5001/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images, // { frontWall: url, backWall: url, ... }
          propertyId: "temp_" + Date.now(), // Temporary ID for analysis
        }),
      });
      
      let healthReportPDF = null;
      if (analyzeResponse.ok) {
        const analyzeResult = await analyzeResponse.json();
        healthReportPDF = analyzeResult.pdf_url;
        console.log("✅ Building health analysis completed successfully");
        console.log("📄 PDF URL:", healthReportPDF);
      } else {
        const analyzeResult = await analyzeResponse.json();
        console.warn("⚠️ Building health analysis failed:", analyzeResult.message);
        // Continue without health report - property will be saved without PDF
      }

      // 2. Now save the property with all data including the PDF URL
      const propertyData = {
        ...formData,
        images,
        propertyImage: propertyImageUrl,
        healthReportPDF, // Include the PDF URL if analysis was successful
      };
      
      const result = await apiService.registerProperty(propertyData);

      if (!result.success) {
        setError(result.error || "Failed to register property");
        setLoading(false);
        return;
      }

      // Property registered successfully
      navigate("/home", {
        state: {
          message:
            "Property registered successfully! It will be reviewed by admin.",
        },
      });
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Property registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="host-wrapper">
      <div className="host-container">
        <h2 className="host-title">
          Become a <span className="highlight">Host</span>
        </h2>
        <p className="host-subtitle">
          Share your space, earn money, and join our hosting community.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="host-form">
          <input
            type="text"
            name="title"
            placeholder="Property Title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="text"
            name="landmark"
            placeholder="Landmark / Area"
            value={formData.landmark}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="text"
            name="fullAddress"
            placeholder="Full Address"
            value={formData.fullAddress}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="number"
            name="pricePerNight"
            placeholder="Price per Night (₹)"
            value={formData.pricePerNight}
            onChange={handleChange}
            required
            min="0"
            disabled={loading}
          />
          <input
            type="number"
            name="capacity"
            placeholder="Capacity (Number of people)"
            value={formData.capacity}
            onChange={handleChange}
            required
            min="1"
            disabled={loading}
          />
          <textarea
            name="description"
            placeholder="Describe your property..."
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            disabled={loading}
          ></textarea>

          {/* Property Image Upload */}
          <div className="image-upload-section">
            <label>Property Main Image (Optional)</label>
            <div className="property-image-upload">
              {propertyImagePreview ? (
                <div className="image-preview-box">
                  <img src={propertyImagePreview} alt="Property" />
                  <button
                    type="button"
                    onClick={removePropertyImage}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePropertyImageUpload}
                  disabled={loading}
                />
              )}
            </div>
          </div>

          {/* Wall Images Upload */}
          <div className="image-upload-section">
            <label>Upload Images for Each Wall (Required)</label>
            {["frontWall", "backWall", "leftWall", "rightWall"].map((wall) => (
              <div key={wall} className="wall-upload-box">
                <label className="wall-label">
                  {wall.replace("Wall", "")} Wall:
                </label>
                {wallImagePreviews[wall] ? (
                  <div className="image-preview-box">
                    <img src={wallImagePreviews[wall]} alt={`${wall} wall`} />
                    <button
                      type="button"
                      onClick={() => removeWallImage(wall)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleWallImageUpload(e, wall)}
                    disabled={loading}
                    required
                  />
                )}
              </div>
            ))}
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Registering Property..." : "Submit Property"}
          </button>
        </form>
      </div>
    </div>
  );
}
