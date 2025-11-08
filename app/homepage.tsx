import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import Fuse from "fuse.js";
import { getDistance } from "geolib";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import businessData from "../data/businesses.json";

interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  image: string;
  rating: number;
  tags: string[];
  coordinates: { lat: number; lng: number };
  categories: string[];
}

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  coordinates: { lat: number; lng: number };
}

// Nectar Color Palette
const COLORS = {
  honeyGold: "#F4A259",
  amber: "#F2CC8F",
  lavenderBlush: "#E0BBE4",
  mint: "#81C6B5",
  sage: "#A8DADC",
  deepPurple: "#2D1B3D",
  plum: "#422C50",
  midnight: "#1A1423",
  cream: "#FFF8E8",
  softWhite: "#F5F1E3",
  dustyRose: "#D4A5A5",
  success: "#66C9B5",
  warning: "#FFB84D",
  error: "#E07A7A",
};

export default function HomeScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  const [addressDropdownVisible, setAddressDropdownVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address>({
    id: "1",
    label: "הבית",
    street: "רחוב הרצל 45",
    city: "תל אביב",
    coordinates: { lat: 32.0853, lng: 34.7818 },
  });
  const [savedAddresses] = useState<Address[]>([
    {
      id: "1",
      label: "הבית",
      street: "רחוב הרצל 45",
      city: "תל אביב",
      coordinates: { lat: 32.0853, lng: 34.7818 },
    },
    {
      id: "2",
      label: "העבודה",
      street: "רחוב רוטשילד 12",
      city: "תל אביב",
      coordinates: { lat: 32.0644, lng: 34.7748 },
    },
  ]);

  useEffect(() => {
    setBusinesses(businessData);
    setFilteredBusinesses(businessData);
  }, []);

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

  useEffect(() => {
    if (barcodeModalVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanLineAnim.setValue(0);
    }
  }, [barcodeModalVisible]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setBarcodeModalVisible(false);
    alert(`ברקוד נסרק: ${data}`);
  };

  const handleOpenCamera = async () => {
    if (!permission) return;

    if (!permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        alert("אין הרשאה למצלמה");
        return;
      }
    }
    setBarcodeModalVisible(true);
  };

  const renderCard = ({ item }: { item: Business }) => {
    const isFav = favorites.includes(item.id);
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.card}
        >
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.imageOverlay} />

          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{item.name}</Text>
              <TouchableOpacity
                onPress={() => toggleFavorite(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={isFav ? "star" : "star-outline"}
                  size={24}
                  color={isFav ? COLORS.honeyGold : COLORS.dustyRose}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={COLORS.honeyGold} />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="people" size={12} color={COLORS.mint} />
                <Text style={styles.ratingBadgeText}>מומלץ</Text>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.addressRow}>
              <Ionicons name="location" size={14} color={COLORS.sage} />
              <Text style={styles.address} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const filterByCategory = (category: string) => {
    // חישוב דינמי של קטגוריות לפי מיקום ודירוג
    const businessesWithDistance = filteredBusinesses.map((b) => {
      const distance = getDistance(
        {
          latitude: selectedAddress.coordinates.lat,
          longitude: selectedAddress.coordinates.lng,
        },
        {
          latitude: b.coordinates.lat,
          longitude: b.coordinates.lng,
        }
      );
      return { ...b, distance };
    });

    let data: typeof businessesWithDistance = [];

    if (category === "nearby") {
      // קרוב אליך: מרחק עד 5 ק"מ, ממוין לפי מרחק
      data = businessesWithDistance
        .filter((b) => b.distance <= 5000)
        .sort((a, b) => a.distance - b.distance);
    } else if (category === "recommended") {
      // מומלצים: דירוג גבוה (4.5+) וקרובים יחסית (עד 10 ק"מ)
      // נוסחה: דירוג גבוה + קרוב = יותר מומלץ
      data = businessesWithDistance
        .filter((b) => b.rating >= 4.5 && b.distance <= 10000)
        .sort((a, b) => {
          // נוסחה משוקללת: דירוג * 1000 - מרחק/10
          const scoreA = a.rating * 1000 - a.distance / 10;
          const scoreB = b.rating * 1000 - b.distance / 10;
          return scoreB - scoreA;
        });
    } else if (category === "premium") {
      // פרימיום: דירוג מעל 4.7 בלי תלות במרחק
      data = businessesWithDistance
        .filter((b) => b.rating >= 4.7)
        .sort((a, b) => b.rating - a.rating);
    } else if (category === "favorites") {
      // מועדפים: רק העסקים שהמשתמש סימן
      data = businessesWithDistance.filter((b) => favorites.includes(b.id));
    }

    return data;
  };

  const renderCategory = (title: string, category: string, icon: string) => {
    const data = filterByCategory(category);
    if (data.length === 0) return null;

    return (
      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleRow}>
            <Text style={styles.categoryTitle}>{title}</Text>
            <Ionicons name={icon as any} size={24} color={COLORS.honeyGold} />
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>הכל ←</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          horizontal
          inverted
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "row-reverse",
            paddingHorizontal: 16,
          }}
        />
      </View>
    );
  };

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.deepPurple} />

      {/* Header עם Logo וכתובת */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Nectar</Text>

          {/* Address Selector */}
          <TouchableOpacity
            style={styles.addressSelector}
            onPress={() => setAddressDropdownVisible(!addressDropdownVisible)}
            activeOpacity={0.7}
          >
            <View style={styles.addressContent}>
              <Ionicons
                name="chevron-down"
                size={20}
                color={COLORS.honeyGold}
                style={{
                  transform: [
                    { rotate: addressDropdownVisible ? "180deg" : "0deg" },
                  ],
                }}
              />
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
                <Text style={styles.addressText} numberOfLines={1}>
                  {selectedAddress.street}, {selectedAddress.city}
                </Text>
              </View>
              <Ionicons name="location" size={20} color={COLORS.honeyGold} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Dropdown רשימת כתובות */}
        {addressDropdownVisible && (
          <View style={styles.addressDropdown}>
            {savedAddresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={[
                  styles.addressItem,
                  selectedAddress.id === address.id && styles.addressItemActive,
                ]}
                onPress={() => {
                  setSelectedAddress(address);
                  setAddressDropdownVisible(false);
                }}
              >
                <View style={styles.addressItemContent}>
                  <Ionicons
                    name={
                      selectedAddress.id === address.id
                        ? "checkmark-circle"
                        : "location-outline"
                    }
                    size={22}
                    color={
                      selectedAddress.id === address.id
                        ? COLORS.mint
                        : COLORS.dustyRose
                    }
                  />
                  <View style={styles.addressItemText}>
                    <Text style={styles.addressItemLabel}>{address.label}</Text>
                    <Text style={styles.addressItemAddress}>
                      {address.street}, {address.city}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* כפתור הוסף כתובת חדשה */}
            <TouchableOpacity
              style={styles.addAddressButton}
              onPress={() => {
                setAddressDropdownVisible(false);
                alert("פתיחת מסך הוספת כתובת חדשה");
              }}
            >
              <Ionicons name="add-circle" size={22} color={COLORS.honeyGold} />
              <Text style={styles.addAddressText}>הוסף כתובת חדשה</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Search Bar + Barcode Button */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          onPress={handleOpenCamera}
          style={styles.barcodeButton}
        >
          <Ionicons name="qr-code" size={24} color={COLORS.deepPurple} />
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.dustyRose} />
          <TextInput
            style={styles.searchInput}
            placeholder="חפש עסקים בקרבתך..."
            placeholderTextColor={COLORS.dustyRose}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Categories */}
      {favorites.length > 0 &&
        renderCategory("המועדפים שלך", "favorites", "heart")}

      {renderCategory("קרוב אליך", "nearby", "location")}
      {renderCategory("עסקים מומלצים", "recommended", "flame")}
      {renderCategory("הכי פופולריים", "premium", "trophy")}

      {/* Modal לסריקת ברקוד */}
      <Modal visible={barcodeModalVisible} animationType="slide">
        <View style={styles.barcodeModal}>
          {permission?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: [
                  "qr",
                  "ean13",
                  "ean8",
                  "code128",
                  "code39",
                  "upc_a",
                  "upc_e",
                ],
              }}
            />
          ) : (
            <View style={styles.permissionDenied}>
              <Ionicons name="camera-outline" size={64} color={COLORS.error} />
              <Text style={styles.permissionText}>אין הרשאה למצלמה</Text>
              <TouchableOpacity
                style={styles.requestPermissionButton}
                onPress={requestPermission}
              >
                <Text style={styles.requestPermissionText}>אפשר גישה</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Overlay */}
          <View style={styles.barcodeOverlay}>
            <View style={styles.overlayTop}>
              <Text style={styles.instructionText}>
                סרוק את הברקוד על השולחן 📱
              </Text>
              <Text style={styles.instructionSubtext}>והתחל להרוויח הטבות</Text>
            </View>

            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />

              <View style={styles.scanBox}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />

                <View style={styles.hexagonContainer}>
                  <Text style={styles.hexagonText}>🐝</Text>
                </View>

                <Animated.View
                  style={[
                    styles.scanLine,
                    { transform: [{ translateY: scanLineTranslateY }] },
                  ]}
                />
              </View>

              <View style={styles.overlaySide} />
            </View>

            <View style={styles.overlayBottom} />
          </View>

          <TouchableOpacity
            onPress={() => setBarcodeModalVisible(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close-circle" size={28} color={COLORS.cream} />
            <Text style={styles.closeButtonText}>סגור</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepPurple,
  },

  // Header & Address
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
  logoText: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.honeyGold,
    textShadowColor: COLORS.amber,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  addressSelector: {
    flex: 1,
    marginLeft: 16,
  },
  addressContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.plum,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "30",
    gap: 8,
  },
  addressTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  addressLabel: {
    fontSize: 12,
    color: COLORS.dustyRose,
    fontWeight: "600",
  },
  addressText: {
    fontSize: 14,
    color: COLORS.cream,
    fontWeight: "700",
  },
  addressDropdown: {
    marginTop: 8,
    backgroundColor: COLORS.plum,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "30",
    overflow: "hidden",
    shadowColor: COLORS.midnight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  addressItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.deepPurple + "50",
  },
  addressItemActive: {
    backgroundColor: COLORS.mint + "15",
  },
  addressItemContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  addressItemText: {
    flex: 1,
    alignItems: "flex-end",
  },
  addressItemLabel: {
    fontSize: 16,
    color: COLORS.cream,
    fontWeight: "700",
    marginBottom: 2,
  },
  addressItemAddress: {
    fontSize: 13,
    color: COLORS.dustyRose,
  },
  addAddressButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    backgroundColor: COLORS.deepPurple + "50",
  },
  addAddressText: {
    fontSize: 15,
    color: COLORS.honeyGold,
    fontWeight: "700",
  },

  // Search
  searchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    gap: 10,
  },
  barcodeButton: {
    width: 52,
    height: 52,
    backgroundColor: COLORS.honeyGold,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.honeyGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.plum,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "30",
  },
  searchInput: {
    flex: 1,
    marginRight: 10,
    fontSize: 16,
    color: COLORS.cream,
    textAlign: "right",
  },

  // Category
  categoryContainer: {
    marginBottom: 28,
  },
  categoryHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  categoryTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.cream,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.amber,
    fontWeight: "600",
  },

  // Card
  card: {
    width: 240,
    backgroundColor: COLORS.plum,
    borderRadius: 20,
    marginLeft: 12,
    marginRight: 0,
    elevation: 5,
    shadowColor: COLORS.midnight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "20",
  },
  image: {
    width: "100%",
    height: 140,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: 140,
    backgroundColor: COLORS.deepPurple + "20",
  },
  textContainer: {
    padding: 14,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.cream,
    flexShrink: 1,
  },
  description: {
    color: COLORS.lavenderBlush,
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 19,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: COLORS.cream,
    fontSize: 15,
    fontWeight: "700",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.mint + "25",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
    gap: 4,
  },
  ratingBadgeText: {
    color: COLORS.mint,
    fontSize: 11,
    fontWeight: "700",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: COLORS.honeyGold + "30",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.honeyGold + "50",
  },
  tagText: {
    color: COLORS.amber,
    fontWeight: "700",
    fontSize: 12,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  address: {
    flex: 1,
    fontSize: 13,
    color: COLORS.sage,
    fontWeight: "500",
  },

  // Barcode Scanner
  barcodeModal: {
    flex: 1,
    backgroundColor: COLORS.midnight,
  },
  permissionDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.deepPurple,
    padding: 20,
  },
  permissionText: {
    color: COLORS.cream,
    fontSize: 18,
    marginTop: 16,
    fontWeight: "600",
  },
  requestPermissionButton: {
    marginTop: 20,
    backgroundColor: COLORS.honeyGold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  requestPermissionText: {
    color: COLORS.deepPurple,
    fontSize: 16,
    fontWeight: "700",
  },
  barcodeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(26, 20, 35, 0.85)",
    width: "100%",
    justifyContent: "flex-end",
    paddingBottom: 30,
    alignItems: "center",
  },
  instructionText: {
    color: COLORS.honeyGold,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  instructionSubtext: {
    color: COLORS.softWhite,
    fontSize: 14,
    textAlign: "center",
  },
  overlayMiddle: {
    flexDirection: "row",
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(26, 20, 35, 0.85)",
  },
  scanBox: {
    width: 280,
    height: 220,
    backgroundColor: "transparent",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 50,
    height: 50,
    borderColor: COLORS.honeyGold,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 12,
  },
  hexagonContainer: {
    opacity: 0.3,
  },
  hexagonText: {
    fontSize: 60,
  },
  scanLine: {
    position: "absolute",
    width: "90%",
    height: 3,
    backgroundColor: COLORS.mint,
    shadowColor: COLORS.mint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(26, 20, 35, 0.85)",
    width: "100%",
  },
  closeButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButtonText: {
    color: COLORS.cream,
    fontSize: 18,
    fontWeight: "800",
  },
});
