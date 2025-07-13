import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./../Styles/Filter.css";

const dummyProperties = [
  { id: 1, title: "Villa Serenity", capacity: 3, disasterFree: true, location: "Delhi", img: "https://placehold.co/250x150?text=Villa+1", cost: 1500 },
  { id: 2, title: "Haven Nest", capacity: 5, disasterFree: true, location: "Mumbai", img: "https://placehold.co/250x150?text=Villa+2", cost: 2200 },
  { id: 3, title: "Sunshine Home", capacity: 2, disasterFree: false, location: "Pune", img: "https://placehold.co/250x150?text=Villa+3", cost: 0 },
  { id: 4, title: "Harmony House", capacity: 6, disasterFree: true, location: "Chennai", img: "https://placehold.co/250x150?text=Villa+4", cost: 3000 },
  { id: 5, title: "Cozy Cottage", capacity: 4, disasterFree: false, location: "Bangalore", img: "https://placehold.co/250x150?text=Villa+5", cost: 1800 },
  { id: 6, title: "Urban Apartment", capacity: 2, disasterFree: true, location: "Hyderabad", img: "https://placehold.co/250x150?text=Villa+6", cost: 1200 },
  { id: 7, title: "Lakeview Bungalow", capacity: 8, disasterFree: true, location: "Udaipur", img: "https://placehold.co/250x150?text=Villa+7", cost: 3500 },
  { id: 8, title: "Mountain Retreat", capacity: 5, disasterFree: false, location: "Manali", img: "https://placehold.co/250x150?text=Villa+8", cost: 2700 },
  { id: 9, title: "Garden Villa", capacity: 4, disasterFree: true, location: "Goa", img: "https://placehold.co/250x150?text=Villa+9", cost: 2100 },
  { id: 10, title: "Seaside Cottage", capacity: 3, disasterFree: false, location: "Kerala", img: "https://placehold.co/250x150?text=Villa+10", cost: 1600 },
  { id: 11, title: "Test Villa", capacity: 10, disasterFree: true, location: "Test City", img: "https://placehold.co/250x150?text=Villa+11", cost: 1000 },
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Property = () => {
  const query = useQuery();
  const navigate = useNavigate();

  // Set filters from URL query params, fallback to wide defaults for demo:
  const filters = {
    minMembers: parseInt(query.get("members")) || 1,
    maxCost: parseInt(query.get("maxCost")) || 10000, // higher max cost so more results
    onlyDisasterFree: query.get("disasterFree") === "1",
    onlyFree: query.get("free") === "1",
    sortByCost: query.get("sort") || "",
  };

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page to 1 if filters change (avoid empty page)
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.minMembers, filters.maxCost, filters.onlyDisasterFree, filters.onlyFree, filters.sortByCost]);

  const filteredProperties = useMemo(() => {
    let result = dummyProperties.filter((house) => {
      const isFreeMatch = !filters.onlyFree || house.cost === 0;
      return (
        house.capacity >= filters.minMembers &&
        house.cost <= filters.maxCost &&
        (!filters.onlyDisasterFree || house.disasterFree) &&
        isFreeMatch
      );
    });

    if (filters.sortByCost === "low") {
      result.sort((a, b) => a.cost - b.cost);
    } else if (filters.sortByCost === "high") {
      result.sort((a, b) => b.cost - a.cost);
    }

    return result;
  }, [filters]);

  // Pagination slice
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const handleCardClick = (id) => {
    navigate(`/property/${id}`);
  };

  return (
    <div className="results">
      <h2>Filtered Property Results</h2>

      <div className="results-grid">
        {paginatedProperties.length > 0 ? (
          paginatedProperties.map((prop) => (
            <div
              key={prop.id}
              className="result-card"
              onClick={() => handleCardClick(prop.id)}
              style={{ cursor: "pointer" }}
            >
              <img src={prop.img} alt={prop.title} />
              <h3>{prop.title}</h3>
              <p>Location: {prop.location}</p>
              <p>Capacity: {prop.capacity} people</p>
              <p>Cost: ₹{prop.cost}</p>
            </div>
          ))
        ) : (
          <p>No suitable properties found.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div
          className="pagination"
          style={{ marginTop: "20px", textAlign: "center" }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            style={{ marginRight: "10px" }}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ marginLeft: "10px" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Property;
