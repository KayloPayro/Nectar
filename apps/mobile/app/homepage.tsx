// app/homepage.tsx
// app/homepage.tsx
import { COLORS } from "@/colors/colors";
import { BenefitQRDisplay } from "@/components/home/BenefitQRDisplay";
import { BusinessApiService } from "@/services/businessApiService";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import Fuse from "fuse.js";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);

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
      const mappedBusinesses = result.businesses.map((b: any) => ({
        ...b,
        id: b._id || b.id,
      }));
      setBusinesses(mappedBusinesses);
      setFilteredBusinesses(mappedBusinesses);
    } else {
      console.error("Failed to load businesses:", result.error);
    }
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
          (a) => a.id === data.selectedAddressId,
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
    favorites,
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
    const id = item.id;

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
    setAddAddressModalVisible(true);
    setManualAddress("");
  };

  const handleUseCurrentLocation = async () => {
    setIsAddingAddress(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("שגיאה", "נדרשת הרשאת מיקום כדי להוסיף את המיקום הנוכחי");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const reverseGeocoded = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocoded.length > 0) {
        const addr = reverseGeocoded[0];
        const newAddress: Address = {
          id: Date.now().toString(),
          label: "המיקום שלי",
          street: addr.street || "רחוב לא ידוע",
          city: addr.city || addr.subregion || "עיר לא ידועה",
          coordinates: { lat: latitude, lng: longitude },
        };

        setSavedAddresses((prev) => [...prev, newAddress]);
        handleSelectAddress(newAddress);
        setAddAddressModalVisible(false);
      }
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("שגיאה", "לא ניתן לאתר את המיקום הנוכחי");
    } finally {
      setIsAddingAddress(false);
    }
  };

  const handleSaveManualAddress = async () => {
    if (!manualAddress.trim()) return;

    setIsAddingAddress(true);
    try {
      const geocoded = await Location.geocodeAsync(manualAddress);
      if (geocoded.length > 0) {
        const { latitude, longitude } = geocoded[0];
        const reverse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverse.length > 0) {
          const addr = reverse[0];
          const newAddress: Address = {
            id: Date.now().toString(),
            label: addr.city || "כתובת חדשה",
            street: addr.street || manualAddress,
            city: addr.city || addr.subregion || "",
            coordinates: { lat: latitude, lng: longitude },
          };

          setSavedAddresses((prev) => [...prev, newAddress]);
          handleSelectAddress(newAddress);
          setAddAddressModalVisible(false);
        } else {
          Alert.alert("שגיאה", "לא הצלחנו למצוא פרטים מלאים על הכתובת");
        }
      } else {
        Alert.alert("כתובת לא נמצאה", "אנא נסה להזין כתובת מדויקת יותר");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בחיפוש הכתובת");
    } finally {
      setIsAddingAddress(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.deepPurple} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section - Top Background */}
        <View style={styles.heroSection}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.logoRow}>
              <TouchableOpacity
                onPress={async () => {
                  await AuthService.logout();
                  router.replace("/" as any);
                }}
                style={styles.logoutButton}
              >
                <Ionicons
                  name="log-out-outline"
                  size={22}
                  color={COLORS.error}
                />
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

          {/* Greeting Section */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>
              היי, {currentUser?.name?.split(" ")[0] || "אורח"} 👋
            </Text>
            <Text style={styles.subGreetingText}>מה מתחשק לך לגלות היום?</Text>
          </View>

          {/* Search Bar Container - Sitting inside Hero */}
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onBarcodePress={handleOpenQRDisplay}
            />
          </View>
        </View>

        {/* Categories Content */}
        <View style={styles.contentContainer}>
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
        </View>

        <BenefitQRDisplay
          visible={qrModalVisible}
          onClose={() => setQrModalVisible(false)}
        />
      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        visible={addAddressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddAddressModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setAddAddressModalVisible(false)}
          />

          <View style={styles.addAddressModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>הוספת כתובת חדשה</Text>
              <TouchableOpacity
                onPress={() => setAddAddressModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.dustyRose} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>בחר כיצד להוסיף את הכתובת</Text>

            {/* Current Location Button */}
            <TouchableOpacity
              style={styles.currentLocationBtn}
              onPress={handleUseCurrentLocation}
              disabled={isAddingAddress}
            >
              {isAddingAddress ? (
                <ActivityIndicator color={COLORS.deepPurple} />
              ) : (
                <>
                  <Ionicons
                    name="navigate"
                    size={20}
                    color={COLORS.deepPurple}
                  />
                  <Text style={styles.currentLocationText}>
                    השתמש במיקום הנוכחי שלי
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>או</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Manual Input */}
            <Text style={styles.inputLabel}>הזן כתובת ידנית</Text>
            <View style={styles.manualInputContainer}>
              <Ionicons name="search" size={20} color={COLORS.dustyRose} />
              <TextInput
                style={styles.manualInput}
                placeholder="לדוגמא: דיזנגוף 50, תל אביב"
                placeholderTextColor={COLORS.dustyRose + "80"}
                value={manualAddress}
                onChangeText={setManualAddress}
                textAlign="right"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.saveAddressBtn,
                (!manualAddress.trim() || isAddingAddress) &&
                  styles.disabledBtn,
              ]}
              onPress={handleSaveManualAddress}
              disabled={!manualAddress.trim() || isAddingAddress}
            >
              {isAddingAddress ? (
                <ActivityIndicator color={COLORS.deepPurple} />
              ) : (
                <Text style={styles.saveAddressText}>חפש ושמור כתובת</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.midnight, // רקע כהה יותר לכל המסך
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    backgroundColor: COLORS.deepPurple,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: COLORS.honeyGold,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 100, // העלאת ה-zIndex של ההדר הראשי
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.honeyGold,
    letterSpacing: 0.5,
  },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  greetingContainer: {
    marginBottom: 24,
    paddingRight: 4,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.cream,
    textAlign: "right",
    marginBottom: 4,
  },
  subGreetingText: {
    fontSize: 16,
    color: COLORS.lavenderBlush,
    textAlign: "right",
    opacity: 0.9,
  },
  searchContainer: {
    marginTop: 4,
  },
  contentContainer: {
    marginTop: 20,
    gap: 10, // מרווח בין הסקשנים
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  addAddressModal: {
    backgroundColor: COLORS.plum,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.cream,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.lavenderBlush,
    marginBottom: 24,
    textAlign: "right",
  },
  currentLocationBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.honeyGold,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    marginBottom: 20,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.deepPurple,
  },
  dividerContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lavenderBlush + "20",
  },
  dividerText: {
    color: COLORS.dustyRose,
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.cream,
    marginBottom: 8,
    textAlign: "right",
  },
  manualInputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.deepPurple,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "30",
    marginBottom: 20,
  },
  manualInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.cream,
    marginRight: 10,
  },
  saveAddressBtn: {
    backgroundColor: COLORS.mint,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  saveAddressText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.deepPurple,
  },
  disabledBtn: {
    opacity: 0.5,
    backgroundColor: COLORS.dustyRose,
  },
});
