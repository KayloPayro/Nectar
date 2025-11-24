// server/routes/business.js
const express = require("express");
const Business = require("../models/Business");
const Benefit = require("../models/Benefit");
const { authenticate, isBusiness } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

const router = express.Router();

// POST /api/business/register - Register new business
router.post(
  "/register",
  authenticate,
  isBusiness,
  [
    body("name").trim().notEmpty(),
    body("description").trim().notEmpty(),
    body("category").trim().notEmpty(),
    body("address.street").trim().notEmpty(),
    body("address.city").trim().notEmpty(),
    body("phone").trim().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Convert ownerId to ObjectId
      const ownerObjectId = new mongoose.Types.ObjectId(req.user._id);

      // Check if business already exists for this owner
      const existingBusiness = await Business.findOne({
        ownerId: ownerObjectId,
      });

      if (existingBusiness) {
        return res.status(400).json({ error: "כבר קיים עסק עבור משתמש זה" });
      }

      const {
        name,
        description,
        category,
        address,
        phone,
        email,
        image,
        tags,
        openingHours,
      } = req.body;

      const business = await Business.create({
        ownerId: ownerObjectId,
        name,
        description,
        category,
        address,
        phone,
        email: email || req.user.email,
        image: image || "https://picsum.photos/400/300",
        tags: tags || [],
        openingHours: openingHours || {},
      });

      res.status(201).json({
        success: true,
        businessId: business.businessId,
        business,
      });
    } catch (error) {
      console.error("Business registration error:", error);
      res.status(500).json({ error: "שגיאה ביצירת עסק" });
    }
  }
);

// GET /api/business/my-business - Get business by owner
router.get("/my-business", authenticate, isBusiness, async (req, res) => {
  console.log("DEBUG: user id in route:", req.user._id);
  try {
    const ownerObjectId = new mongoose.Types.ObjectId(req.user._id);

    const business = await Business.findOne({ ownerId: ownerObjectId });

    if (!business) {
      return res.status(404).json({ error: "עסק לא נמצא" });
    }

    res.json({ success: true, business });
  } catch (error) {
    console.error("Get business error:", error);
    res.status(500).json({ error: "שגיאה בטעינת עסק" });
  }
});

// GET /api/business/:businessId - Get business by ID (public)
router.get("/:businessId", async (req, res) => {
  try {
    const business = await Business.findOne({
      ownerId: req.params.businessId,
      isActive: true,
    });

    if (!business) {
      return res.status(404).json({ error: "עסק לא נמצא" });
    }

    res.json({ success: true, business });
  } catch (error) {
    console.error("Get business error:", error);
    res.status(500).json({ error: "שגיאה בטעינת עסק" });
  }
});

// GET /api/business - Get all businesses (public)
router.get("/", async (req, res) => {
  try {
    const {
      category,
      search,
      lat,
      lng,
      radius = 10000,
      limit = 50,
      skip = 0,
    } = req.query;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    let businesses = await Business.find(query)
      .sort({ rating: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);

      businesses = businesses.filter((business) => {
        if (
          !business.address?.coordinates?.lat ||
          !business.address?.coordinates?.lng
        ) {
          return false;
        }

        const distance = calculateDistance(
          userLat,
          userLng,
          business.address.coordinates.lat,
          business.address.coordinates.lng
        );

        return distance <= maxRadius;
      });
    }

    res.json({
      success: true,
      count: businesses.length,
      businesses,
    });
  } catch (error) {
    console.error("Get businesses error:", error);
    res.status(500).json({ error: "שגיאה בטעינת עסקים" });
  }
});

// PUT /api/business/:businessId - Update business
router.put("/:businessId", authenticate, isBusiness, async (req, res) => {
  try {
    const ownerObjectId = new mongoose.Types.ObjectId(req.user._id);

    const business = await Business.findOne({
      businessId: req.params.businessId,
      ownerId: ownerObjectId,
    });

    if (!business) {
      return res.status(404).json({ error: "עסק לא נמצא" });
    }

    const allowedUpdates = [
      "name",
      "description",
      "address",
      "phone",
      "email",
      "image",
      "tags",
      "openingHours",
    ];

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        business[key] = req.body[key];
      }
    });

    await business.save();

    res.json({
      success: true,
      business,
    });
  } catch (error) {
    console.error("Update business error:", error);
    res.status(500).json({ error: "שגיאה בעדכון עסק" });
  }
});

// GET /api/business/:businessId/stats - Get business statistics
router.get("/:businessId/stats", authenticate, isBusiness, async (req, res) => {
  try {
    const ownerObjectId = new mongoose.Types.ObjectId(req.user._id);

    const business = await Business.findOne({
      businessId: req.params.businessId,
      ownerId: ownerObjectId,
    });

    if (!business) {
      return res.status(404).json({ error: "עסק לא נמצא" });
    }

    const benefits = await Benefit.find({ businessId: business.businessId });

    const stats = {
      totalBenefits: benefits.length,
      activeBenefits: benefits.filter((b) => b.isActive).length,
      totalUsage: benefits.reduce((sum, b) => sum + b.usageCount, 0),
      rating: business.rating,
      totalReviews: business.totalReviews,
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "שגיאה בטעינת סטטיסטיקות" });
  }
});

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

module.exports = router;
