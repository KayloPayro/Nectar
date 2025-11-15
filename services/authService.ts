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

export const AuthService = {
  // Initialize (no longer needed with real backend)
  init: async () => {
    console.log("✅ AuthService initialized with API backend");
  },

  // Register/Signup
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

  // Register (alias for signup for backwards compatibility)
  register: async (
    email: string,
    password: string,
    name: string,
    type: "customer" | "business"
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    return AuthService.signup(email, password, name, type);
  },

  // Login
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

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  },

  // Check if logged in
  isLoggedIn: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  // Logout
  logout: async (): Promise<void> => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    console.log("✅ Logged out");
  },

  // Reset password
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
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (
  password: string
): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: "הסיסמה חייבת להכיל לפחות 6 תווים" };
  }
  return { valid: true };
};
