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
    body("name").trim().notEmpty().withMessage("שם העסק חובה"),
    body("description").trim().notEmpty().withMessage("תיאור חובה"),
    body("category").trim().notEmpty().withMessage("קטגוריה חובה"),
    body("address.street").trim().notEmpty().withMessage("רחוב חובה"),
    body("address.city").trim().notEmpty().withMessage("עיר חובה"),
    body("address.coordinates.lat")
      .isNumeric()
      .withMessage("קואורדינטות lat חובה"),
    body("address.coordinates.lng")
      .isNumeric()
      .withMessage("קואורדינטות lng חובה"),
    body("phone").trim().notEmpty().withMessage("טלפון חובה"),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("❌ Validation errors:", errors.array());
        return res.status(400).json({
          error: "שגיאה בנתונים",
          details: errors.array(),
        });
      }

      // Convert ownerId to ObjectId
      const ownerObjectId = new mongoose.Types.ObjectId(req.user.userId);

      // Check if business already exists for this owner
      const existingBusiness = await Business.findOne({
        ownerId: ownerObjectId,
      });

      if (existingBusiness) {
        console.log("❌ Business already exists for user:", req.user.userId);
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

      console.log("📝 Creating business with data:", {
        name,
        category,
        address,
        ownerId: ownerObjectId,
      });

      // ✅ Generate unique businessId on SERVER
      const businessId = `BIZ_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // ✅ Create business with correct structure
      const business = await Business.create({
        businessId,
        ownerId: ownerObjectId,
        name,
        description,
        category,
        address: {
          street: address.street,
          city: address.city,
          coordinates: {
            lat: address.coordinates.lat,
            lng: address.coordinates.lng,
          },
        },
        phone,
        email: email || req.user.email,
        image: image || "https://picsum.photos/400/300",
        tags: tags || [],
        openingHours: openingHours || {
          sunday: { open: "09:00", close: "18:00" },
          monday: { open: "09:00", close: "18:00" },
          tuesday: { open: "09:00", close: "18:00" },
          wednesday: { open: "09:00", close: "18:00" },
          thursday: { open: "09:00", close: "18:00" },
          friday: { open: "09:00", close: "14:00" },
          saturday: { open: "09:00", close: "18:00", closed: true },
        },
        rating: 0,
        totalReviews: 0,
        isActive: true,
      });

      console.log("✅ Business created successfully:", business.businessId);

      res.status(201).json({
        success: true,
        message: "עסק נוצר בהצלחה",
        businessId: business.businessId,
        business,
      });
    } catch (error) {
      console.error("❌ Business registration error:", error);
      res.status(500).json({
        error: "שגיאה ביצירת עסק",
        details: error.message,
      });
    }
  }
);

// GET /api/business/my-business - Get business by owner
router.get("/my-business", authenticate, isBusiness, async (req, res) => {
  try {
    const ownerObjectId = new mongoose.Types.ObjectId(req.user._id);

    const business = await Business.findOne({ ownerId: ownerObjectId });

    if (!business) {
      return res.status(404).json({ error: "עסק לא נמצא/my-business " });
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
      businessId: req.params.businessId,
      isActive: true,
    });

    if (!business) {
      return res.status(404).json({ error: "עסק לא נמצא /:businessId" });
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
      return res.status(404).json({ error: "עסק לא נמצא " });
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
      return res.status(404).json({ error: "/:businessId/statsעסק לא נמצא" });
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
