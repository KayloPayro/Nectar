// server/scripts/seed.js
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const Business = require("../models/Business");
const Benefit = require("../models/Benefit");

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...");

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/nectar",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Business.deleteMany({});
    await Benefit.deleteMany({});
    console.log("✅ Database cleared");

    // Create users
    console.log("👥 Creating users...");

    const customerUser = await User.create({
      email: "customer@nectar.com",
      password: "123456",
      name: "איתי לוי",
      type: "customer",
      phone: "050-1234567",
    });

    const businessUser1 = await User.create({
      email: "pizza@nectar.com",
      password: "123456",
      name: "פיצה איטליה",
      type: "business",
      phone: "03-1234567",
    });

    const businessUser2 = await User.create({
      email: "cafe@nectar.com",
      password: "123456",
      name: "קפה נקטר",
      type: "business",
      phone: "03-7654321",
    });

    console.log("✅ Users created");

    // Create businesses
    console.log("🏢 Creating businesses...");

    const pizzaBusiness = await Business.create({
      ownerId: businessUser1._id,
      name: "פיצה איטליה",
      description: "פיצה איטלקית אותנטית עם מרכיבים טריים",
      category: "מסעדה",
      address: {
        street: "רחוב דיזנגוף 100",
        city: "תל אביב",
        coordinates: {
          lat: 32.0853,
          lng: 34.7818,
        },
      },
      phone: "03-1234567",
      email: "pizza@nectar.com",
      image: "https://picsum.photos/seed/pizza/400/300",
      tags: ["פיצה", "איטלקי", "משפחתי"],
      openingHours: {
        sunday: { open: "11:00", close: "23:00" },
        monday: { open: "11:00", close: "23:00" },
        tuesday: { open: "11:00", close: "23:00" },
        wednesday: { open: "11:00", close: "23:00" },
        thursday: { open: "11:00", close: "23:00" },
        friday: { open: "11:00", close: "15:00" },
        saturday: { open: "20:00", close: "23:00" },
      },
      rating: 4.5,
      totalReviews: 120,
    });

    const cafeBusiness = await Business.create({
      ownerId: businessUser2._id,
      name: "קפה נקטר",
      description: "בית קפה מקסים עם אווירה חמימה וקפה משובח",
      category: "בית קפה",
      address: {
        street: "רחוב רוטשילד 45",
        city: "תל אביב",
        coordinates: {
          lat: 32.0656,
          lng: 34.7748,
        },
      },
      phone: "03-7654321",
      email: "cafe@nectar.com",
      image: "https://picsum.photos/seed/cafe/400/300",
      tags: ["קפה", "בריסטה", "ארוחת בוקר", "עוגות"],
      openingHours: {
        sunday: { open: "07:00", close: "20:00" },
        monday: { open: "07:00", close: "20:00" },
        tuesday: { open: "07:00", close: "20:00" },
        wednesday: { open: "07:00", close: "20:00" },
        thursday: { open: "07:00", close: "20:00" },
        friday: { open: "07:00", close: "16:00" },
        saturday: { open: "08:00", close: "20:00" },
      },
      rating: 4.8,
      totalReviews: 89,
    });

    console.log("✅ Businesses created");

    // Create benefits
    console.log("🎁 Creating benefits...");

    await Benefit.create([
      {
        businessId: pizzaBusiness.businessId,
        title: "2 פיצות במחיר של 1",
        description: "קנה פיצה משפחתית וקבל שנייה חינם!",
        discount: "50%",
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        terms: "תקף פעם אחת לחודש, לא ניתן לשילוב עם הנחות אחרות",
        maxUsage: {
          total: 1000,
          perCustomer: 1,
          perPeriod: {
            times: 1,
            period: "month",
          },
        },
        rewardAmount: 10,
        isActive: true,
      },
      {
        businessId: pizzaBusiness.businessId,
        title: "20% הנחה על כל התפריט",
        description: "הנחה מדהימה על כל המנות במסעדה",
        discount: "20%",
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        terms: "תקף בימי ראשון-חמישי בלבד",
        maxUsage: {
          perCustomer: 3,
        },
        rewardAmount: 5,
        isActive: true,
      },
      {
        businessId: cafeBusiness.businessId,
        title: 'קפה + עוגה ב-25 ש"ח',
        description: "מארז מיוחד: קפה לבחירתך + עוגת בית",
        discount: '25 ש"ח',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        terms: "תקף בימים א-ה בין 14:00-17:00",
        maxUsage: {
          total: 500,
          perCustomer: 2,
          perPeriod: {
            times: 1,
            period: "week",
          },
        },
        rewardAmount: 7,
        isActive: true,
      },
      {
        businessId: cafeBusiness.businessId,
        title: 'ארוחת בוקר זוגית ב-99 ש"ח',
        description: "ארוחת בוקר מושלמת לשניים",
        discount: '99 ש"ח',
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        terms: "תקף בסופי שבוע בלבד, עד 12:00",
        maxUsage: {
          total: 200,
          perCustomer: 1,
        },
        rewardAmount: 15,
        isActive: true,
      },
    ]);

    console.log("✅ Benefits created");

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📝 Test accounts:");
    console.log("   Customer: customer@nectar.com / 123456");
    console.log("   Pizza Business: pizza@nectar.com / 123456");
    console.log("   Cafe Business: cafe@nectar.com / 123456");
    console.log("\n🚀 You can now test the API!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedDatabase();
