// services/benefitApiService.ts
import api from "./api";

export interface Benefit {
  _id?: string;
  benefitId: string;
  businessId: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  terms: string;
  isActive: boolean;
  maxUsage?: {
    total?: number;
    perCustomer?: number;
    perPeriod?: {
      times: number;
      period: string;
    };
  };
  usageCount: number;
  rewardAmount: number;
  createdAt: string;
}

export const BenefitApiService = {
  // Create benefit
  createBenefit: async (benefitData: any) => {
    try {
      console.log("📤 Creating benefit...");
      const response = await api.post("/benefits/create", benefitData);
      console.log("✅ Benefit created:", response.data.benefitId);
      return { success: true, benefit: response.data.benefit };
    } catch (error: any) {
      console.error("❌ Create benefit error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה ביצירת הטבה",
      };
    }
  },

  // Get benefits for business (public)
  getBusinessBenefits: async (businessId: string) => {
    try {
      console.log("📤 Getting benefits for business:", businessId);
      const response = await api.get(`/benefits/business/${businessId}`);
      console.log("✅ Loaded", response.data.count, "benefits");
      return { success: true, benefits: response.data.benefits };
    } catch (error: any) {
      console.error("❌ Get benefits error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה בטעינת הטבות",
      };
    }
  },

  // Get my benefits (business owner)
  getMyBenefits: async () => {
    try {
      console.log("📤 Getting my benefits...");
      const response = await api.get("/benefits/my-benefits");
      console.log("✅ Loaded", response.data.count, "benefits");
      return { success: true, benefits: response.data.benefits };
    } catch (error: any) {
      console.error("❌ Get my benefits error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה בטעינת הטבות",
      };
    }
  },

  // Update benefit
  updateBenefit: async (benefitId: string, updates: any) => {
    try {
      console.log("📤 Updating benefit:", benefitId);
      const response = await api.put(`/benefits/${benefitId}`, updates);
      console.log("✅ Benefit updated");
      return { success: true, benefit: response.data.benefit };
    } catch (error: any) {
      console.error("❌ Update benefit error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה בעדכון הטבה",
      };
    }
  },

  // Delete benefit
  deleteBenefit: async (benefitId: string) => {
    try {
      console.log("📤 Deleting benefit:", benefitId);
      await api.delete(`/benefits/${benefitId}`);
      console.log("✅ Benefit deleted");
      return { success: true };
    } catch (error: any) {
      console.error("❌ Delete benefit error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה במחיקת הטבה",
      };
    }
  },

  // Redeem benefit (customer gets code)
  redeemBenefit: async (benefitId: string, distributorId?: string) => {
    try {
      console.log("📤 Redeeming benefit:", benefitId);
      const response = await api.post("/benefits/redeem", {
        benefitId,
        distributorId,
      });
      console.log("✅ Code generated:", response.data.displayCode);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("❌ Redeem benefit error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה ביצירת קוד",
      };
    }
  },

  // Validate benefit (staff scans QR)
  validateBenefit: async (qrData: string) => {
    try {
      console.log("📤 Validating benefit...");
      const response = await api.post("/benefits/validate", { qrData });
      console.log("✅ Benefit validated successfully!");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("❌ Validate benefit error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה באימות קוד",
      };
    }
  },

  // Get my codes (customer)
  getMyCodes: async () => {
    try {
      console.log("📤 Getting my codes...");
      const response = await api.get("/benefits/my-codes");
      console.log("✅ Loaded", response.data.count, "codes");
      return { success: true, codes: response.data.codes };
    } catch (error: any) {
      console.error("❌ Get codes error:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה בטעינת קודים",
      };
    }
  },
};
