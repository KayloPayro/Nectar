const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Benefit = require("../models/Benefit");
const Business = require("../models/Business");
const CustomerBenefit = require("../models/CustomerBenefit");
const RedemptionLog = require("../models/RedemptionLog");
const { authenticate, isBusiness, isCustomer } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

const IV_LENGTH = 16;

function getEncryptionKey() {
  if (process.env.ENCRYPTION_KEY) {
    const hash = crypto
      .createHash("sha256")
      .update(process.env.ENCRYPTION_KEY)
      .digest();
    return hash;
  }
  return crypto.randomBytes(32);
}

const ENCRYPTION_KEY = getEncryptionKey();

function encrypt(text) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("❌ Encryption error:", error.message);
    throw new Error("שגיאה בהצפנת נתונים");
  }
}

function decrypt(text) {
  try {
    const parts = text.split(":");
    const iv = Buffer.from(parts.shift(), "hex");
    const encryptedText = parts.join(":");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("❌ Decryption error:", error.message);
    throw new Error("שגיאה בפענוח נתונים");
  }
}

// ============================================
// Helper Functions
// ============================================
function generateDisplayCode(userName, benefitTitle) {
  const nameSlug = userName.toLowerCase().replace(/\s+/g, "_").substring(0, 10);
  const titleSlug = benefitTitle
    .toLowerCase()
    .replace(/\s+/g, "_")
    .substring(0, 10);
  const random = Math.random().toString(36).substring(2, 6);
  return `${nameSlug}_${titleSlug}_${random}`;
}

function calculatePeriodStart(period) {
  const now = new Date();
  switch (period) {
    case "day":
      return new Date(now.setHours(0, 0, 0, 0));
    case "week":
      const day = now.getDay();
      return new Date(now.setDate(now.getDate() - day));
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(0);
  }
}

// ============================================
// Routes
// ============================================

// POST /api/benefits/create - Create new benefit (Business only)
router.post(
  "/create",
  authenticate,
  isBusiness,
  [
    body("title").trim().notEmpty(),
    body("description").trim().notEmpty(),
    body("discount").trim().notEmpty(),
    body("validUntil").isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      console.log("for that user:", { ownerId: req.user._id });
      const business = await Business.findOne({ ownerId: req.user._id });
      if (!business) {
        return res.status(404).json({ error: "עסק לא נמצא" });
      }

      const {
        title,
        description,
        discount,
        validUntil,
        terms,
        maxUsage,
        rewardAmount,
        isActive,
      } = req.body;

      const benefit = await Benefit.create({
        businessId: business.businessId,
        title,
        description,
        discount,
        validUntil,
        terms: terms || "אין תנאים מיוחדים",
        maxUsage: maxUsage || {},
        rewardAmount: rewardAmount || 0,
        isActive: isActive !== undefined ? isActive : true,
      });

      res.status(201).json({
        success: true,
        benefitId: benefit.benefitId,
        benefit,
      });
    } catch (error) {
      console.error("Create benefit error:", error);
      res.status(500).json({ error: "שגיאה ביצירת הטבה" });
    }
  }
);

// GET /api/benefits/business/:businessId
router.get("/business/:businessId", async (req, res) => {
  try {
    const benefits = await Benefit.find({
      businessId: req.params.businessId,
      isActive: true,
      validUntil: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: benefits.length,
      benefits,
    });
  } catch (error) {
    console.error("Get benefits error:", error);
    res.status(500).json({ error: "שגיאה בטעינת הטבות" });
  }
});

// GET /api/benefits/my-benefits
router.get("/my-benefits", authenticate, isBusiness, async (req, res) => {
  try {
    const business = await Business.findOne({ ownerId: req.user._id });
    if (!business) {
      return res.status(404).json({ error: "עסק לא נמצא" });
    }

    const benefits = await Benefit.find({
      businessId: business.businessId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: benefits.length,
      benefits,
    });
  } catch (error) {
    console.error("Get my benefits error:", error);
    res.status(500).json({ error: "שגיאה בטעינת הטבות" });
  }
});

