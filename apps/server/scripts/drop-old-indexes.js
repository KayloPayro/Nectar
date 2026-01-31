const mongoose = require("mongoose");
require("dotenv").config();

async function dropOldIndexes() {
  try {
    console.log("🔧 Dropping old indexes...");

    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/nectar"
    );

    console.log("✅ Connected to MongoDB");

    // Drop old indexes
    const db = mongoose.connection.db;

    try {
      await db.collection("businesses").dropIndex("businessId_1");
      console.log("✅ Dropped businesses.businessId_1");
    } catch (e) {
      console.log("⚠️  businessId_1 index doesn't exist (OK)");
    }

    try {
      await db.collection("benefits").dropIndex("benefitId_1");
      console.log("✅ Dropped benefits.benefitId_1");
    } catch (e) {
      console.log("⚠️  benefitId_1 index doesn't exist (OK)");
    }

    console.log("\n✅ Old indexes dropped successfully!");
    console.log("Now you can run: node scripts/seed.js");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

dropOldIndexes();