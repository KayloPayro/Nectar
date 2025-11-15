// services/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ✅ ה-IP שלך: 192.168.1.234
const API_URL = __DEV__
  ? "https://blythe-null-loura.ngrok-free.dev/api" // ✅ הוסף /api
  : "https://your-production-url.com/api";

console.log("🌐 API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor - Add JWT token to every request
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

// Interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("❌ API Error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      // Token expired or invalid - logout
      await AsyncStorage.removeItem("@nectar_token");
      await AsyncStorage.removeItem("@nectar_user");
    }

    return Promise.reject(error);
  }
);

export default api;
