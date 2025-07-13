import express from "express";
console.log("[DEBUG] Loading user routes");
import {
  login,
  logout,
  register,
  updateUser,
  getProfile,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { authLimiter } from "../middlewares/security.js";
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(authLimiter, login);
router.get("/profile", isAuthenticated, getProfile);
router.put("/update", isAuthenticated, updateUser);
router.route("/logout").post(isAuthenticated, logout);

export default router;
