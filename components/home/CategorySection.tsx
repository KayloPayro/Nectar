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
        <TouchableOpacity>
          <Text style={styles.seeAllText}>הכל ←</Text>
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
          flexDirection: "row-reverse",
          paddingHorizontal: 16,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
});
