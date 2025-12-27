// components/shared/SearchBar.tsx
import { COLORS } from "@/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onBarcodePress: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onBarcodePress,
}) => {
  return (
    <View style={styles.searchContainer}>
      <TouchableOpacity onPress={onBarcodePress} style={styles.barcodeButton}>
        <Ionicons name="qr-code" size={24} color={COLORS.deepPurple} />
      </TouchableOpacity>

      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={COLORS.dustyRose} />
        <TextInput
          style={styles.searchInput}
          placeholder="חפש עסקים בקרבתך..."
          placeholderTextColor={COLORS.dustyRose}
          value={value}
          onChangeText={onChangeText}
          clearButtonMode="while-editing"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
