import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.jsx";

// Component Imports
import Header from "./Components/Header";
import HeroSection from "./Components/HeroSection";
import Footer from "./Components/Footer";

// Page Imports
import Signup from "./Pages/Signup";
import LoginPage from "./Pages/LoginPage";
import Home from "./Pages/Home";
import Host from "./Pages/Host";
import Filter from "./Pages/Filter";
import PropertyDetails from "./Pages/PropertyDetails";
import Payment from "./Pages/Payment";
import PaymentHistory from "./Pages/PaymentHistory";
import Accommodation from "./Pages/Accommodation";
import Transport from "./Pages/Transport";
import FaceVerificationPage from "./Pages/FaceVerificationPage";
import EmergencyPage from "./Pages/Emergency"; // ✅ NEW IMPORT

import ProtectedRoute from "./auth/ProtectedRoutes.jsx";

const Layout = () => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/signup" ||
    location.pathname === "/login" ||
    location.pathname === "/face-verification";

  return (
    <div className="app-wrapper">
      {!isAuthPage && <Header />}

      <main className="app-main container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HeroSection />
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/filter"
            element={
              <ProtectedRoute>
                <Filter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host"
            element={
              <ProtectedRoute>
                <Host />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Filter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/property/:id"
            element={
              <ProtectedRoute>
                <PropertyDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:id"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-history"
            element={
              <ProtectedRoute>
                <PaymentHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accommodation"
            element={
              <ProtectedRoute>
                <Accommodation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transport"
            element={
              <ProtectedRoute>
                <Transport />
              </ProtectedRoute>
            }
          />

          {/* ✅ Emergency Page Route (Protected) */}
          <Route
            path="/emergency"
            element={
              <ProtectedRoute>
                <EmergencyPage />
              </ProtectedRoute>
            }
          />

          {/* ✅ Face Verification Route (Public) */}
          <Route path="/face-verification" element={<FaceVerificationPage />} />

          {/* Redirect from old route */}
          <Route path="/explore" element={<Navigate to="/home" replace />} />

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <h2 style={{ textAlign: "center" }}>404 - Page Not Found</h2>
            }
          />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <Layout />
    </Router>
  </AuthProvider>
);

export default App;
