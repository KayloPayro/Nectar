// components/home/CategorySection.tsx
import { COLORS } from "@/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Business } from "../../types/business";
import { BusinessCard } from "./BusinessCard";

interface CategorySectionProps {
  title: string;
  icon: string;
  data: Business[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onCardPress: (item: Business) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  icon,
  data,
  favorites,
  onToggleFavorite,
  onCardPress,
}) => {
  if (data.length === 0) return null;

  const renderCard = ({ item }: { item: Business }) => (
    <BusinessCard
      item={item}
      isFavorite={favorites.includes(item.businessId || item.id || "")}
      onToggleFavorite={() =>
        onToggleFavorite(item.businessId || item.id || "")
      }
      onPress={() => onCardPress(item)}
    />
  );

  return (
    <View style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryTitleRow}>
          <Text style={styles.categoryTitle}>{title}</Text>
          <Ionicons name={icon as any} size={24} color={COLORS.honeyGold} />
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>הצג הכל</Text>
          <Ionicons name="arrow-back" size={16} color={COLORS.amber} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) =>
          item.businessId || item.id || item._id || Math.random().toString()
        } // ✅ תיקון key
        renderItem={renderCard}
        horizontal
        inverted
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 16,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.cream,
  },
  seeAllButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: COLORS.plum + "99",
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.amber,
    fontWeight: "700",
  },
});
