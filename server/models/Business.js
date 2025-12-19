const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  address: {
    street: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  phone: String,
  email: String,
  image: String,
  tags: [String],
  openingHours: {
    type: Map,
    of: {
      open: String,
      close: String,
      closed: Boolean,
    },
  },
  rating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ שינינו ל-pre('validate') במקום pre('save')
businessSchema.pre("validate", function (next) {
  if (!this.businessId) {
    this.businessId = `BIZ_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
  next();
});

businessSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Business", businessSchema);
