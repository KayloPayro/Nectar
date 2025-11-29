// server/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authenticate user from JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "לא מחובר - נדרש טוקן" });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "nectar-secret-key"
    );

    console.log("🔐 Decoded JWT:", decoded);

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "משתמש לא נמצא" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "חשבון לא פעיל" });
    }

    // ✅ תיקון: ודא ש-_id קיים על req.user
    req.user = {
      _id: user._id,
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      type: user.type,
      phone: user.phone,
    };

    console.log("✅ Authenticated user:", req.user);
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "טוקן לא תקין" });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "טוקן פג תוקף" });
    }

    res.status(401).json({ error: "שגיאה באימות" });
  }
};

// Check if user is business
const isBusiness = (req, res, next) => {
  if (req.user.type !== "business") {
    return res.status(403).json({ error: "גישה מוגבלת לעסקים בלבד" });
  }
  next();
};

// Check if user is customer
const isCustomer = (req, res, next) => {
  if (req.user.type !== "customer") {
    return res.status(403).json({ error: "גישה מוגבלת ללקוחות בלבד" });
  }
  next();
};

module.exports = {
  authenticate,
  isBusiness,
  isCustomer,
};
