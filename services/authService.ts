// services/authService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

const TOKEN_KEY = "@nectar_token";
const USER_KEY = "@nectar_user";

export interface User {
  id: string;
  email: string;
  name: string;
  type: "customer" | "business";
}

// ✅ הוסף את האינטרפייסים האלה
export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  coordinates: { lat: number; lng: number };
}

export interface UserData {
  favorites: string[];
  addresses: Address[];
  selectedAddressId: string | null;
  generatedCodes: {
    id: string;
    businessId: string;
    businessName: string;
    offerId: string;
    offerTitle: string;
    code: string;
    createdAt: string;
  }[];
}

export const AuthService = {
  init: async () => {
    console.log("✅ AuthService initialized with API backend");
  },

  saveGeneratedCode: async (
    userId: string,
    businessId: string,
    businessName: string,
    offerId: string,
    offerTitle: string,
    code: string
  ): Promise<void> => {
    // TODO: בעתיד נחבר ל-API
    console.log("💾 Saving code:", { businessId, offerId, code });
  },

  signup: async (
    email: string,
    password: string,
    name: string,
    type: "customer" | "business"
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      console.log("📤 Registering user:", { email, name, type });

      const response = await api.post("/auth/register", {
        email,
        password,
        name,
        type,
      });

      const { token, user } = response.data;

      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      console.log("✅ Registration successful:", user);
      return { success: true, user };
    } catch (error: any) {
      console.error(
        "❌ Register error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה בהרשמה",
      };
    }
  },

  login: async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      console.log("📤 Logging in:", email);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));

      console.log("✅ Login successful:", user);
      return { success: true, user };
    } catch (error: any) {
      console.error("❌ Login error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה בהתחברות",
      };
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  },

  isLoggedIn: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    console.log("✅ Logged out");
  },

  resetPassword: async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.post("/auth/reset-password", { email });
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "שגיאה בשליחת קישור",
      };
    }
  },

  // ✅ הוסף את הפונקציות האלה - זמנית מחזירות נתונים ריקים
  // בעתיד נחבר אותן ל-API
  getUserData: async (userId: string): Promise<UserData> => {
    return {
      favorites: [],
      addresses: [],
      selectedAddressId: null,
      generatedCodes: [],
    };
  },

  addFavorite: async (userId: string, businessId: string): Promise<void> => {
    console.log("Add favorite:", businessId);
    // TODO: חבר ל-API
  },

  removeFavorite: async (userId: string, businessId: string): Promise<void> => {
    console.log("Remove favorite:", businessId);
    // TODO: חבר ל-API
  },

  selectAddress: async (userId: string, addressId: string): Promise<void> => {
    console.log("Select address:", addressId);
    // TODO: חבר ל-API
  },
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string
): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: "הסיסמה חייבת להכיל לפחות 6 תווים" };
  }
  return { valid: true };
};
