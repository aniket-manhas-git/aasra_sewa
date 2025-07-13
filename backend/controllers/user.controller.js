import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Basic email validation regex
const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

// Valid blood groups
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// Valid genders
const GENDERS = ["Male", "Female", "Other"];

// Strong password validation regex
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Register a user
export const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      age,
      bloodGroup,
      address,
      aadhaarImage,
      gender,
      face,
    } = req.body;

    // Individual field checks for better UX
    if (!fullName)
      return res
        .status(400)
        .json({ message: "Full name is required", success: false });
    if (!email)
      return res
        .status(400)
        .json({ message: "Email is required", success: false });
    if (!password)
      return res
        .status(400)
        .json({ message: "Password is required", success: false });
    if (!phone)
      return res
        .status(400)
        .json({ message: "Phone number is required", success: false });
    if (!age)
      return res
        .status(400)
        .json({ message: "Age is required", success: false });
    if (!bloodGroup)
      return res
        .status(400)
        .json({ message: "Blood group is required", success: false });
    if (!address)
      return res
        .status(400)
        .json({ message: "Address is required", success: false });
    if (!aadhaarImage)
      return res
        .status(400)
        .json({ message: "Aadhaar image is required", success: false });
    if (!gender)
      return res
        .status(400)
        .json({ message: "Gender is required", success: false });
    if (!face)
      return res
        .status(400)
        .json({ message: "Face image is required", success: false });

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ message: "Invalid email format", success: false });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.",
        success: false,
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
        success: false,
      });
    }

    if (age < 18) {
      return res
        .status(400)
        .json({ message: "Age must be 18 or above", success: false });
    }

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return res
        .status(400)
        .json({ message: "Invalid blood group", success: false });
    }

    if (!GENDERS.includes(gender)) {
      return res
        .status(400)
        .json({ message: "Invalid gender value", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already registered", success: false });
    }

    const newUser = await User.create({
      fullName,
      email,
      password,
      phone,
      age,
      bloodGroup,
      address,
      aadhaarImage,
      gender,
      face,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error in register:", error);
    // Handle duplicate email unique error gracefully
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res
        .status(400)
        .json({ message: "Email already registered", success: false });
    }
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User does not exist, please register first",
        success: false,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email or password", success: false });
    }

    const tokenData = { userId: user._id, email: user.email };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: process.env.EXPIRE_IN?.replace(/['"]+/g, "") || "1d",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "strict",
      })
      .status(200)
      .json({
        message: "Login successful",
        success: true,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          age: user.age,
          bloodGroup: user.bloodGroup,
          gender: user.gender,
          address: user.address,
        },
      });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.log("Error in logout", error);
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const userId = req.id;
    const updates = req.body;

    const forbiddenFields = ["password", "email", "_id", "isHost"];
    for (const key of Object.keys(updates)) {
      if (forbiddenFields.includes(key)) {
        return res.status(400).json({
          message: `You are not allowed to update '${key}' field.`,
          success: false,
        });
      }
    }

    if (updates.bloodGroup && !BLOOD_GROUPS.includes(updates.bloodGroup)) {
      return res
        .status(400)
        .json({ message: "Invalid blood group", success: false });
    }

    if (updates.gender && !GENDERS.includes(updates.gender)) {
      return res
        .status(400)
        .json({ message: "Invalid gender value", success: false });
    }

    if (updates.phone && !/^\d{10}$/.test(updates.phone)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
        success: false,
      });
    }

    if (updates.age && updates.age < 18) {
      return res
        .status(400)
        .json({ message: "Age must be 18 or above", success: false });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
      success: true,
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    return res
      .status(200)
      .json({ message: "Profile retrieved successfully", user, success: true });
  } catch (error) {
    console.error("Error in getProfile:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
