import mongoose from "mongoose";
const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    landmark: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    fullAddress: { type: String, required: true, trim: true },
    pricePerNight: { type: Number, required: true, min: 0, max: 5000 },
    description: { type: String, required: true, maxlength: 500, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyImage: { type: String },
    images: {
      frontWall: { type: String, required: true, trim: true },
      backWall: { type: String, required: true, trim: true },
      leftWall: { type: String, required: true, trim: true },
      rightWall: { type: String, required: true, trim: true },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    healthReportPDF: { type: String },
    adminReview: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, maxlength: 500 },
      reviewedAt: { type: Date },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
    },
    isBooked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Property", propertySchema);
