import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";

type Props = {
  onSelect?: (type: "business" | "customer") => void;
};

export default function UserTypeSelector({ onSelect }: Props) {
  const [userType, setUserType] = useState<"business" | "customer">("customer");

  const handleSelect = (type: "business" | "customer") => {
    setUserType(type);
    if (onSelect) onSelect(type);
  };

  return (
    <View style={styles.selectorContainer}>
      <AnimatedTouchableButton
        label="עסק"
        selected={userType === "business"}
        onPress={() => handleSelect("business")}
        selectedColor="#FFC857"
      />
      <AnimatedTouchableButton
        label="לקוח"
        selected={userType === "customer"}
        onPress={() => handleSelect("customer")}
        selectedColor="#4ECDC4"
      />
    </View>
  );
}

type ButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  selectedColor: string;
};

function AnimatedTouchableButton({ label, selected, onPress, selectedColor }: ButtonProps) {
  const scale = new Animated.Value(selected ? 1.05 : 1);

  const animateScale = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      friction: 4,
      tension: 150,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        onPress();
        animateScale(1.05);
        setTimeout(() => animateScale(1), 150);
      }}
      style={[styles.optionButton, selected && { backgroundColor: selectedColor, borderColor: "#FF9F1C" }]}
    >
      <Animated.Text style={[styles.optionText, selected && { color: "#22223B" }]}>
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  selectorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginVertical: 20,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#F7F7F7",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  optionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#9A9A9A",
  },
});
