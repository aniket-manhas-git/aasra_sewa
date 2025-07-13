import express from "express";
import {
  adminRegister,
  adminLogin,
  updatePropertyStatus,
  getAllProperties,
  getPropertyByIdAdmin,
  downloadHealthReport,
  submitAdminReview,
  getAllUsers,
  getAllHosts,
  deleteProperty,
  getTopRatedProperties,
} from "../controllers/admin.controller.js";
import isAdminAuthenticated from "../middlewares/isAdminAuthenticated.js";

const router = express.Router();

// Admin registration
router.post("/register", adminRegister);
// Admin login
router.post("/login", adminLogin);

// Protect all routes below this middleware
router.use(isAdminAuthenticated);

// Get all users
router.get("/users", getAllUsers);
// Get all hosts
router.get("/hosts", getAllHosts);
// Get all properties
router.get("/properties", getAllProperties);
// Get property by ID (admin)
router.get("/property/:id", getPropertyByIdAdmin);
// Update property status (approve/reject/pending)
router.patch("/property/:id/status", updatePropertyStatus);
// Download health report for a property
router.get("/property/:id/health-report", downloadHealthReport);
// Submit admin review for a property
router.post("/property/:id/review", submitAdminReview);
// Delete property
router.delete("/property/:id", deleteProperty);
// Get top rated properties
router.get("/top-rated-properties", getTopRatedProperties);

export default router; 