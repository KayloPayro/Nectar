// services/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// שנה את ה-URL בהתאם לסביבה
const API_URL = __DEV__
  ? "http://localhost:3000/api" // Development
  : "https://your-production-url.com/api"; // Production

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor להוספת JWT token לכל בקשה
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@nectar_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor לטיפול בשגיאות
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout
      await AsyncStorage.removeItem("@nectar_token");
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

export default api;
