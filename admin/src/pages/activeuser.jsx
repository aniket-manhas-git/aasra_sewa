// src/pages/Activeuser.jsx
import React, { useEffect, useState } from 'react';
import '../styles/activeuser.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log('API_BASE_URL (activeuser):', API_BASE_URL);

const ActiveUser = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
              const url = `${API_BASE_URL}/admin/users`;
      console.log('Fetching users from:', url);
      try {
        const res = await fetch(url, { credentials: 'include' });
        console.log('Response status:', res.status);
        const data = await res.json();
        console.log('Fetched users data:', data);
        if (data && data.users) {
          // Map backend data to UI structure
          const mapped = data.users.map((user) => ({
            id: user._id,
            name: user.fullName || 'N/A',
            location: user.address || 'N/A',
            email: user.email || 'N/A',
            status: 'Active',
          }));
          setUsers(mapped);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  return (
    <section className="active-hosts-section">
      <div className="active-hosts-wrapper">
        <div className="active-hosts-box">
          <h1 className="dashboard-title">Active Users</h1>
          <p className="dashboard-subtitle">
            View and manage currently active users in the system.
          </p>

          {users.length === 0 ? (
            <p className="loading-text">Loading users...</p>
          ) : (
            <div className="host-list">
              {users.map((user) => (
                <div className="host-card" key={user.id}>
                  <div className="host-info">
                    <h3 className="host-name">👤 {user.name}</h3>
                    <p className="host-location">📍 {user.location}</p>
                    <p className="host-email">✉️ {user.email}</p>
                  </div>
                  <div className="host-status-chip">
                    <span className={`status-badge ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ActiveUser;