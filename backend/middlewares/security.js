import helmet from "helmet";
import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV !== "production";
// General rate limiting for all API routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 100, // higher limit in dev, stricter in prod
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 500 : 50, // higher limit for dev, lower for prod
  message: "Too many authentication attempts, please try again later.",
});

// Security middleware setup
export const setupSecurity = (app) => {
  console.log("[DEBUG] Adding helmet middleware");
  app.use(helmet());

  console.log("[DEBUG] Adding rate limiting middleware");
  app.use("/api", generalLimiter);
};
