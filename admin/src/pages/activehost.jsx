import React, { useState, useEffect } from 'react';
import '../styles/activehost.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log('API_BASE_URL (activehost):', API_BASE_URL);

const ActiveHosts = () => {
  const [visibleHostId, setVisibleHostId] = useState(null);
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    const fetchHosts = async () => {
      const url = `${API_BASE_URL}/v1/admin/hosts`;
      console.log('Fetching hosts from:', url);
      try {
        const res = await fetch(url, { credentials: 'include' });
        console.log('Response status:', res.status);
        const data = await res.json();
        console.log('Fetched hosts data:', data);
        if (data && data.hosts) {
          // Map backend data to UI structure
          const mapped = data.hosts.map((host) => ({
            id: host._id,
            name: host.fullName || 'N/A',
            location: host.address || 'N/A',
            email: host.email || 'N/A',
            status: 'Active',
            phone: host.phone || 'N/A',
            joined: new Date(host.createdAt).toLocaleDateString() || 'N/A',
            bloodGroup: host.bloodGroup || 'N/A',
            image: host.face || 'https://randomuser.me/api/portraits/men/11.jpg', // Use actual face image or fallback
          }));
          setHosts(mapped);
        }
      } catch (err) {
        console.error('Error fetching hosts:', err);
        setHosts([]);
      }
    };
    fetchHosts();
  }, []);

  const toggleDetails = (id) => {
    setVisibleHostId((prevId) => (prevId === id ? null : id));
  };

  return (
    <section className="active-hosts-section">
      <div className="active-hosts-box">
        <h1 className="dashboard-title">Active Hosts</h1>
        <p className="dashboard-subtitle">
          Monitor currently listed hosts and their activity status.
        </p>

        <div className="active-host-list">
          {hosts.map((host) => (
            <div key={host.id} className="active-host-card">
              <img 
                src={host.image} 
                alt={host.name} 
                className="active-host-avatar"
                onError={(e) => {
                  e.target.src = 'https://randomuser.me/api/portraits/men/11.jpg';
                }}
              />
              <div className="active-host-info">
                <h3 className="active-host-name">{host.name}</h3>
                <p className="host-email">✉️ {host.email}</p>
                <p className="host-location">📍 {host.location}</p>
                <p className="active-host-status">
                  <span className="active-host-status-dot" />
                  {host.status}
                </p>

                <button
                  className="view-details-btn"
                  onClick={() => toggleDetails(host.id)}
                >
                  {visibleHostId === host.id ? 'Hide Details' : 'View Details'}
                </button>

                {visibleHostId === host.id && (
                  <div className="host-details">
                    <p><strong>Phone:</strong> 📞 {host.phone}</p>
                    <p><strong>Blood Group:</strong> 🩸 {host.bloodGroup}</p>
                    <p><strong>Joined:</strong> 📅 {host.joined}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActiveHosts;

