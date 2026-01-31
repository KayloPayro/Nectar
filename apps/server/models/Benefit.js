const mongoose = require("mongoose");

const benefitSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
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

// Indexes
benefitSchema.index({ businessId: 1 });
benefitSchema.index({ isActive: 1 });
benefitSchema.index({ validUntil: 1 });

module.exports = mongoose.model("Benefit", benefitSchema);
