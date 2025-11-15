// services/businessService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

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
}

export interface Offer {
  id: string;
  businessId: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  terms: string;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  createdAt: string;
}

const BUSINESS_PROFILES_KEY = "@nectar_business_profiles";
const BUSINESS_OFFERS_KEY = "@nectar_business_offers";

export const BusinessService = {
  // Get business profile by owner ID
  getBusinessByOwnerId: async (
    ownerId: string
  ): Promise<BusinessProfile | null> => {
    try {
      const profilesJson = await AsyncStorage.getItem(BUSINESS_PROFILES_KEY);
      const profiles: BusinessProfile[] = profilesJson
        ? JSON.parse(profilesJson)
        : [];
      return profiles.find((p) => p.ownerId === ownerId) || null;
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

  // Get business offers
  getBusinessOffers: async (businessId: string): Promise<Offer[]> => {
    try {
      const offersJson = await AsyncStorage.getItem(BUSINESS_OFFERS_KEY);
      const allOffers: Offer[] = offersJson ? JSON.parse(offersJson) : [];
      return allOffers.filter((o) => o.businessId === businessId);
    } catch (error) {
      console.error("Error getting business offers:", error);
      return [];
    }
  },

  // Get all offers
  getAllOffers: async (): Promise<Offer[]> => {
    try {
      const offersJson = await AsyncStorage.getItem(BUSINESS_OFFERS_KEY);
      return offersJson ? JSON.parse(offersJson) : [];
    } catch (error) {
      console.error("Error getting all offers:", error);
      return [];
    }
  },

  // Create offer
  createOffer: async (
    businessId: string,
    data: Omit<Offer, "id" | "businessId" | "createdAt" | "usageCount">
  ): Promise<{ success: boolean; offerId?: string; error?: string }> => {
    try {
      const offersJson = await AsyncStorage.getItem(BUSINESS_OFFERS_KEY);
      const offers: Offer[] = offersJson ? JSON.parse(offersJson) : [];

      const newOffer: Offer = {
        id: Date.now().toString(),
        businessId,
        ...data,
        usageCount: 0,
        createdAt: new Date().toISOString(),
      };

      offers.push(newOffer);
      await AsyncStorage.setItem(BUSINESS_OFFERS_KEY, JSON.stringify(offers));

      return { success: true, offerId: newOffer.id };
    } catch (error) {
      console.error("Error creating offer:", error);
      return { success: false, error: "שגיאה ביצירת הטבה" };
    }
  },

  // Update offer
  updateOffer: async (
    offerId: string,
    updates: Partial<Omit<Offer, "id" | "businessId" | "createdAt">>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const offersJson = await AsyncStorage.getItem(BUSINESS_OFFERS_KEY);
      const offers: Offer[] = offersJson ? JSON.parse(offersJson) : [];

      const index = offers.findIndex((o) => o.id === offerId);
      if (index === -1) {
        return { success: false, error: "ההטבה לא נמצאה" };
      }

      offers[index] = { ...offers[index], ...updates };
      await AsyncStorage.setItem(BUSINESS_OFFERS_KEY, JSON.stringify(offers));

      return { success: true };
    } catch (error) {
      console.error("Error updating offer:", error);
      return { success: false, error: "שגיאה בעדכון הטבה" };
    }
  },

  // Delete offer
  deleteOffer: async (
    offerId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const offersJson = await AsyncStorage.getItem(BUSINESS_OFFERS_KEY);
      const offers: Offer[] = offersJson ? JSON.parse(offersJson) : [];

      const filtered = offers.filter((o) => o.id !== offerId);
      await AsyncStorage.setItem(BUSINESS_OFFERS_KEY, JSON.stringify(filtered));

      return { success: true };
    } catch (error) {
      console.error("Error deleting offer:", error);
      return { success: false, error: "שגיאה במחיקת הטבה" };
    }
  },

  // Increment offer usage
  incrementOfferUsage: async (offerId: string): Promise<void> => {
    try {
      const offersJson = await AsyncStorage.getItem(BUSINESS_OFFERS_KEY);
      const offers: Offer[] = offersJson ? JSON.parse(offersJson) : [];

      const index = offers.findIndex((o) => o.id === offerId);
      if (index !== -1) {
        offers[index].usageCount += 1;
        await AsyncStorage.setItem(BUSINESS_OFFERS_KEY, JSON.stringify(offers));
      }
    } catch (error) {
      console.error("Error incrementing offer usage:", error);
    }
  },
};
