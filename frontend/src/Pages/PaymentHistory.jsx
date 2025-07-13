import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api.js";
import "./../Styles/PaymentHistory.css";

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPaymentHistory();
  }, [currentPage]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const result = await apiService.getPaymentHistory(currentPage, 10);
      
      if (result.success) {
        setPayments(result.data.payments);
        setTotalPages(result.data.totalPages);
      } else {
        setError(result.error || "Failed to load payment history");
      }
    } catch (error) {
      setError("Failed to load payment history");
      console.error("Payment history error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "status-paid";
      case "pending":
        return "status-pending";
      case "failed":
        return "status-failed";
      default:
        return "status-pending";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="payment-history-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history-page">
      <div className="history-header">
        <h2>Payment History</h2>
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {payments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💳</div>
          <h3>No payments yet</h3>
          <p>Your payment history will appear here once you make your first booking.</p>
          <button 
            className="browse-button"
            onClick={() => navigate("/home")}
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <>
          <div className="payments-grid">
            {payments.map((payment) => (
              <div key={payment._id} className="payment-card">
                <div className="payment-header">
                  <h3>{payment.property?.title || "Property"}</h3>
                  <span className={`status-badge ${getStatusColor(payment.status)}`}>
                    {payment.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="payment-details">
                  <div className="property-image">
                    <img 
                      src={payment.property?.propertyImage || "/placeholder-property.jpg"} 
                      alt={payment.property?.title || "Property"}
                    />
                  </div>
                  
                  <div className="payment-info">
                    <p><strong>Amount:</strong> ₹{payment.amount}</p>
                    <p><strong>Date:</strong> {formatDate(payment.createdAt)}</p>
                    {payment.paidAt && (
                      <p><strong>Paid:</strong> {formatDate(payment.paidAt)}</p>
                    )}
                    {payment.paymentMethod && (
                      <p><strong>Method:</strong> {payment.paymentMethod}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-button"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                className="page-button"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentHistory; 