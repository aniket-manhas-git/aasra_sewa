import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./../Styles/HeroSection.css";

import earth from "../assets/earth.jpg";
import fire from "../assets/fire.jpg";
import flood from "../assets/flood.jpg";
import flood1 from "../assets/flood1.jpg";
import people from "../assets/people.jpg";

const images = [earth, fire, flood, flood1, people];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 1000); // Image changes every 1 second
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section">
      {/* Background Image */}
      <div className="hero-image-wrapper">
        <img
          src={images[currentIndex]}
          alt="Background"
          className="hero-bg-image"
        />
      </div>

      {/* Dark overlay */}
      <div className="hero-overlay"></div>

      {/* Text content in container */}
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="hero-heading">
          Find Your <span className="highlight">Aasra</span> with Sewa!
        </h1>
        <p className="hero-subtitle">
          Smart Relief, Safe Shelter, Strong Communities!{" "}
          <span className="hero-brand">AasraSewa</span>.
        </p>
      </motion.div>
    </section>
  );
}
