// pages/Payment.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import apiService from "../services/api.js";
import "./../Styles/Payment.css";

// Load Stripe (replace with your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY );
console.log(stripePromise);
// Payment Form Component
const PaymentForm = ({ property, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create payment intent
      const intentResult = await apiService.createPaymentIntent(
        property._id,
        property.pricePerNight,
        "inr"
      );

      if (!intentResult.success) {
        throw new Error(intentResult.error);
      }

      const { clientSecret, paymentId } = intentResult.data;

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === "succeeded") {
        // Confirm payment with backend
        const confirmResult = await apiService.confirmPayment(
          paymentId,
          "card"
        );

        if (confirmResult.success) {
          onPaymentSuccess(confirmResult.data.payment);
        } else {
          throw new Error(confirmResult.error);
        }
      } else {
        throw new Error("Payment failed");
      }
    } catch (err) {
      setError(err.message);
      onPaymentError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-row">
        <CardElement options={cardElementOptions} />
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <button 
        type="submit" 
        disabled={!stripe || loading}
        className="pay-button"
      >
        {loading ? "Processing..." : `Book Property - ₹${property.pricePerNight}`}
      </button>
    </form>
  );
};

// Main Payment Component
const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Get property details from backend
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const result = await apiService.getPropertyById(id);
        
        if (result.success) {
          setProperty(result.data.property);
          // Console log the property address
          console.log("Payment Page - Property Address:", result.data.property.fullAddress);
          console.log("Payment Page - Property Location:", result.data.property.landmark);
          console.log("Payment Page - Property Details:", {
            title: result.data.property.title,
            address: result.data.property.fullAddress,
            location: result.data.property.landmark,
            pincode: result.data.property.pincode,
            price: result.data.property.pricePerNight
          });
        } else {
          setError(result.error || "Property not found");
        }
      } catch (error) {
        setError("Failed to load property details");
        console.error("Property fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    } else {
      // Fallback to state if no ID in URL
      const { property: stateProperty } = location.state || {};
      if (stateProperty) {
        setProperty(stateProperty);
        setLoading(false);
        // Console log the property address from state
        console.log("Payment Page (State) - Property Address:", stateProperty.fullAddress);
        console.log("Payment Page (State) - Property Location:", stateProperty.landmark);
      } else {
        setError("No property selected for payment");
        setLoading(false);
      }
    }
  }, [id, location.state]);

  const handlePaymentSuccess = (payment) => {
    setPaymentSuccess(true);
    
    // Console log the property address on payment success
    console.log("🎉 PAYMENT SUCCESS - Property Address:", property.fullAddress);
    console.log("🎉 PAYMENT SUCCESS - Property Location:", property.landmark);
    console.log("🎉 PAYMENT SUCCESS - Property Details:", {
      title: property.title,
      address: property.fullAddress,
      location: property.landmark,
      pincode: property.pincode,
      price: property.pricePerNight,
      paymentId: payment._id
    });
    
    setTimeout(() => {
      navigate("/home", {
        state: {
          mapLocation: {
            area: property.landmark || "Unknown Area",
            city: property.fullAddress || "Unknown City",
            pincode: property.pincode || "000000"
          }
        }
      });
    }, 2000);
  };

  const handlePaymentError = (errorMessage) => {
    console.error("Payment error:", errorMessage);
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="payment-page">
        <h2 style={{ textAlign: "center" }}>No property selected for payment.</h2>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="payment-page">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2>Booking Confirmed!</h2>
          <p>Your property has been successfully booked.</p>
          <p>Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <h2>Confirm Your Booking</h2>
      
      <div className="payment-container">
        <div className="property-summary">
          <img src={property.propertyImage} alt={property.title} />
          <div className="property-details">
            <h3>{property.title}</h3>
            <p><strong>Location:</strong> {property.landmark}</p>
            <p><strong>Address:</strong> {property.fullAddress}</p>
            <p><strong>Price per night:</strong> ₹{property.pricePerNight}</p>
            <p><strong>Capacity:</strong> {property.capacity} people</p>
          </div>
        </div>

        <div className="payment-section">
          <h3>Payment Details</h3>
          <Elements stripe={stripePromise}>
            <PaymentForm 
              property={property}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default Payment;
