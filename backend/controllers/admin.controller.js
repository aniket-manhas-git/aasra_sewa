import Admin from "../models/admin.model.js";
import Property from "../models/property.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import axios from "axios";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required", success: false });

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res
        .status(404)
        .json({ message: "Admin not found", success: false });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "Invalid credentials", success: false });

    const token = jwt.sign(
      { adminId: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Login successful", success: true });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const updatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Backend: Property ID:', id);
    console.log('Backend: Request method:', req.method);
    console.log('Backend: Request body:', req.body);
    console.log('Backend: Request query:', req.query);
    
    // Handle both query parameters and request body
    const { action, rating, comment } = req.method === 'PATCH' ? req.body : req.query;
    console.log('Backend: Extracted data - action:', action, 'rating:', rating, 'comment:', comment);

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ message: "Invalid property ID", success: false });

    const property = await Property.findById(id);
    if (!property)
      return res
        .status(404)
        .json({ message: "Property not found", success: false });

    if (!["approved", "rejected", "pending"].includes(action))
      return res
        .status(400)
        .json({ message: "Invalid action", success: false });

    // For approval, require rating and comment
    if (action === "approved") {
      console.log('Backend: Processing approval with rating:', rating, 'comment:', comment);
      if (!rating || !comment) {
        console.log('Backend: Missing rating or comment');
        return res
          .status(400)
          .json({ 
            message: "Rating and comment are required when approving a property", 
            success: false 
          });
      }

      const ratingNum = Number(rating);
      if (ratingNum < 1 || ratingNum > 5) {
        console.log('Backend: Invalid rating:', ratingNum);
        return res
          .status(400)
          .json({ 
            message: "Rating must be between 1 and 5", 
            success: false 
          });
      }

      property.adminReview = {
        rating: ratingNum,
        comment: comment,
        reviewedAt: new Date(),
        reviewedBy: req.adminId,
      };
      console.log('Backend: Set admin review:', property.adminReview);
    }

    property.status = action;
    console.log('Backend: Setting property status to:', action);

    await property.save();
    console.log('Backend: Property saved successfully');

    // Update isHost status for the user if property is approved or unapproved
    if (action === "approved" || action === "rejected" || action === "pending") {
      const userId = property.createdBy;
      // Count approved properties for this user
      const approvedCount = await Property.countDocuments({ createdBy: userId, status: "approved" });
      await User.findByIdAndUpdate(userId, { isHost: approvedCount > 0 });
      console.log('Backend: Updated user host status');
    }

    res.status(200).json({
      message: `Property ${action} successfully`,
      property,
      success: true,
    });
  } catch (error) {
    console.error("Backend: Error updating status:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllProperties = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filters = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filters.status = status;
    }

    const properties = await Property.find(filters)
      .populate("createdBy", "fullName email phone address gender age")
      .sort({ createdAt: -1 });

    return res.status(200).json({ properties, success: true });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getPropertyByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ message: "Invalid property ID", success: false });

    const property = await Property.findById(id)
      .populate("createdBy", "fullName email phone address gender age")
      .select("-__v");

    if (!property)
      return res
        .status(404)
        .json({ message: "Property not found", success: false });

    return res.status(200).json({ property, success: true });
  } catch (error) {
    console.error("Error fetching property by ID:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const downloadHealthReport = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);
    if (!property || !property.healthReportPDF) {
      return res
        .status(404)
        .json({ message: "Health report not available", success: false });
    }

    const pdfUrl = property.healthReportPDF;
    const fileName = `property_${id}_health_report.pdf`;

    const response = await axios({
      url: pdfUrl,
      method: "GET",
      responseType: "stream",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    response.data.pipe(res);
  } catch (error) {
    console.error("Error streaming health report:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const submitAdminReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const adminId = req.adminId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.adminReview = {
      rating,
      comment: comment || "",
      reviewedAt: new Date(),
      reviewedBy: adminId,
    };

    await property.save();

    res.status(200).json({
      message: "Admin review submitted successfully",
      review: property.adminReview,
      success: true,
    });
  } catch (error) {
    console.error("Error submitting admin review:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const adminRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists", success: false });
    }
    const newAdmin = new Admin({ username, email, password });
    await newAdmin.save();
    return res.status(201).json({ message: "Admin registered successfully", success: true });
  } catch (error) {
    console.error("Admin registration error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    return res.status(200).json({ users, success: true });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllHosts = async (req, res) => {
  try {
    const hosts = await User.find({ isHost: true }, "-password");
    return res.status(200).json({ hosts, success: true });
  } catch (error) {
    console.error("Error fetching hosts:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ message: "Invalid property ID", success: false });

    const property = await Property.findById(id);
    if (!property)
      return res
        .status(404)
        .json({ message: "Property not found", success: false });

    // Delete the property
    await Property.findByIdAndDelete(id);

    // Update isHost status for the user if this was their only approved property
    const userId = property.createdBy;
    const approvedCount = await Property.countDocuments({ createdBy: userId, status: "approved" });
    await User.findByIdAndUpdate(userId, { isHost: approvedCount > 0 });

    res.status(200).json({
      message: "Property deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getTopRatedProperties = async (req, res) => {
  try {
    const topProperties = await Property.find({ 
      status: "approved",
      "adminReview.rating": { $exists: true, $ne: null }
    })
    .populate("createdBy", "fullName email phone address gender age")
    .sort({ "adminReview.rating": -1, createdAt: -1 })
    .limit(3);

    return res.status(200).json({ 
      properties: topProperties, 
      success: true 
    });
  } catch (error) {
    console.error("Error fetching top rated properties:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
