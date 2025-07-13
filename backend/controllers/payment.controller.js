import Payment from "../models/payment.model.js";
import Property from "../models/property.model.js";
import stripe from "stripe";
import mongoose from "mongoose";

// Initialize Stripe only if the secret key is available
const stripeInstance = process.env.STRIPE_SECRET_KEY 
  ? stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const createPaymentIntent = async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!stripeInstance) {
      return res.status(500).json({
        message: "Stripe is not configured. Please check your environment variables.",
        success: false,
      });
    }

    const { propertyId, amount} = req.body;
    const userId = req.userId; // From auth middleware

    if (!propertyId || !amount) {
      return res.status(400).json({
        message: "Property ID and amount are required",
        success: false,
      });
    }

    // Validate property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        message: "Property not found",
        success: false,
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amount * 100,
      metadata: {
        propertyId: propertyId,
        userId: userId,
      },
    });

    // Create payment record
    const payment = new Payment({
      user: userId,
      property: propertyId,
      amount: amount,
      stripeSessionId: paymentIntent.id,
      stripePaymentIntentId: paymentIntent.id,
      status: "pending",
    });

    await payment.save();

    res.status(200).json({
      message: "Payment intent created successfully",
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      success: true,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      message: "Error creating payment intent",
      success: false,
    });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { paymentId, paymentMethod } = req.body;
    const userId = req.userId;

    if (!paymentId) {
      return res.status(400).json({
        message: "Payment ID is required",
        success: false,
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
        success: false,
      });
    }

    if (payment.user.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized access to payment",
        success: false,
      });
    }

    // Update payment status
    payment.status = "paid";
    payment.paymentMethod = paymentMethod;
    payment.paidAt = new Date();
    await payment.save();

    // Update property booking status
    const property = await Property.findById(payment.property);
    if (property) {
      property.isBooked = true;
      await property.save();
    }

    res.status(200).json({
      message: "Payment confirmed successfully",
      payment: payment,
      success: true,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      message: "Error confirming payment",
      success: false,
    });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.userId;

    const payment = await Payment.findById(paymentId)
      .populate("property", "title propertyImage")
      .populate("user", "fullName email");

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
        success: false,
      });
    }

    if (payment.user._id.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized access to payment",
        success: false,
      });
    }

    res.status(200).json({
      payment: payment,
      success: true,
    });
  } catch (error) {
    console.error("Error getting payment status:", error);
    res.status(500).json({
      message: "Error getting payment status",
      success: false,
    });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ user: userId })
      .populate("property", "title propertyImage")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Payment.countDocuments({ user: userId });

    res.status(200).json({
      payments: payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      success: true,
    });
  } catch (error) {
    console.error("Error getting payment history:", error);
    res.status(500).json({
      message: "Error getting payment history",
      success: false,
    });
  }
};

export const webhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("PaymentIntent was successful:", paymentIntent.id);
      
      // Update payment status in database
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { 
          status: "paid", 
          paidAt: new Date() 
        }
      );
      break;
      
    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log("PaymentIntent failed:", failedPayment.id);
      
      // Update payment status in database
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: failedPayment.id },
        { status: "failed" }
      );
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}; 