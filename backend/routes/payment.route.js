import express from "express";
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  getPaymentHistory,
  webhookHandler,
} from "../controllers/payment.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Webhook endpoint (no auth required)
router.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);

// Protected routes (require user authentication)
router.use(isAuthenticated);

// Create payment intent
router.post("/create-intent", createPaymentIntent);

// Confirm payment
router.post("/confirm", confirmPayment);

// Get payment status
router.get("/status/:paymentId", getPaymentStatus);

// Get payment history
router.get("/history", getPaymentHistory);

export default router; 