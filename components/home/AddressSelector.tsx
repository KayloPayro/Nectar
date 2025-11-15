// components/home/AddressSelector.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Address } from "../../services/authService";

const COLORS = {
  honeyGold: "#F4A259",
  lavenderBlush: "#E0BBE4",
  mint: "#81C6B5",
  deepPurple: "#2D1B3D",
  plum: "#422C50",
  midnight: "#1A1423",
  cream: "#FFF8E8",
  dustyRose: "#D4A5A5",
};

interface AddressSelectorProps {
  selectedAddress: Address | null;
  savedAddresses: Address[];
  isDropdownVisible: boolean;
  onToggleDropdown: () => void;
  onSelectAddress: (address: Address) => void;
  onAddNewAddress: () => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddress,
  savedAddresses,
  isDropdownVisible,
  onToggleDropdown,
  onSelectAddress,
  onAddNewAddress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addressSelector}
        onPress={onToggleDropdown}
        activeOpacity={0.7}
      >
        <View style={styles.addressContent}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={COLORS.honeyGold}
            style={{
              transform: [{ rotate: isDropdownVisible ? "180deg" : "0deg" }],
            }}
          />
          <View style={styles.addressTextContainer}>
            {selectedAddress ? (
              <>
                <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
                <Text style={styles.addressText} numberOfLines={1}>
                  {selectedAddress.street}, {selectedAddress.city}
                </Text>
              </>
            ) : (
              <Text style={styles.addressText}>הוסף כתובת</Text>
            )}
          </View>
          <Ionicons name="location" size={20} color={COLORS.honeyGold} />
        </View>
      </TouchableOpacity>

      {/* Dropdown */}
      {isDropdownVisible && (
        <View style={styles.addressDropdown}>
          {savedAddresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.addressItem,
                selectedAddress?.id === address.id && styles.addressItemActive,
              ]}
              onPress={() => onSelectAddress(address)}
            >
              <View style={styles.addressItemContent}>
                <Ionicons
                  name={
                    selectedAddress?.id === address.id
                      ? "checkmark-circle"
                      : "location-outline"
                  }
                  size={22}
                  color={
                    selectedAddress?.id === address.id
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

          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={onAddNewAddress}
          >
            <Ionicons name="add-circle" size={22} color={COLORS.honeyGold} />
            <Text style={styles.addAddressText}>הוסף כתובת חדשה</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 16,
  },
  addressSelector: {
    flex: 1,
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
});
