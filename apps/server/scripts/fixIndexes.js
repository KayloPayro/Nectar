// scripts/fixIndexes.js
require("dotenv").config(); // ✅ טוען את המשתנים מ-.env
const mongoose = require("mongoose");
const CustomerBenefit = require("../models/CustomerBenefit");

async function fixIndexes() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    console.log("URI:", "mongodb://localhost:27017/nectar" ? "Found ✅" : "Missing ❌");
    
    await mongoose.connect("mongodb://localhost:27017/nectar");
    console.log("✅ Connected to MongoDB");
    
    console.log("🔍 Checking existing indexes...");
    const indexes = await CustomerBenefit.collection.getIndexes();
    console.log("Current indexes:", Object.keys(indexes));
    
    // מחק את כל ה-indexes חוץ מ-_id
    for (const indexName of Object.keys(indexes)) {
      if (indexName !== "_id_") {
        console.log(`🗑️ Dropping index: ${indexName}`);
        await CustomerBenefit.collection.dropIndex(indexName);
      }
    }
    
    console.log("✅ All old indexes dropped");
    console.log("✅ Creating new compound index...");
    
    await CustomerBenefit.collection.createIndex(
      { customerId: 1, benefitId: 1, status: 1 },
      { 
        unique: true,
        partialFilterExpression: { status: "active" },
        name: "unique_active_customer_benefit" // שם ברור ל-index
      }
    );
    
    console.log("✅ New compound index created successfully!");
    
    // הצג את ה-indexes החדשים
    const newIndexes = await CustomerBenefit.collection.getIndexes();
    console.log("📋 Final indexes:", Object.keys(newIndexes));
    
    await mongoose.connection.close();
    console.log("✅ Connection closed");
    console.log("🎉 All done!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Full error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixIndexes();