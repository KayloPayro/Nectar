// services/authService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  email: string;
  name: string;
  type: "customer" | "business";
  createdAt: string;
}

const STORAGE_KEY = "@nectar_user";
const USERS_KEY = "@nectar_users"; // Mock database

// Mock users database
const initMockUsers = async () => {
  const existing = await AsyncStorage.getItem(USERS_KEY);
  if (!existing) {
    const mockUsers = [
      {
        id: "1",
        email: "test@nectar.com",
        password: "123456",
        name: "Test User",
        type: "customer",
        createdAt: new Date().toISOString(),
      },
    ];
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
  }
};

export const AuthService = {
  // Initialize
  init: async () => {
    await initMockUsers();
  },

  // Check if user is logged in
  isLoggedIn: async (): Promise<boolean> => {
    try {
      const user = await AsyncStorage.getItem(STORAGE_KEY);
      return user !== null;
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  // Login
  login: async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Get all users
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      // Find user
      const user = users.find(
        (u: any) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password
      );

      if (!user) {
        return { success: false, error: "אימייל או סיסמה שגויים" };
      }

      // Save logged in user (without password)
      const { password: _, ...userWithoutPassword } = user;
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(userWithoutPassword)
      );

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "שגיאה בהתחברות" };
    }
  },

  // Signup
  signup: async (
    email: string,
    password: string,
    name: string,
    type: "customer" | "business"
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Get all users
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      // Check if user already exists
      const existingUser = users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (existingUser) {
        return { success: false, error: "המשתמש כבר קיים" };
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        type,
        createdAt: new Date().toISOString(),
      };

      // Save to mock database
      users.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

      // Auto login
      const { password: _, ...userWithoutPassword } = newUser;
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(userWithoutPassword)
      );

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "שגיאה ביצירת חשבון" };
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  // Reset password (mock)
  resetPassword: async (
    email: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      const user = users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (!user) {
        return { success: false, error: "המשתמש לא נמצא" };
      }

      // In real app, send email here
      console.log(`Reset password link sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, error: "שגיאה בשליחת קישור" };
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
