import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiService from "../services/api.js";
import "./../Styles/Filter.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Filter = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const defaultMembers = parseInt(query.get("members")) || 0;

  const [filters, setFilters] = useState({
    minCost: "",
    maxCost: "",
    members: "",
  });
  const [sortBy, setSortBy] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [totalProperties, setTotalProperties] = useState(0);

  // Filter states
  const [minMembers, setMinMembers] = useState(defaultMembers);
  const [onlyFree, setOnlyFree] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [limit] = useState(5); // ✅ Reduced from 10 to 5

  const fetchProperties = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        members: minMembers > 0 ? minMembers : undefined,
        maxCost: filters.maxCost ? parseInt(filters.maxCost) : undefined,
        minCost: filters.minCost ? parseInt(filters.minCost) : undefined,
        sort: sortBy || undefined,
        onlyFree: onlyFree ? true : undefined,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) delete params[key];
      });

      const result = await apiService.getApprovedProperties(params);

      if (result.success) {
        setProperties(result.data.properties);
        setTotalPages(result.data.totalPages);
        setTotalProperties(result.data.total);
        setCurrentPage(page);
      } else {
        setError(result.error || "Failed to fetch properties");
      }
    } catch (error) {
      setError("An error occurred while fetching properties");
      console.error("Properties fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchProperties(1);
    setShowFilters(false);
  };

  const handlePageChange = (page) => {
    fetchProperties(page);
  };

  const handleCardClick = (id) => {
    navigate(`/property/${id}`);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading && properties.length === 0) {
    return (
      <div className="results">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results">
      <h2>Filter and View Properties</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-container">
        <div className="filter-toggle">
          <button onClick={() => setShowFilters(!showFilters)} className="dropdown-toggle-btn">
            Filter ▾
          </button>
          {showFilters && (
            <div className="filter-dropdown">
              <label>Members: {minMembers}+</label>
              <input
                type="range"
                min="1"
                max="10"
                value={minMembers}
                onChange={(e) => setMinMembers(parseInt(e.target.value))}
              />

              <label>Max Cost: ₹{filters.maxCost}</label>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={filters.maxCost}
                onChange={(e) => setFilters({ ...filters, maxCost: e.target.value })}
              />

              <label>Min Cost: ₹{filters.minCost}</label>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={filters.minCost}
                onChange={(e) => setFilters({ ...filters, minCost: e.target.value })}
              />

              <label>
                <input
                  type="checkbox"
                  checked={onlyFree}
                  onChange={(e) => setOnlyFree(e.target.checked)}
                />
                Show only Free of Cost Houses
              </label>

              <label>Sort by Cost:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="asc">Low to High</option>
                <option value="desc">High to Low</option>
              </select>

              <button className="apply-btn" onClick={handleApplyFilters}>
                Apply Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="results-summary">
        <p>Showing {properties.length} of {totalProperties} properties</p>
      </div>

      <div className="results-grid">
        {properties.length > 0 ? (
          properties.map((prop) => (
            <div
              key={prop._id}
              className="result-card"
              onClick={() => handleCardClick(prop._id)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={prop.propertyImage || "https://placehold.co/250x150?text=Property"}
                alt={prop.title}
              />
              <h3>{prop.title}</h3>
              <p><strong>📍 Landmark:</strong> {prop.landmark}</p>
              <p><strong>👥 Capacity:</strong> {prop.capacity} people</p>
              <p><strong>💰 Cost:</strong> ₹{prop.pricePerNight === 0 ? "Free" : prop.pricePerNight}</p>
              <p><strong>📊 Status:</strong> <span className={`status-${prop.status}`}>{prop.status}</span></p>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No suitable properties found.</p>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" ? handlePageChange(page) : null}
              disabled={page === "..."}
              className={`pagination-btn ${page === currentPage ? "active" : ""} ${page === "..." ? "disabled" : ""}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Filter;