// PUT /api/benefits/:benefitId
router.put("/:benefitId", authenticate, isBusiness, async (req, res) => {
  try {
    const business = await Business.findOne({ ownerId: req.user._id });
    if (!business) {
      return res.status(404).json({ error: "עסק לא נמצא" });
    }

    const benefit = await Benefit.findOne({
      benefitId: req.params.benefitId,
      businessId: business.businessId,
    });

    if (!benefit) {
      return res.status(404).json({ error: "הטבה לא נמצאה" });
    }

    const allowedUpdates = [
      "title",
      "description",
      "discount",
      "validUntil",
      "terms",
      "isActive",
      "maxUsage",
      "rewardAmount",
    ];

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        benefit[key] = req.body[key];
      }
    });

    await benefit.save();
    res.json({ success: true, benefit });
  } catch (error) {
    console.error("Update benefit error:", error);
    res.status(500).json({ error: "שגיאה בעדכון הטבה" });
  }
});

// DELETE /api/benefits/:benefitId
router.delete("/:benefitId", authenticate, isBusiness, async (req, res) => {
  try {
    const business = await Business.findOne({ ownerId: req.user._id });
    if (!business) {
      return res.status(404).json({ error: "עסק לא נמצא" });
    }

    const benefit = await Benefit.findOneAndDelete({
      benefitId: req.params.benefitId,
      businessId: business.businessId,
    });

    if (!benefit) {
      return res.status(404).json({ error: "הטבה לא נמצאה" });
    }

    res.json({ success: true, message: "הטבה נמחקה בהצלחה" });
  } catch (error) {
    console.error("Delete benefit error:", error);
    res.status(500).json({ error: "שגיאה במחיקת הטבה" });
  }
});

