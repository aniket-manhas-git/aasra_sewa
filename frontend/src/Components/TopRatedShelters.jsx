import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/TopRatedShelters.css';

const TopRatedShelters = () => {
  const [topProperties, setTopProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopRatedProperties = async () => {
      console.log('TopRatedShelters: Starting to fetch top rated properties');
      try {
        // First test if backend is accessible
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const healthUrl = `${API_URL}/health`;
        console.log('TopRatedShelters: Testing backend health at:', healthUrl);

        try {
          const healthRes = await fetch(healthUrl);
          console.log('TopRatedShelters: Health check status:', healthRes.status);
          if (healthRes.ok) {
            const healthData = await healthRes.json();
            console.log('TopRatedShelters: Health check response:', healthData);
          }
        } catch (healthError) {
          console.error('TopRatedShelters: Backend health check failed:', healthError);
        }

        const url = `${API_URL}/api/v1/property/top-rated`;
        console.log('TopRatedShelters: API URL:', url);

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('TopRatedShelters: Response status:', res.status);

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('TopRatedShelters: Response is not JSON, content-type:', contentType);
          const text = await res.text();
          console.error('TopRatedShelters: Response text:', text.substring(0, 200));
          throw new Error('Response is not JSON');
        }

        const data = await res.json();
        console.log('TopRatedShelters: Response data:', data);

        if (data.success && data.properties) {
          console.log('TopRatedShelters: Setting properties:', data.properties);
          setTopProperties(data.properties);
        } else {
          console.log('TopRatedShelters: No properties found or error in response');
        }
      } catch (error) {
        console.error('TopRatedShelters: Error fetching top rated properties:', error);
      }
      setLoading(false);
    };

    fetchTopRatedProperties();
  }, []);

  if (loading) {
    return (
      <div className="top-rated-section">
        <h3 className="home-properties-title">Our Top Rated Shelters</h3>
        <div className="loading">Loading top rated shelters...</div>
      </div>
    );
  }

  if (topProperties.length === 0) {
    return (
      <div className="top-rated-section">
        <h3 className="home-properties-title">Our Top Rated Shelters</h3>
        <div className="no-properties">
          <p>No top rated shelters available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="top-rated-section">
      <h3 className="home-properties-title">Our Top Rated Shelters</h3>

      <div className="home-properties-grid">
        {topProperties.map((property) => {
          const rating = property.adminReview?.rating || 0;
          const ratingStars = "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));

          return (
            <Link
              key={property._id}
              to={`/property/${property._id}`}
              className="home-property-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <img
                src={property.propertyImage || 'https://placehold.co/250x150?text=Property+Image'}
                alt={property.title}
                onError={(e) => {
                  e.target.src = 'https://placehold.co/250x150?text=Property+Image';
                }}
              />
              <h4>{property.title}</h4>
              <p>Location: {property.landmark}, {property.pincode}</p>
              <p>Rating: {ratingStars} ({rating.toFixed(1)})</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TopRatedShelters;
