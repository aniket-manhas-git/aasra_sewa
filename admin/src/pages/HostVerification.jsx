// src/pages/HostVerification.jsx
import React, { useState, useEffect } from 'react';
import '../styles/HostVerification.css';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiEye,
  FiTrash2,
  FiDownload,
  FiCheckCircle,
  FiXCircle,
  FiStar,
} from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HostVerification = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hosts, setHosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHosts = async () => {
      setLoading(true);
      try {
        const url = statusFilter === 'all' 
          ? `${API_BASE_URL}/v1/admin/properties`
          : `${API_BASE_URL}/v1/admin/properties?status=${statusFilter}`;
        
        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();
        console.log('Raw backend data:', data); // Debug log
        if (data && data.properties) {
          // Map backend data to UI structure
          const mapped = data.properties.map((property) => {
            const user = property.createdBy || {};
            console.log('User data for property:', property._id, user); // Debug log
            console.log('Age value:', user.age, 'Type:', typeof user.age); // Debug age
            return {
              id: property._id,
              name: user.fullName || 'N/A',
              email: user.email || 'N/A',
              status: property.status === 'approved' ? 'Approved' : property.status === 'rejected' ? 'Rejected' : 'Pending',
              verified: property.status === 'approved',
              phone: user.phone || 'N/A',
              city: property.landmark || 'N/A',
              address: user.address || property.fullAddress || 'N/A',
              gender: user.gender || 'N/A',
              age: user.age !== undefined && user.age !== null ? user.age.toString() : 'N/A',
              experience: 'N/A', // Dummy value
              language: 'N/A', // Dummy value
              description: property.description || 'N/A',
              report: property.healthReportPDF || '/sample-property-report.pdf',
              propertyTitle: property.title || 'N/A',
              adminRating: property.adminReview?.rating || null,
            };
          });
          console.log('Mapped hosts data:', mapped); // Debug log
          setHosts(mapped);
        }
      } catch (err) {
        console.error('Error fetching hosts:', err);
        setHosts([]);
      }
      setLoading(false);
    };
    fetchHosts();
  }, [statusFilter]);

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleStatusChange = (newStatus) => setStatusFilter(newStatus);

  const handleStatusUpdate = async (id, action, e) => {
    e.stopPropagation(); // Prevent card click
    
    if (action === 'approved') {
      // Show rating modal for approval
      setSelectedProperty({ id, action });
      setShowRatingModal(true);
      return;
    }

    await performStatusUpdate(id, action);
  };

  const performStatusUpdate = async (id, action, ratingData = null) => {
    try {
      const requestBody = { action };
      if (ratingData) {
        requestBody.rating = ratingData.rating;
        requestBody.comment = ratingData.comment;
      }

      const res = await fetch(`${API_BASE_URL}/v1/admin/property/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Update the local state
        setHosts((prev) =>
          prev.map((host) =>
            host.id === id
              ? {
                  ...host,
                  status: action === 'approved' ? 'Approved' : action === 'rejected' ? 'Rejected' : 'Pending',
                  verified: action === 'approved',
                  adminRating: ratingData?.rating || host.adminRating,
                }
              : host
          )
        );
        // Navigate to dashboard after successful update
        navigate('/dashboard');
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleRatingSubmit = async () => {
    if (selectedProperty) {
      // Validate that comment is provided
      if (!comment.trim()) {
        alert('Please provide a comment about the property.');
        return;
      }

      await performStatusUpdate(selectedProperty.id, selectedProperty.action, {
        rating,
        comment: comment.trim()
      });
      setShowRatingModal(false);
      setSelectedProperty(null);
      setRating(5);
      setComment('');
    }
  };

  const deleteHost = async (id, e) => {
    e.stopPropagation(); // Prevent card click
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this property? This action cannot be undone.'
    );
    if (confirmDelete) {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/admin/property/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok && data.success) {
          // Remove from local state
          setHosts((prev) => prev.filter((host) => host.id !== id));
          alert('Property deleted successfully');
        } else {
          alert(data.message || 'Failed to delete property');
        }
      } catch (err) {
        console.error('Error deleting property:', err);
        alert('Network error. Please try again.');
      }
    }
  };

  const handleDownload = async (reportUrl, hostName, e) => {
    e.stopPropagation(); // Prevent card click
    try {
      const response = await fetch(reportUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${hostName}_health_report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download the report. Please try again.');
    }
  };

  // Enhanced search functionality - search by property title and user name
  const filteredHosts = hosts.filter((host) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      host.name.toLowerCase().includes(searchLower) ||
      host.propertyTitle.toLowerCase().includes(searchLower) ||
      host.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <section className="host-verification-section">
      <h1 className="dashboard-title">Host Verification</h1>
      <p className="dashboard-subtitle">
        Review pending host verification requests. Search and manage actions
        below.
      </p>

      <div className="search-bar">
        <FiSearch size={18} />
        <input
          type="text"
          placeholder="Search by host name, property title, or email..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div style={{ margin: '16px 0' }}>
        <button
          className={statusFilter === 'all' ? 'active' : ''}
          onClick={() => handleStatusChange('all')}
        >
          All
        </button>
        <button
          className={statusFilter === 'pending' ? 'active' : ''}
          onClick={() => handleStatusChange('pending')}
          style={{ marginLeft: 8 }}
        >
          Pending
        </button>
        <button
          className={statusFilter === 'approved' ? 'active' : ''}
          onClick={() => handleStatusChange('approved')}
          style={{ marginLeft: 8 }}
        >
          Approved
        </button>
        <button
          className={statusFilter === 'rejected' ? 'active' : ''}
          onClick={() => handleStatusChange('rejected')}
          style={{ marginLeft: 8 }}
        >
          Rejected
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="host-list">
          {filteredHosts.map((host) => (
            <div
              key={host.id}
              className="host-card"
              onClick={() => navigate(`/host/${host.id}/details`)}
            >
              <div className="host-info">
                <h3 className="host-name">{host.name}</h3>
                <p className="host-email">{host.email}</p>
                <p className="host-property-title">Property: {host.propertyTitle}</p>
                <span className={`status-badge ${host.status.toLowerCase()}`}>
                  {host.status}
                </span>
                {host.adminRating && (
                  <div className="rating-display">
                    <FiStar style={{ color: '#ffd700', marginRight: '4px' }} />
                    {host.adminRating}/5
                  </div>
                )}
              </div>
              <div className="host-actions" onClick={(e) => e.stopPropagation()}>
                <a
                  href={host.report}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View PDF"
                >
                  <FiEye />
                </a>
                <button 
                  onClick={(e) => handleDownload(host.report, host.name, e)} 
                  title="Download PDF"
                >
                  <FiDownload />
                </button>
                <button onClick={(e) => deleteHost(host.id, e)} title="Delete Property">
                  <FiTrash2 />
                </button>
                <button
                  onClick={(e) => handleStatusUpdate(host.id, 'approved', e)}
                  title="Approve Property"
                  className={`approve-btn-small ${host.status === 'Approved' ? 'disabled' : ''}`}
                  disabled={host.status === 'Approved'}
                >
                  <FiCheckCircle />
                </button>
                <button
                  onClick={(e) => handleStatusUpdate(host.id, 'rejected', e)}
                  title="Reject Property"
                  className={`reject-btn-small ${host.status === 'Rejected' ? 'disabled' : ''}`}
                  disabled={host.status === 'Rejected'}
                >
                  <FiXCircle />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="rating-modal-overlay">
          <div className="rating-modal">
            <h3>Rate Property</h3>
            <p>Please provide a rating and comment for this property:</p>
            
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`star-btn ${star <= rating ? 'active' : ''}`}
                >
                  <FiStar />
                </button>
              ))}
            </div>
            
            <div className="rating-input">
              <label>Rating: {rating}/5</label>
            </div>
            
            <div className="comment-input">
              <label>Comment: <span style={{color: 'red'}}>*</span></label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Please provide a detailed comment about this property (required)..."
                rows="4"
                required
              />
              <small style={{color: '#6c757d', fontSize: '0.8rem'}}>
                * Comment is required when approving a property
              </small>
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowRatingModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button 
                onClick={handleRatingSubmit} 
                className="submit-btn"
                disabled={!comment.trim()}
              >
                Approve & Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HostVerification;