// POST /api/benefits/redeem - Customer requests benefit code
router.post("/redeem", authenticate, isCustomer, async (req, res) => {
  try {
    const { benefitId, distributorId } = req.body;

    console.log("🔍 === REDEEM BENEFIT START ===");
    console.log("📦 Request body:", req.body);
    console.log("👤 Customer:", req.user.name, req.user._id);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "משתמש לא מזוהה" });
    }

    const benefit = await Benefit.findOne({ benefitId });
    if (!benefit) {
      return res.status(404).json({ error: "הטבה לא נמצאה" });
    }

    console.log("✅ Benefit found:", benefit.title);

    if (!benefit.isActive) {
      return res.status(400).json({ error: "הטבה לא פעילה" });
    }

    if (new Date() > benefit.validUntil) {
      return res.status(400).json({ error: "הטבה פגת תוקף" });
    }

    if (
      benefit.maxUsage?.total &&
      benefit.usageCount >= benefit.maxUsage.total
    ) {
      return res
        .status(400)
        .json({ error: "הטבה מלאה - הגיעה למגבלת השימושים" });
    }

    const customerId = mongoose.Types.ObjectId.isValid(req.user._id)
      ? req.user._id
      : new mongoose.Types.ObjectId(req.user._id);

    const customerUsage = await CustomerBenefit.countDocuments({
      customerId: customerId,
      benefitId: benefit.benefitId,
      status: "redeemed",
    });

    if (
      benefit.maxUsage?.perCustomer &&
      customerUsage >= benefit.maxUsage.perCustomer
    ) {
      return res.status(400).json({
        error: `כבר השתמשת בהטבה זו ${benefit.maxUsage.perCustomer} פעמים`,
      });
    }

    if (benefit.maxUsage?.perPeriod) {
      const periodStart = calculatePeriodStart(
        benefit.maxUsage.perPeriod.period
      );
      const periodUsage = await CustomerBenefit.countDocuments({
        customerId: customerId,
        benefitId: benefit.benefitId,
        status: "redeemed",
        redeemedAt: { $gte: periodStart },
      });

      if (periodUsage >= benefit.maxUsage.perPeriod.times) {
        return res.status(400).json({
          error: `הגעת למגבלת ${benefit.maxUsage.perPeriod.times} שימושים ל${benefit.maxUsage.perPeriod.period}`,
        });
      }
    }

    const userName = req.user.name || req.user.email || "user";
    const displayCode = generateDisplayCode(userName, benefit.title);

    console.log("🔐 Encrypting QR data...");
    const qrPayload = JSON.stringify({
      businessId: benefit.businessId,
      benefitId: benefit.benefitId,
      customerId: customerId.toString(),
      timestamp: Date.now(),
    });

    const qrData = encrypt(qrPayload);
    console.log("✅ QR data encrypted successfully");

    console.log("💾 Creating CustomerBenefit...");
    const customerBenefit = await CustomerBenefit.create({
      customerId: customerId,
      businessId: benefit.businessId,
      benefitId: benefit.benefitId,
      displayCode,
      qrData,
      expiresAt: benefit.validUntil,
    });

    console.log(
      "✅ CustomerBenefit created:",
      customerBenefit.customerBenefitCode
    );
    console.log("🔍 === REDEEM BENEFIT END ===");

    res.status(201).json({
      success: true,
      customerBenefitCode: customerBenefit.customerBenefitCode,
      displayCode: customerBenefit.displayCode,
      qrData: customerBenefit.qrData,
      benefit: {
        title: benefit.title,
        discount: benefit.discount,
        validUntil: benefit.validUntil,
      },
    });
  } catch (error) {
    console.error("❌ REDEEM ERROR:", error.name, "-", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "שגיאת ולידציה",
        details: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({ error: "קוד כבר קיים במערכת" });
    }

    res.status(500).json({
      error: "שגיאה ביצירת קוד",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// POST /api/benefits/validate
router.post("/validate", authenticate, isBusiness, async (req, res) => {
  try {
    const { qrData } = req.body;

    let payload;
    try {
      const decryptedData = decrypt(qrData);
      payload = JSON.parse(decryptedData);
    } catch (error) {
      return res.status(400).json({ error: "QR לא תקין" });
    }

    const { businessId, benefitId, customerId } = payload;

    const staffBusiness = await Business.findOne({ ownerId: req.user._id });
    if (!staffBusiness) {
      return res.status(403).json({ error: "עובד לא משוייך לעסק" });
    }

    if (businessId !== staffBusiness.businessId) {
      await RedemptionLog.create({
        customerBenefitCode: "INVALID",
        customerId,
        businessId,
        benefitId,
        redeemedBy: req.user._id,
        status: "failed",
        failureReason: "הקוד שייך לעסק אחר",
      });

      return res.status(403).json({
        error: "קוד זה שייך לעסק אחר ולא ניתן לממש כאן",
      });
    }

    const customerBenefit = await CustomerBenefit.findOne({
      customerId,
      benefitId,
      businessId,
    });

    if (!customerBenefit) {
      return res.status(404).json({ error: "קוד לא נמצא במערכת" });
    }

    if (customerBenefit.status === "redeemed") {
      return res.status(400).json({
        error: "הטבה זו כבר מומשה",
        redeemedAt: customerBenefit.redeemedAt,
      });
    }

    if (customerBenefit.isExpired()) {
      customerBenefit.status = "expired";
      await customerBenefit.save();
      return res.status(400).json({ error: "הקוד פג תוקף" });
    }

    const benefit = await Benefit.findOne({ benefitId });
    if (!benefit) {
      return res.status(404).json({ error: "הטבה לא נמצאה" });
    }

    customerBenefit.status = "redeemed";
    customerBenefit.redeemedAt = new Date();
    customerBenefit.redeemedBy = req.user._id;
    await customerBenefit.save();

    benefit.usageCount += 1;
    await benefit.save();

    await RedemptionLog.create({
      customerBenefitCode: customerBenefit.customerBenefitCode,
      customerId,
      businessId,
      benefitId,
      redeemedBy: req.user._id,
      rewardAmount: benefit.rewardAmount,
      status: "success",
    });

    res.json({
      success: true,
      message: "הטבה מומשה בהצלחה! 🎉",
      benefit: {
        title: benefit.title,
        discount: benefit.discount,
      },
      customer: {
        id: customerId,
      },
      redeemedAt: customerBenefit.redeemedAt,
    });
  } catch (error) {
    console.error("Validate benefit error:", error);
    res.status(500).json({ error: "שגיאה באימות קוד" });
  }
});

router.get("/my-codes", authenticate, isCustomer, async (req, res) => {
  try {
    const codes = await CustomerBenefit.find({
      customerId: req.user._id,
    }).sort({ createdAt: -1 });

    // Manually fetch related benefits and businesses
    const enrichedCodes = await Promise.all(
      codes.map(async (code) => {
        const benefit = await Benefit.findOne({
          benefitId: code.benefitId,
        });
        const business = await Business.findOne({
          businessId: code.businessId,
        });

        return {
          ...code.toObject(),
          benefit,
          business,
        };
      })
    );

    res.json({
      success: true,
      count: enrichedCodes.length,
      codes: enrichedCodes,
    });
  } catch (error) {
    console.error("Get codes error:", error);
    res.status(500).json({ error: "שגיאה בטעינת קודים" });
  }
});

module.exports = router;
