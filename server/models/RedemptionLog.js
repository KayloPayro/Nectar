// server/models/RedemptionLog.js
const mongoose = require("mongoose");

const redemptionLogSchema = new mongoose.Schema({
  customerBenefitCode: {
    type: String,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessId: {
    type: String,
    required: true,
  },
  benefitId: {
    type: String,
    required: true,
  },
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Staff member
  },
  rewardAmount: Number,
  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Who shared the code
  },
  status: {
    type: String,
    enum: ["success", "failed", "reversed"],
    default: "success",
  },
  failureReason: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("RedemptionLog", redemptionLogSchema);
