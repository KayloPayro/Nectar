const mongoose = require("mongoose");

const customerBenefitSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  benefitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Benefit",
    required: true,
  },
  displayCode: {
    type: String,
    required: true,
    unique: true,
  },
  qrData: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "redeemed", "expired", "cancelled"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  redeemedAt: Date,
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  expiresAt: Date,
});

// Generate unique display code
customerBenefitSchema.pre("validate", function (next) {
  if (!this.displayCode) {
    this.displayCode = `CODE_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
  next();
});

customerBenefitSchema.methods.isExpired = function () {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Indexes
customerBenefitSchema.index({ customerId: 1 });
customerBenefitSchema.index({ benefitId: 1 });
customerBenefitSchema.index({ status: 1 });
customerBenefitSchema.index({ displayCode: 1 });

module.exports = mongoose.model("CustomerBenefit", customerBenefitSchema);
