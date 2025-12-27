// models/CustomerBenefit.js
const mongoose = require("mongoose");

const customerBenefitSchema = new mongoose.Schema(
  {
    customerBenefitCode: {
      type: String,
      // ❌ הסר unique: true מכאן אם יש
      default: function () {
        return `CBF_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 11)}`;
      },
    },
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
      // ❌ הסר unique: true מכאן אם יש
    },
    qrData: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "redeemed", "expired"],
      default: "active",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    redeemedAt: Date,
    redeemedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// ✅ הוסף compound unique index על customerId + benefitId + status
// כך שמשתמש יוכל לקבל רק קוד אחד פעיל לכל הטבה
customerBenefitSchema.index(
  { customerId: 1, benefitId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" }, // רק קודים פעילים צריכים להיות ייחודיים
  }
);

// Method to check if expired
customerBenefitSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

module.exports = mongoose.model("CustomerBenefit", customerBenefitSchema);
