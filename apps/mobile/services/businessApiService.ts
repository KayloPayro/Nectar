// services/businessApiService.ts
import api from "./api";

export interface BusinessProfile {
  _id?: string;
  businessId: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  address: {
    street: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  phone: string;
  email: string;
  image: string;
  tags: string[];
  openingHours: any;
  rating: number;
  totalReviews: number;
  isActive: boolean;
}

export const BusinessApiService = {
  // Register business
  registerBusiness: async (businessData: any) => {
    try {
      console.log("📤 Creating business profile...");
      const response = await api.post("/business/register", businessData);
      console.log("✅ Business created:", response.data.businessId);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("❌ Create business error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה ביצירת עסק",
      };
    }
  },

  // Get my business
  getMyBusiness: async () => {
    try {
      console.log("📤 Getting my business...");
      const response = await api.get("/business/my-business");
      console.log("✅ Business loaded:", response.data.business?.name);
      return { success: true, business: response.data.business };
    } catch (error: any) {
      console.error("❌ testGet business error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה בטעינת עסק",
      };
    }
  },

  // Get business by ID (public)
  getBusinessById: async (businessId: string) => {
    try {
      console.log("📤 Getting business:", businessId);
      const response = await api.get(`/business/${businessId}`);
      return { success: true, business: response.data.business };
    } catch (error: any) {
      console.error("❌ lalaGet business error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "עסק לא נמצא lalal",
      };
    }
  },

  // Get all businesses
  getAllBusinesses: async (params?: {
    category?: string;
    search?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }) => {
    try {
      console.log("📤 Getting all businesses...", params);
      const response = await api.get("/business", { params });
      console.log("✅ Loaded", response.data.count, "businesses");
      return { success: true, businesses: response.data.businesses };
    } catch (error: any) {
      console.error("❌ Get businesses error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה בטעינת עסקים",
      };
    }
  },

  // Update business
  updateBusiness: async (businessId: string, updates: any) => {
    try {
      console.log("📤 Updating business:", businessId);
      const response = await api.put(`/business/${businessId}`, updates);
      console.log("✅ Business updated");
      return { success: true, business: response.data.business };
    } catch (error: any) {
      console.error("❌ Update business error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה בעדכון עסק",
      };
    }
  },

  // Get business stats
  getBusinessStats: async (businessId: string) => {
    try {
      console.log("📤 Getting business stats:", businessId);
      const response = await api.get(`/business/${businessId}/stats`);
      return { success: true, stats: response.data.stats };
    } catch (error: any) {
      console.error("❌ Get stats error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה בטעינת סטטיסטיקות",
      };
    }
  },
};
