import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  try {
    // Get token from HTTP-only cookie (primary method for production)
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }
    req.id = decoded.userId;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      message: "Authentication failed",
      success: false,
    });
  }
};

export default isAuthenticated;
