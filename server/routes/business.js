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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("❌ Validation errors:", errors.array());
        return res.status(400).json({
          error: "שגיאה בנתונים",
          details: errors.array(),
        });
      }

      // ✅ תיקון: בדוק אם _id קיים ותפוס שגיאות
      if (!req.user?._id) {
        console.error("❌ req.user._id is missing!");
        console.error("req.user:", req.user);
        return res.status(400).json({ error: "שגיאה: לא נמצא מזהה משתמש" });
      }

      let ownerObjectId;
      try {
        ownerObjectId = new mongoose.Types.ObjectId(req.user._id);
        console.log("👤 Creating business for ownerId:", ownerObjectId);
      } catch (err) {
        console.error("❌ Failed to create ObjectId:", err);
        return res.status(400).json({ error: "מזהה משתמש לא תקין" });
      }

      // Check if business already exists
      const existingBusiness = await Business.findOne({
        ownerId: ownerObjectId,
      });
      if (existingBusiness) {
        console.log("❌ Business already exists for user:", ownerObjectId);
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
        businessId: business._id,
        business,
      });
    } catch (error) {
      console.error("❌ Business registration error:", error);
      console.error("❌ Error name:", error.name);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
      res.status(500).json({
        error: "שגיאה ביצירת עסק",
        details: error.message,
        errorName: error.name,
      });
    }
  }
);

// GET /api/business/my-business - Get business by owner
router.get("/my-business", authenticate, isBusiness, async (req, res) => {
  try {
    console.log("=== GET /my-business ===");
    console.log("req.user:", req.user);

    // ✅ תיקון: השתמש ב-_id מה-user object שחזר מהמסד נתונים
    if (!req.user?._id) {
      console.warn("❌ req.user._id לא קיים");
      return res.status(401).json({ error: "לא מחובר או טוקן לא תקין" });
    }

    // ✅ המרה ישירה ל-ObjectId
    let ownerObjectId;
    try {
      ownerObjectId = new mongoose.Types.ObjectId(req.user._id);
      console.log("🔍 Looking for business with ownerId:", ownerObjectId);
    } catch (err) {
      console.error("❌ Failed to create ObjectId:", err);
      return res.status(400).json({ error: "מזהה משתמש לא תקין" });
    }

    const business = await Business.findOne({ ownerId: ownerObjectId });
    console.log("business found:", business);

    if (!business) {
      console.warn("❌ עסק לא נמצא עבור ownerId:", ownerObjectId);
      return res.status(404).json({
        error: "עסק לא נמצא",
        debug: {
          searchedOwnerId: ownerObjectId.toString(),
          userId: req.user._id.toString(),
        },
      });
    }

    console.log("✅ העסק נשלף בהצלחה:", business.businessId);
    res.json({ success: true, business });
  } catch (error) {
    console.error("❌ Get business error:", error);
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: "ownerId לא תקין" });
    }
    res.status(500).json({
      error: "שגיאה בטעינת עסק",
      details: error.message,
    });
  }
});

// GET /api/business/:businessId - Get business by ID (public)
router.get("/:businessId", async (req, res) => {
  try {
    const business = await Business.findById(req.params.businessId);

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
      _id: req.params.businessId,
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
