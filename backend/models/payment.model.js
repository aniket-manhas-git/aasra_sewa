import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    stripeSessionId: {
      type: String,
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Payment", paymentSchema); 