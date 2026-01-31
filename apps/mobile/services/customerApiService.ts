// services/customerApiService.ts
import api from "./api";

export const CustomerApiService = {
  // Addresses
  getAddresses: async () => {
    const response = await api.get("/customer/addresses");
    return response.data;
  },

  addAddress: async (address: any) => {
    const response = await api.post("/customer/addresses", address);
    return response.data;
  },

  updateAddress: async (addressId: string, updates: any) => {
    const response = await api.put(`/customer/addresses/${addressId}`, updates);
    return response.data;
  },

  deleteAddress: async (addressId: string) => {
    const response = await api.delete(`/customer/addresses/${addressId}`);
    return response.data;
  },

  // Favorites
  getFavorites: async () => {
    const response = await api.get("/customer/favorites");
    return response.data;
  },

  addFavorite: async (businessId: string) => {
    const response = await api.post("/customer/favorites", { businessId });
    return response.data;
  },

  removeFavorite: async (businessId: string) => {
    const response = await api.delete(`/customer/favorites/${businessId}`);
    return response.data;
  },

  checkFavorite: async (businessId: string) => {
    const response = await api.get(`/customer/favorites/check/${businessId}`);
    return response.data;
  },
};
