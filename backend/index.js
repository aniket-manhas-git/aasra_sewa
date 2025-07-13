import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectDb.js";
import userRoutes from "./routes/user.route.js";
import propertyRoutes from "./routes/property.route.js";
import reportRoute from "./routes/report.js";
import faceVerifyRoutes from "./routes/faceVerify.js";
import adminRoutes from "./routes/admin.route.js";
import paymentRoutes from "./routes/payment.route.js";
import { setupSecurity, authLimiter } from "./middlewares/security.js";
import { setupCORS } from "./middlewares/cors.js";
import { setupErrorHandlers } from "./middlewares/errorHandlers.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

console.log("[DEBUG] Starting server setup");

setupSecurity(app);
setupCORS(app);
console.log("[DEBUG] Adding basic middleware");
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

console.log("[DEBUG] Registering routes");
app.use("/api/v1/user", authLimiter, userRoutes);
app.use("/api/v1/property", propertyRoutes);
app.use("/api/v1/report", reportRoute);
app.use("/api/face", faceVerifyRoutes); // ✅ This is the face verification route
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/payment", paymentRoutes);
console.log("[DEBUG] Routes registered");

setupErrorHandlers(app);

console.log("[DEBUG] Connecting to MongoDB");
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `✅ Server is running on port ${PORT} in ${
          process.env.NODE_ENV || "development"
        } mode`
      );
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB", err);
    process.exit(1);
  });
