// server/routes/customer.js
const express = require("express");
const CustomerAddress = require("../models/CustomerAddress");
const Favorite = require("../models/Favorite");
const { authenticate, isCustomer } = require("../middleware/auth");

const router = express.Router();

// ==========================================
// ADDRESSES
// ==========================================

// GET /api/customer/addresses - Get all addresses
router.get("/addresses", authenticate, isCustomer, async (req, res) => {
  try {
    const addresses = await CustomerAddress.find({
      customerId: req.user._id,
    }).sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ error: "שגיאה בטעינת כתובות" });
  }
});

// POST /api/customer/addresses - Add new address
router.post("/addresses", authenticate, isCustomer, async (req, res) => {
  try {
    const { label, street, city, coordinates, isDefault } = req.body;

    // If this is set as default, remove default from others
    if (isDefault) {
      await CustomerAddress.updateMany(
        { customerId: req.user._id },
        { isDefault: false }
      );
    }

    const address = await CustomerAddress.create({
      customerId: req.user._id,
      label,
      street,
      city,
      coordinates,
      isDefault: isDefault || false,
    });

    res.status(201).json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ error: "שגיאה בהוספת כתובת" });
  }
});

// PUT /api/customer/addresses/:addressId - Update address
router.put(
  "/addresses/:addressId",
  authenticate,
  isCustomer,
  async (req, res) => {
    try {
      const address = await CustomerAddress.findOne({
        _id: req.params.addressId,
        customerId: req.user._id,
      });

      if (!address) {
        return res.status(404).json({ error: "כתובת לא נמצאה" });
      }

      const { label, street, city, coordinates, isDefault } = req.body;

      // If setting as default, remove default from others
      if (isDefault && !address.isDefault) {
        await CustomerAddress.updateMany(
          { customerId: req.user._id, _id: { $ne: address._id } },
          { isDefault: false }
        );
      }

      if (label) address.label = label;
      if (street) address.street = street;
      if (city) address.city = city;
      if (coordinates) address.coordinates = coordinates;
      if (isDefault !== undefined) address.isDefault = isDefault;

      await address.save();

      res.json({
        success: true,
        address,
      });
    } catch (error) {
      console.error("Update address error:", error);
      res.status(500).json({ error: "שגיאה בעדכון כתובת" });
    }
  }
);

// DELETE /api/customer/addresses/:addressId - Delete address
router.delete(
  "/addresses/:addressId",
  authenticate,
  isCustomer,
  async (req, res) => {
    try {
      const address = await CustomerAddress.findOneAndDelete({
        _id: req.params.addressId,
        customerId: req.user._id,
      });

      if (!address) {
        return res.status(404).json({ error: "כתובת לא נמצאה" });
      }

      // If deleted address was default, set first address as default
      if (address.isDefault) {
        const firstAddress = await CustomerAddress.findOne({
          customerId: req.user._id,
        });
        if (firstAddress) {
          firstAddress.isDefault = true;
          await firstAddress.save();
        }
      }

      res.json({
        success: true,
        message: "כתובת נמחקה בהצלחה",
      });
    } catch (error) {
      console.error("Delete address error:", error);
      res.status(500).json({ error: "שגיאה במחיקת כתובת" });
    }
  }
);

// ==========================================
// FAVORITES
// ==========================================

// GET /api/customer/favorites - Get all favorites
router.get("/favorites", authenticate, isCustomer, async (req, res) => {
  try {
    const favorites = await Favorite.find({
      customerId: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("businessId");

    res.json({
      success: true,
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ error: "שגיאה בטעינת מועדפים" });
  }
});

// POST /api/customer/favorites - Add to favorites
router.post("/favorites", authenticate, isCustomer, async (req, res) => {
  try {
    const { businessId } = req.body;

    // Check if already exists
    const existing = await Favorite.findOne({
      customerId: req.user._id,
      businessId,
    });

    if (existing) {
      return res.status(400).json({ error: "עסק כבר במועדפים" });
    }

    const favorite = await Favorite.create({
      customerId: req.user._id,
      businessId,
    });

    res.status(201).json({
      success: true,
      favorite,
    });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ error: "שגיאה בהוספה למועדפים" });
  }
});

// DELETE /api/customer/favorites/:businessId - Remove from favorites
router.delete(
  "/favorites/:businessId",
  authenticate,
  isCustomer,
  async (req, res) => {
    try {
      const favorite = await Favorite.findOneAndDelete({
        customerId: req.user._id,
        businessId: req.params.businessId,
      });

      if (!favorite) {
        return res.status(404).json({ error: "עסק לא נמצא במועדפים" });
      }

      res.json({
        success: true,
        message: "הוסר מהמועדפים",
      });
    } catch (error) {
      console.error("Remove favorite error:", error);
      res.status(500).json({ error: "שגיאה בהסרה מהמועדפים" });
    }
  }
);

// GET /api/customer/favorites/check/:businessId - Check if business is favorite
router.get(
  "/favorites/check/:businessId",
  authenticate,
  isCustomer,
  async (req, res) => {
    try {
      const favorite = await Favorite.findOne({
        customerId: req.user._id,
        businessId: req.params.businessId,
      });

      res.json({
        success: true,
        isFavorite: !!favorite,
      });
    } catch (error) {
      console.error("Check favorite error:", error);
      res.status(500).json({ error: "שגיאה בבדיקת מועדף" });
    }
  }
);

module.exports = router;
