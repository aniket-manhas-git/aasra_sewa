import React, { useState, useEffect } from 'react';
import '../styles/HostDetails.css';
import { useParams, useNavigate } from 'react-router-dom';
import { FiDownload, FiEye, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/admin/property/${id}`, { credentials: 'include' });
        const data = await res.json();
        console.log('Property details:', data); // Debug log
        if (data && data.property) {
          setProperty(data.property);
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setProperty(null);
      }
      setLoading(false);
    };
    fetchProperty();
  }, [id]);

  const handleStatusUpdate = async (action) => {
    console.log('HostDetails: Starting status update with action:', action);
    
    // If approving, show modal to collect rating and comment
    if (action === 'approved') {
      setShowApprovalModal(true);
      return;
    }
    
    // For other actions (reject, pending), proceed directly
    await performStatusUpdate(action);
  };

  const performStatusUpdate = async (action, ratingData = null, commentData = null) => {
    try {
      const requestBody = { action };
      if (ratingData && commentData) {
        requestBody.rating = ratingData;
        requestBody.comment = commentData;
      }
      console.log('HostDetails: Request body:', requestBody);
      
              const res = await fetch(`${API_BASE_URL}/v1/admin/property/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });
      
      console.log('HostDetails: Response status:', res.status);
      const data = await res.json();
      console.log('HostDetails: Response data:', data);
      
      if (res.ok && data.success) {
        // Update the local state
        setProperty(prev => ({
          ...prev,
          status: action
        }));
        // Navigate to dashboard after successful update
        navigate('/dashboard');
      } else {
        console.error('HostDetails: Error response:', data);
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('HostDetails: Error updating status:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleApprovalSubmit = async () => {
    if (!comment.trim()) {
      alert('Please provide a comment when approving a property.');
      return;
    }
    
    setShowApprovalModal(false);
    await performStatusUpdate('approved', rating, comment);
  };

  const handleDownload = async (reportUrl, hostName) => {
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

  if (loading) return <p>Loading...</p>;
  if (!property) return <p>Property not found</p>;

  const host = property.createdBy || {};
  const report = property.healthReportPDF || '/sample-property-report.pdf';
  console.log('Host data:', host); // Debug log
  console.log('Age value:', host.age, 'Type:', typeof host.age); // Debug age

  return (
    <section className="host-details-section">
      <h1 className="host-details-title">Host Details</h1>
      <p className="host-details-subtitle">Verified host and property details</p>

      <div className="host-details-card">
        {/* Host Info */}
        <div className="host-info-pair"><strong>Name:</strong><span>{host.fullName || 'N/A'}</span></div>
        <div className="host-info-pair"><strong>Email:</strong><span>{host.email || 'N/A'}</span></div>
        <div className="host-info-pair"><strong>Phone:</strong><span>{host.phone || 'N/A'}</span></div>
        <div className="host-info-pair"><strong>City:</strong><span>{property.landmark || 'N/A'}</span></div>
        <div className="host-info-pair"><strong>Address:</strong><span>{host.address || property.fullAddress || 'N/A'}</span></div>
        <div className="host-info-pair"><strong>Gender:</strong><span>{host.gender || 'N/A'}</span></div>
        <div className="host-info-pair"><strong>Age:</strong><span>{host.age !== undefined && host.age !== null ? host.age.toString() : 'N/A'}</span></div>
        <div className="host-info-pair"><strong>Languages:</strong><span>{'N/A'}</span></div>

        <div className="host-description">
          <strong>Host Bio:</strong>
          <p>{property.description || 'N/A'}</p>
        </div>

        <hr style={{ margin: '2rem 0', borderColor: '#ccc' }} />

        {/* Property Info */}
        <div className="host-info-pair"><strong>Property Title:</strong><span>{property.title || 'N/A'}</span></div>
        <div className="host-info-pair"><strong>Landmark:</strong><span>{property.landmark || 'N/A'}</span></div>
        <div className="host-info-pair"><strong>Pincode:</strong><span>{property.pincode || 'N/A'}</span></div>
        <div className="host-info-pair"><strong>Full Address:</strong><span>{property.fullAddress || 'N/A'}</span></div>
        <div className="host-info-pair"><strong>Price/Night:</strong><span>₹{property.pricePerNight || 'N/A'}</span></div>
        <div className="host-info-pair"><strong>Capacity:</strong><span>{property.capacity || 'N/A'} People</span></div>
        <div className="host-info-pair"><strong>Status:</strong><span className={`status-badge ${property.status}`}>{property.status}</span></div>

        <div className="host-description">
          <strong>Property Description:</strong>
          <p>{property.description || 'N/A'}</p>
        </div>

        {/* PDF + Verify Buttons */}
        <div className="pdf-section">
          <span className="label">Property Report (PDF):</span>
          <div className="pdf-buttons">
            <a
              href={report}
              target="_blank"
              rel="noopener noreferrer"
              className="pdf-btn view"
              title="View Report"
            >
              <FiEye style={{ marginRight: '8px' }} /> View
            </a>
            <button
              onClick={() => handleDownload(report, host.fullName || 'host')}
              className="pdf-btn download"
              title="Download Report"
            >
              <FiDownload style={{ marginRight: '8px' }} /> Download
            </button>
            <button
              onClick={() => handleStatusUpdate('approved')}
              className={`pdf-btn verify verified ${property.status === 'approved' ? 'disabled' : ''}`}
              title="Approve Property"
              disabled={property.status === 'approved'}
            >
              <FiCheckCircle style={{ marginRight: '8px' }} /> Approve
            </button>
            <button
              onClick={() => handleStatusUpdate('rejected')}
              className={`pdf-btn verify unverified ${property.status === 'rejected' ? 'disabled' : ''}`}
              title="Reject Property"
              disabled={property.status === 'rejected'}
            >
              <FiXCircle style={{ marginRight: '8px' }} /> Reject
            </button>
          </div>

          <iframe
            src={report}
            className="pdf-viewer"
            title="Property Report"
          ></iframe>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Approve Property</h3>
            <p>Please provide a rating and comment for this property:</p>
            
            <div className="form-group">
              <label htmlFor="rating">Rating (1-5):</label>
              <select 
                id="rating" 
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={1}>1 - Poor</option>
                <option value={2}>2 - Fair</option>
                <option value={3}>3 - Good</option>
                <option value={4}>4 - Very Good</option>
                <option value={5}>5 - Excellent</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="comment">Comment:</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Provide your review comment..."
                rows={4}
                required
              />
            </div>
            
            <div className="modal-buttons">
              <button onClick={() => setShowApprovalModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleApprovalSubmit} className="submit-btn">
                Approve Property
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HostDetails;
