// ✅ src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import HostVerification from './pages/HostVerification';
import ActiveHosts from './pages/activehost';
import Messages from './pages/message';
import ActiveUsers from './pages/activeuser';
import HostPDFViewer from './pages/HostPDFViewer';
import HostDetails from './pages/HostDetails';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [active, setActive] = useState('host-verification');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleNavClick = (section) => {
    setActive(section);
    setSidebarOpen(false);
  };

  const DashboardLayout = () => {
    return (
      <div className="dashboard-layout">
        {/* Mobile Header */}
        <header className="mobile-header">
          <button
            className="hamburger"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span />
            <span />
            <span />
          </button>
          <span className="mobile-title">
            <span className="logo-dot" /> Admin
          </span>
        </header>

        {/* Sidebar */}
        <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="sidebar-header">
            <h2>
              <span className="logo-dot" /> Admin
            </h2>
          </div>
          <nav>
            <ul>
              <li
                className={active === 'host-verification' ? 'active' : ''}
                onClick={() => handleNavClick('host-verification')}
              >
                <span className="icon">🛡️</span> Host Verification
              </li>
              <li
                className={active === 'active-hosts' ? 'active' : ''}
                onClick={() => handleNavClick('active-hosts')}
              >
                <span className="icon">🏠</span> Active Hosts
              </li>
              <li
                className={active === 'messages' ? 'active' : ''}
                onClick={() => handleNavClick('messages')}
              >
                <span className="icon">💬</span> Messages
              </li>
              <li
                className={active === 'active-users' ? 'active' : ''}
                onClick={() => handleNavClick('active-users')}
              >
                <span className="icon">🧑‍💻</span> Active Users
              </li>
              <li onClick={handleLogout}>
                <span className="icon">🚪</span> Logout
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main
          className="main-content"
          onClick={() => sidebarOpen && setSidebarOpen(false)}
        >
          {renderMainContent()}
        </main>

        {/* Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    );
  };

  const renderMainContent = () => {
    switch (active) {
      case 'host-verification':
        return <HostVerification />;
      case 'active-hosts':
        return <ActiveHosts />;
      case 'messages':
        return <Messages />;
      case 'active-users':
        return <ActiveUsers />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login onLogin={handleLoginSuccess} />}
      />
      <Route
        path="/dashboard"
        element={isLoggedIn ? <DashboardLayout /> : <Login onLogin={handleLoginSuccess} />}
      />
      <Route
        path="/host/:id/verify"
        element={isLoggedIn ? <HostPDFViewer /> : <Login onLogin={handleLoginSuccess} />}
      />
      <Route
        path="/host/:id/details"
        element={isLoggedIn ? <HostDetails /> : <Login onLogin={handleLoginSuccess} />}
      />
      <Route
        path="*"
        element={<Login onLogin={handleLoginSuccess} />}
      />
    </Routes>
  );
}

export default App;
