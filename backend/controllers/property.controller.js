import Property from "../models/property.model.js";
import mongoose from "mongoose";

// ========================
// Register New Property
// ========================
export const registerProperty = async (req, res) => {
  try {
    const {
      title,
      landmark,
      pincode,
      fullAddress,
      pricePerNight,
      description,
      capacity,
      images,
      propertyImage,
      healthReportPDF, // Add this field
    } = req.body;

    const createdBy = req.id;

    // Validate required fields
    if (
      !title ||
      !landmark ||
      !pincode ||
      !fullAddress ||
      !pricePerNight ||
      !description ||
      !capacity ||
      !images?.frontWall ||
      !images?.backWall ||
      !images?.leftWall ||
      !images?.rightWall
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }

    const newProperty = new Property({
      title,
      landmark,
      pincode,
      fullAddress,
      pricePerNight: Number(pricePerNight),
      description,
      capacity: Number(capacity),
      createdBy,
      images,
      propertyImage,
      healthReportPDF, // Include the PDF URL if provided
    });

    const savedProperty = await newProperty.save();

    res.status(201).json({
      message: "Property registered successfully.",
      property: savedProperty,
    });
  } catch (error) {
    console.error("Error registering property:", error);
    if (error.name === 'ValidationError') {
      // Custom message for pricePerNight max validation
      if (error.errors && error.errors.pricePerNight && error.errors.pricePerNight.kind === 'max') {
        return res.status(400).json({ message: "Price per night cannot exceed ₹5000." });
      }
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Server error while registering property." });
  }
};

// ========================
// Get All Properties
// ========================
export const getAllPropertiesWithOptionalFilters = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      minCost,
      maxCost,
      members,
      sort = "asc",
      status, // <-- allow status filter
    } = req.query;

    const filters = {};
    const shouldFilter = minCost || maxCost || members;

    if (shouldFilter) {
      filters.status = "approved";
      filters.isBooked = false;

      if (minCost || maxCost) {
        filters.pricePerNight = {};
        if (minCost) filters.pricePerNight.$gte = Number(minCost);
        if (maxCost) filters.pricePerNight.$lte = Number(maxCost);
      }

      if (members) {
        filters.capacity = { $gte: Number(members) };
      }
    }

    // Allow admin to filter by status (pending/approved)
    if (status) {
      filters.status = status;
    }

    const sortOption = sort === "desc" ? -1 : 1;

    const total = await Property.countDocuments(filters);

    const properties = await Property.find(filters)
      .populate("createdBy", "fullName email phone age address gender")
      .sort({ pricePerNight: sortOption })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      properties,
    });
  } catch (error) {
    console.error("Error in getAllPropertiesWithOptionalFilters:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching properties." });
  }
};

// ========================
// Get Properties By Logged-in User
// ========================
export const getMyProperties = async (req, res) => {
  try {
    if (!req.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User info missing" });
    }

    const userId = req.id;

    const properties = await Property.find({ createdBy: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      total: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Error in getMyProperties:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching your properties." });
  }
};

// ========================
// Update Property
// ========================
export const updateMyProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid property ID." });
    }

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    if (property.createdBy.toString() !== req.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this property." });
    }

    const allowedUpdates = [
      "title",
      "landmark",
      "pincode",
      "fullAddress",
      "pricePerNight",
      "description",
      "capacity",
      "images",
      "propertyImage",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    if (property.status === "approved") {
      property.status = "pending";
    }

    const updatedProperty = await property.save();

    res.status(200).json({
      message: "Property updated successfully.",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Server error while updating property." });
  }
};

// ========================
// Get Property By ID
// ========================
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid property ID." });
    }

    const property = await Property.findById(id)
      .populate("createdBy", "fullName email phone")
      .select("-__v");

    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    res.status(200).json({
      message: "Property retrieved successfully.",
      property,
    });
  } catch (error) {
    console.error("Error getting property:", error);
    res.status(500).json({ message: "Server error while getting property." });
  }
};

// ========================
// Get All Approved Properties
// ========================
export const getApprovedProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      minCost,
      maxCost,
      members,
      sort = "asc",
    } = req.query;

    const filters = { status: "approved" };

    if (minCost || maxCost) {
      filters.pricePerNight = {};
      if (minCost) filters.pricePerNight.$gte = Number(minCost);
      if (maxCost) filters.pricePerNight.$lte = Number(maxCost);
    }
    if (members) {
      filters.capacity = { $gte: Number(members) };
    }

    const sortOption = sort === "desc" ? -1 : 1;

    const total = await Property.countDocuments(filters);
    const properties = await Property.find(filters)
      .sort({ pricePerNight: sortOption })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      properties,
    });
  } catch (error) {
    console.error("Error in getApprovedProperties:", error);
    res.status(500).json({ message: "Server error while fetching approved properties." });
  }
};

export const getTopRatedProperties = async (req, res) => {
  try {
    console.log('Backend: Getting top rated properties');
    
    const properties = await Property.find({ 
      status: "approved",
      "adminReview.rating": { $exists: true, $ne: null }
    })
    .populate('createdBy', 'name email')
    .sort({ "adminReview.rating": -1 })
    .limit(3);
    
    console.log('Backend: Found properties:', properties.length);
    console.log('Backend: Properties with ratings:', properties.map(p => ({
      id: p._id,
      rating: p.adminReview?.rating,
      comment: p.adminReview?.comment
    })));

    res.status(200).json({
      success: true,
      properties: properties,
    });
  } catch (error) {
    console.error('Backend: Error getting top rated properties:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching top rated properties",
    });
  }
};
