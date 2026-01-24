// components/home/BusinessCard.tsx
import { COLORS } from "@/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Business } from "../../types/business";

interface BusinessCardProps {
  item: Business;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  item,
  isFavorite,
  onToggleFavorite,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // ✅ המרת address לטקסט
  const getAddressText = () => {
    if (typeof item.address === "string") {
      return item.address;
    }
    if (item.address && typeof item.address === "object") {
      return `${item.address.street}, ${item.address.city}`;
    }
    return "כתובת לא זמינה";
  };

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
        onPress={onPress}
      >
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.imageOverlay} />

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={COLORS.deepPurple} />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onToggleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? COLORS.error : COLORS.cream}
            />
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="location-sharp" size={14} color={COLORS.sage} />
            <Text style={styles.address} numberOfLines={1}>
              {getAddressText()}
            </Text>
          </View>

          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 2 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: COLORS.plum,
    borderRadius: 24,
    elevation: 8,
    shadowColor: COLORS.midnight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "10",
    marginVertical: 10,
  },
  imageContainer: {
    height: 160,
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  ratingBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.honeyGold,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.deepPurple,
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(30, 27, 46, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  contentContainer: {
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.cream,
    textAlign: "right",
    flex: 1,
  },
  tagsContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
    alignItems: "center",
  },
  tag: {
    backgroundColor: COLORS.deepPurple,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "15",
  },
  tagText: {
    color: COLORS.lavenderBlush,
    fontWeight: "600",
    fontSize: 11,
  },
  moreTagsText: {
    color: COLORS.dustyRose,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  addressRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    opacity: 0.9,
  },
  address: {
    flex: 1,
    fontSize: 13,
    color: COLORS.softWhite,
    fontWeight: "500",
    textAlign: "right",
  },
});
