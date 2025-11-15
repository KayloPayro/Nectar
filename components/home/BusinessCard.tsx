// components/home/BusinessCard.tsx
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
  dustyRose: "#D4A5A5",
};

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
      toValue: 0.95,
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
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.imageOverlay} />

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{item.name}</Text>
            <TouchableOpacity onPress={onToggleFavorite}>
              <Ionicons
                name={isFavorite ? "star" : "star-outline"}
                size={24}
                color={isFavorite ? COLORS.honeyGold : COLORS.dustyRose}
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

const styles = StyleSheet.create({
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
});
