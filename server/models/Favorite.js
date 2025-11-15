const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessId: {
    type: String,
    required: true,
    ref: "Business",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure unique favorite per customer-business pair
favoriteSchema.index({ customerId: 1, businessId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
