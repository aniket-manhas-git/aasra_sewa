import express from "express";
console.log("[DEBUG] Loading property routes");
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getAllPropertiesWithOptionalFilters,
  getMyProperties,
  registerProperty,
  updateMyProperty,
  getPropertyById,
  getApprovedProperties,
  getTopRatedProperties,
} from "../controllers/property.controller.js";
const router = express.Router();

router.get("/all", isAuthenticated, getAllPropertiesWithOptionalFilters);
router.get("/my", isAuthenticated, getMyProperties);
router.get("/approved", isAuthenticated, getApprovedProperties);
router.get("/top-rated", (req, res, next) => {
  console.log("[DEBUG] Top-rated route hit");
  next();
}, getTopRatedProperties); // Public endpoint - no authentication required
router.get("/:id", isAuthenticated, getPropertyById);
router.post("/register", isAuthenticated, registerProperty);
router.put("/update/:id", isAuthenticated, updateMyProperty);

export default router;
