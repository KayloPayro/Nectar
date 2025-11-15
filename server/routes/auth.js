// server/routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "nectar-secret-key", {
    expiresIn: "30d",
  });
};

// POST /api/auth/register - Register new user
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("name").trim().notEmpty(),
    body("type").isIn(["customer", "business"]),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, type, phone } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "המשתמש כבר קיים" });
      }

      // Create user
      const user = await User.create({
        email,
        password,
        name,
        type,
        phone,
      });

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          type: user.type,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "שגיאה ביצירת חשבון" });
    }
  }
);

// POST /api/auth/login - Login user
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "אימייל או סיסמה שגויים" });
      }

      // Check if active
      if (!user.isActive) {
        return res.status(403).json({ error: "החשבון לא פעיל" });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "אימייל או סיסמה שגויים" });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          type: user.type,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "שגיאה בהתחברות" });
    }
  }
);

// GET /api/auth/me - Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "לא מחובר" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "nectar-secret-key"
    );
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "משתמש לא נמצא" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        type: user.type,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({ error: "טוקן לא תקין" });
  }
});

// POST /api/auth/reset-password - Reset password (send email in production)
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "משתמש לא נמצא" });
    }

    // In production: Send email with reset link
    // For now, just confirm
    res.json({
      success: true,
      message: "קישור לאיפוס סיסמה נשלח למייל",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "שגיאה בשליחת קישור" });
  }
});

module.exports = router;
