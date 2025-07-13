// src/pages/Messages.jsx
import React, { useEffect, useState } from 'react';
import '../styles/message.css';

const Messages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Placeholder: Replace with API call
    const dummyMessages = [
      {
        id: 1,
        sender: 'Amit Sharma',
        role: 'Host',
        message: 'Hello! I have a query regarding my last property listing.',
        time: '2025-07-07 10:32 AM',
      },
      {
        id: 2,
        sender: 'Ritika Verma',
        role: 'User',
        message: 'Can I schedule a visit to the shelter next week?',
        time: '2025-07-06 04:15 PM',
      },
    ];
    setMessages(dummyMessages);
  }, []);

  return (
    <section className="messages-section">
      <div className="messages-box">
        <h1 className="dashboard-title">📨 Messages</h1>
        <p className="dashboard-subtitle">
          Read and respond to messages received from hosts and users.
        </p>

        {messages.length === 0 ? (
          <p className="no-messages">No new messages.</p>
        ) : (
          <div className="message-list">
            {messages.map((msg) => (
              <div className="message-card" key={msg.id}>
                <div className="message-header">
                  <span className="message-sender">👤 {msg.sender}</span>
                  <span className={`message-role ${msg.role.toLowerCase()}`}>
                    {msg.role}
                  </span>
                </div>
                <p className="message-content">📝 {msg.message}</p>
                <span className="message-time">⏰ {msg.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Messages;