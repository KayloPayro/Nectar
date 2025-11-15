// server/models/CustomerBenefit.js
const mongoose = require('mongoose');

const customerBenefitSchema = new mongoose.Schema({
  customerBenefitCode: {
    type: String,
    unique: true,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  businessId: {
    type: String,
    required: true,
    ref: 'Business',
  },
  benefitId: {
    type: String,
    required: true,
    ref: 'Benefit',
  },
  displayCode: {
    type: String, // User-friendly code like "itay_pizza"
    required: true,
  },
  qrData: {
    type: String, // Encrypted QR code data
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'redeemed', 'expired', 'cancelled'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  redeemedAt: Date,
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The waiter/staff who scanned it
  },
  expiresAt: Date,
});

// Generate unique code before save
customerBenefitSchema.pre('save', function (next) {
  if (!this.customerBenefitCode) {
    this.customerBenefitCode = `CBF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Check if expired
customerBenefitSchema.methods.isExpired = function () {
  return this.expiresAt && new Date() > this.expiresAt;
};

module.exports = mongoose.model('CustomerBenefit', customerBenefitSchema);