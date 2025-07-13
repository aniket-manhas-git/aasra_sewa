// src/pages/HostPDFViewer.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/HostVerification.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HostPDFViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Pending');
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/admin/property/${id}`, { credentials: 'include' });
        const data = await res.json();
        if (data && data.property) {
          setProperty(data.property);
        }
      } catch (err) {
        setProperty(null);
      }
      setLoading(false);
    };
    fetchProperty();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!property) return <p>Property not found</p>;

  const host = property.createdBy || {};
  const pdfUrl = property.healthReportPDF || '/sample-property-report.pdf';

  const handleToggleVerification = () => {
    if (status === 'Verified') {
      setStatus('Unverified');
      alert('Host marked as unverified.');
    } else {
      setStatus('Verified');
      alert('Host verified successfully.');
    }
  };

  return (
    <section className="host-verification-section">
      <h1 className="dashboard-title">Verify Host</h1>
      <p className="dashboard-subtitle">Verifying: {host.fullName || 'N/A'} ({host.email || 'N/A'})</p>

      <div className="pdf-container">
        <iframe
          className="pdf-viewer"
          src={pdfUrl}
          title="Host Document"
          loading="lazy"
        >
          Your browser does not support iframes. <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Click here</a> to view.
        </iframe>
      </div>

      <div className="verification-actions">
        <button
          className={status === 'Verified' ? 'toggle-btn unverify' : 'toggle-btn verify'}
          onClick={handleToggleVerification}
        >
          {status === 'Verified' ? '❌ Unverify Host' : '✅ Verify Host'}
        </button>
        <p className="verification-status">
          Current Status: <strong>{status}</strong>
        </p>
        <button className="toggle-btn" onClick={() => navigate(-1)}>🔙 Go Back</button>
      </div>
    </section>
  );
};

export default HostPDFViewer;