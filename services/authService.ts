// services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  name: string;
  type: 'customer' | 'business';
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  coordinates: { lat: number; lng: number };
}

export interface UserData {
  favorites: string[]; // Business IDs
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

const STORAGE_KEY = '@nectar_user';
const USERS_KEY = '@nectar_users'; // Mock database
const USER_DATA_PREFIX = '@nectar_user_data_'; // User-specific data

// Mock users database
const initMockUsers = async () => {
  const existing = await AsyncStorage.getItem(USERS_KEY);
  if (!existing) {
    const mockUsers = [
      {
        id: '1',
        email: 'test@nectar.com',
        password: '123456',
        name: 'Test User',
        type: 'customer',
        createdAt: new Date().toISOString(),
      }
    ];
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
  }
};

// Initialize user data if doesn't exist
const initUserData = async (userId: string): Promise<UserData> => {
  const key = `${USER_DATA_PREFIX}${userId}`;
  const existing = await AsyncStorage.getItem(key);
  
  if (!existing) {
    const initialData: UserData = {
      favorites: [],
      addresses: [],
      selectedAddressId: null,
      generatedCodes: [],
    };
    await AsyncStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  
  return JSON.parse(existing);
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
      console.error('Error checking login status:', error);
      return false;
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get user data (favorites, addresses, etc.)
  getUserData: async (userId: string): Promise<UserData> => {
    try {
      const key = `${USER_DATA_PREFIX}${userId}`;
      const dataJson = await AsyncStorage.getItem(key);
      
      if (!dataJson) {
        return await initUserData(userId);
      }
      
      return JSON.parse(dataJson);
    } catch (error) {
      console.error('Error getting user data:', error);
      return await initUserData(userId);
    }
  },

  // Save user data
  saveUserData: async (userId: string, data: UserData): Promise<void> => {
    try {
      const key = `${USER_DATA_PREFIX}${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  // Login
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Get all users
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      // Find user
      const user = users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        return { success: false, error: 'אימייל או סיסמה שגויים' };
      }

      // Save logged in user (without password)
      const { password: _, ...userWithoutPassword } = user;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));

      // Initialize user data if needed
      await initUserData(user.id);

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'שגיאה בהתחברות' };
    }
  },

  // Signup
  signup: async (
    email: string,
    password: string,
    name: string,
    type: 'customer' | 'business'
  ): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Get all users
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      // Check if user already exists
      const existingUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return { success: false, error: 'המשתמש כבר קיים' };
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
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));

      // Initialize user data
      await initUserData(newUser.id);

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'שגיאה ביצירת חשבון' };
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Reset password (mock)
  resetPassword: async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];

      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return { success: false, error: 'המשתמש לא נמצא' };
      }

      // In real app, send email here
      console.log(`Reset password link sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'שגיאה בשליחת קישור' };
    }
  },

  // Add favorite
  addFavorite: async (userId: string, businessId: string): Promise<void> => {
    const data = await AuthService.getUserData(userId);
    if (!data.favorites.includes(businessId)) {
      data.favorites.push(businessId);
      await AuthService.saveUserData(userId, data);
    }
  },

  // Remove favorite
  removeFavorite: async (userId: string, businessId: string): Promise<void> => {
    const data = await AuthService.getUserData(userId);
    data.favorites = data.favorites.filter(id => id !== businessId);
    await AuthService.saveUserData(userId, data);
  },

  // Add address
  addAddress: async (userId: string, address: Address): Promise<void> => {
    const data = await AuthService.getUserData(userId);
    data.addresses.push(address);
    
    // If it's the first address, set it as selected
    if (data.addresses.length === 1) {
      data.selectedAddressId = address.id;
    }
    
    await AuthService.saveUserData(userId, data);
  },

  // Remove address
  removeAddress: async (userId: string, addressId: string): Promise<void> => {
    const data = await AuthService.getUserData(userId);
    data.addresses = data.addresses.filter(a => a.id !== addressId);
    
    // If removed address was selected, select the first one
    if (data.selectedAddressId === addressId && data.addresses.length > 0) {
      data.selectedAddressId = data.addresses[0].id;
    } else if (data.addresses.length === 0) {
      data.selectedAddressId = null;
    }
    
    await AuthService.saveUserData(userId, data);
  },

  // Select address
  selectAddress: async (userId: string, addressId: string): Promise<void> => {
    const data = await AuthService.getUserData(userId);
    data.selectedAddressId = addressId;
    await AuthService.saveUserData(userId, data);
  },

  // Save generated code
  saveGeneratedCode: async (
    userId: string,
    businessId: string,
    businessName: string,
    offerId: string,
    offerTitle: string,
    code: string
  ): Promise<void> => {
    const data = await AuthService.getUserData(userId);
    data.generatedCodes.push({
      id: Date.now().toString(),
      businessId,
      businessName,
      offerId,
      offerTitle,
      code,
      createdAt: new Date().toISOString(),
    });
    await AuthService.saveUserData(userId, data);
  },
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'הסיסמה חייבת להכיל לפחות 6 תווים' };
  }
  return { valid: true };
};