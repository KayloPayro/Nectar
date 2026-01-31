// services/businessService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export interface BusinessProfile {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  image: string;
  address: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  email: string;
  category: string;
  tags: string[];
  rating: number;
  openingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  createdAt: string;
  updatedAt: string;
  businessId: string;
}



const BUSINESS_PROFILES_KEY = "@nectar_business_profiles";
const BUSINESS_OFFERS_KEY = "@nectar_business_offers";

export const BusinessService = {
  // Get business profile by owner ID
  getBusinessByOwnerId: async (
    ownerId: string
  ): Promise<BusinessProfile | null> => {
    try {
      const res = await api.get(`/business/${ownerId}`);
      return res.data;
    } catch (error) {
      console.error("Error getting business by owner:", error);
      return null;
    }
  },

  // Get business profile by ID
  getBusinessById: async (
    businessId: string
  ): Promise<BusinessProfile | null> => {
    try {
      const profilesJson = await AsyncStorage.getItem(BUSINESS_PROFILES_KEY);
      const profiles: BusinessProfile[] = profilesJson
        ? JSON.parse(profilesJson)
        : [];
      return profiles.find((p) => p.id === businessId) || null;
    } catch (error) {
      console.error("Error getting business by id:", error);
      return null;
    }
  },

  // Get all businesses
  getAllBusinesses: async (): Promise<BusinessProfile[]> => {
    try {
      const profilesJson = await AsyncStorage.getItem(BUSINESS_PROFILES_KEY);
      return profilesJson ? JSON.parse(profilesJson) : [];
    } catch (error) {
      console.error("Error getting all businesses:", error);
      return [];
    }
  },

  // Create business profile
  createBusinessProfile: async (
    ownerId: string,
    data: Omit<
      BusinessProfile,
      "id" | "ownerId" | "createdAt" | "updatedAt" | "rating"
    >
  ): Promise<{ success: boolean; businessId?: string; error?: string }> => {
    try {
      const profilesJson = await AsyncStorage.getItem(BUSINESS_PROFILES_KEY);
      const profiles: BusinessProfile[] = profilesJson
        ? JSON.parse(profilesJson)
        : [];

      // Check if owner already has a business
      const existing = profiles.find((p) => p.ownerId === ownerId);
      if (existing) {
        return { success: false, error: "כבר קיים עסק עבור משתמש זה" };
      }

      const newProfile: BusinessProfile = {
        id: Date.now().toString(),
        ownerId,
        ...data,
        rating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      profiles.push(newProfile);
      await AsyncStorage.setItem(
        BUSINESS_PROFILES_KEY,
        JSON.stringify(profiles)
      );

      return { success: true, businessId: newProfile.id };
    } catch (error) {
      console.error("Error creating business profile:", error);
      return { success: false, error: "שגיאה ביצירת פרופיל עסק" };
    }
  },

  // Update business profile
  updateBusinessProfile: async (
    businessId: string,
    updates: Partial<
      Omit<BusinessProfile, "id" | "ownerId" | "createdAt" | "updatedAt">
    >
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const profilesJson = await AsyncStorage.getItem(BUSINESS_PROFILES_KEY);
      const profiles: BusinessProfile[] = profilesJson
        ? JSON.parse(profilesJson)
        : [];

      const index = profiles.findIndex((p) => p.id === businessId);
      if (index === -1) {
        return { success: false, error: "העסק לא נמצא" };
      }

      profiles[index] = {
        ...profiles[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        BUSINESS_PROFILES_KEY,
        JSON.stringify(profiles)
      );
      return { success: true };
    } catch (error) {
      console.error("Error updating business profile:", error);
      return { success: false, error: "שגיאה בעדכון פרופיל" };
    }
  },

};
