const mongoose = require("mongoose");

const customerBenefitSchema = new mongoose.Schema({
  customerBenefitCode: {
    type: String,
    unique: true,
    // ✅ לא הוספנו required: true כי זה נוצר ב-hook
  },
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
  benefitId: {
    type: String,
    required: true,
    ref: "Benefit",
  },
  displayCode: {
    type: String,
    required: true,
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

// ✅ שינוי מ-pre('save') ל-pre('validate') - רק זה!
customerBenefitSchema.pre("validate", function (next) {
  if (!this.customerBenefitCode) {
    this.customerBenefitCode = `CBF_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
  next();
});

// Check if expired
customerBenefitSchema.methods.isExpired = function () {
  return this.expiresAt && new Date() > this.expiresAt;
};

module.exports = mongoose.model("CustomerBenefit", customerBenefitSchema);
