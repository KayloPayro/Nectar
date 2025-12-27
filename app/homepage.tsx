// app/homepage.tsx
// app/homepage.tsx
import { COLORS } from "@/colors/colors";
import { BenefitQRDisplay } from "@/components/home/BenefitQRDisplay";
import { BusinessApiService } from "@/services/businessApiService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Fuse from "fuse.js";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AddressSelector } from "../components/home/AddressSelector";
import { CategorySection } from "../components/home/CategorySection";
import { SearchBar } from "../components/shared/SearchBar";
import { useBusinessFilters } from "../hooks/useBusinessFilters";
import { Address, AuthService, User, UserData } from "../services/authService";
import { Business } from "../types/business";

export default function HomeScreen() {
  const router = useRouter();

  // State
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [addressDropdownVisible, setAddressDropdownVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize
  useEffect(() => {
    loadUserData();
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    const userAddress = selectedAddress;

    const params = userAddress
      ? {
          lat: userAddress.coordinates.lat,
          lng: userAddress.coordinates.lng,
          radius: 10000,
        }
      : undefined;
    const result = await BusinessApiService.getAllBusinesses(params);

    if (result.success && result.businesses) {
      console.log("✅ Businesses loaded:", result.businesses.length);
      setBusinesses(result.businesses);
      setFilteredBusinesses(result.businesses);
    } else {
      console.error("Failed to load businesses:", result.error);
    }
    setLoading(false);
  };

  const loadUserData = async () => {
    const user = await AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const data = await AuthService.getUserData(user.id);
      setUserData(data);
      setFavorites(data.favorites);
      setSavedAddresses(data.addresses);

      if (data.selectedAddressId) {
        const addr = data.addresses.find(
          (a) => a.id === data.selectedAddressId
        );
        if (addr) {
          setSelectedAddress(addr);
        }
      }
    }
  };

  // Search logic
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBusinesses(businesses);
    } else {
      const fuse = new Fuse(businesses, {
        keys: ["name"],
        threshold: 0.4,
        distance: 100,
      });
      const results = fuse.search(searchQuery).map((res) => res.item);
      setFilteredBusinesses(results);
    }
  }, [searchQuery, businesses]);

  // Hooks
  const userCoords = selectedAddress
    ? {
        latitude: selectedAddress.coordinates.lat,
        longitude: selectedAddress.coordinates.lng,
      }
    : { latitude: 32.0853, longitude: 34.7818 };

  const { filterByCategory } = useBusinessFilters(
    filteredBusinesses,
    userCoords,
    favorites
  );

  // Handlers
  const toggleFavorite = async (id: string) => {
    if (!currentUser) return;

    const isFav = favorites.includes(id);
    if (isFav) {
      await AuthService.removeFavorite(currentUser.id, id);
      setFavorites((prev) => prev.filter((f) => f !== id));
    } else {
      await AuthService.addFavorite(currentUser.id, id);
      setFavorites((prev) => [...prev, id]);
    }
  };

  const handleOpenQRDisplay = () => {
    setQrModalVisible(true);
  };
  const handleCardPress = (item: Business) => {
    // ✅ תיקון: השתמש ב-businessId תמיד
    const id = item._id;

    if (!id) {
      console.error("❌ Business has no businessId:", item);
      alert("שגיאה: לא נמצא מזהה עסק");
      return;
    }

    console.log("✅ Navigating to business:", id, item.name);

    router.push({
      pathname: "/business/[id]" as any,
      params: {
        id: id, // ✅ שלח את businessId
        name: item.name,
      },
    } as any);
  };

  const handleSelectAddress = async (address: Address) => {
    setSelectedAddress(address);
    setAddressDropdownVisible(false);
    if (currentUser) {
      await AuthService.selectAddress(currentUser.id, address.id);
    }
    // טען מחדש עסקים עם כתובת חדשה
    loadBusinesses();
  };

  const handleAddNewAddress = () => {
    setAddressDropdownVisible(false);
    alert("פתיחת מסך הוספת כתובת חדשה - בפיתוח");
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.deepPurple} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoRow}>
            <TouchableOpacity
              onPress={async () => {
                await AuthService.logout();
                router.replace("/" as any);
              }}
              style={styles.logoutButton}
            >
              <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
            </TouchableOpacity>
            <Text style={styles.logoText}>Nectar</Text>
          </View>

          <AddressSelector
            selectedAddress={selectedAddress}
            savedAddresses={savedAddresses}
            isDropdownVisible={addressDropdownVisible}
            onToggleDropdown={() =>
              setAddressDropdownVisible(!addressDropdownVisible)
            }
            onSelectAddress={handleSelectAddress}
            onAddNewAddress={handleAddNewAddress}
          />
        </View>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onBarcodePress={handleOpenQRDisplay}
      />

      {/* Categories */}
      {favorites.length > 0 && (
        <CategorySection
          title="המועדפים שלך"
          icon="heart"
          data={filterByCategory("favorites")}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onCardPress={handleCardPress}
        />
      )}

      <CategorySection
        title="קרוב אליך"
        icon="location"
        data={filterByCategory("nearby")}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onCardPress={handleCardPress}
      />

      <CategorySection
        title="עסקים מומלצים"
        icon="flame"
        data={filterByCategory("recommended")}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onCardPress={handleCardPress}
      />

      <CategorySection
        title="הכי פופולריים"
        icon="trophy"
        data={filterByCategory("premium")}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onCardPress={handleCardPress}
      />

      <BenefitQRDisplay
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepPurple,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.honeyGold,
    textShadowColor: COLORS.amber,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.plum,
    justifyContent: "center",
    alignItems: "center",
  },
});
