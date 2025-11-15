const mongoose = require("mongoose");

const benefitSchema = new mongoose.Schema({
  benefitId: {
    type: String,
    unique: true,
    sparse: true, // ✅ הוספנו sparse
  },
  businessId: {
    type: String,
    required: true,
    ref: "Business",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  discount: {
    type: String,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  terms: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  maxUsage: {
    total: Number,
    perCustomer: {
      type: Number,
      default: 1,
    },
    perPeriod: {
      times: Number,
      period: String,
    },
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  rewardAmount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ שינינו ל-pre('validate')
benefitSchema.pre("validate", function (next) {
  if (!this.benefitId) {
    this.benefitId = `BEN_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
  next();
});

module.exports = mongoose.model("Benefit", benefitSchema);
