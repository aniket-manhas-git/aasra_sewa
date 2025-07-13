import jwt from "jsonwebtoken";

const isAdminAuthenticated = (req, res, next) => {
  const token = req.cookies.adminToken || req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Admin authentication required", success: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Not an admin", success: false });
    }
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token", success: false });
  }
};

export default isAdminAuthenticated; 