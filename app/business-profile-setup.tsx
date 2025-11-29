// app/business-profile-setup.tsx
import { BusinessApiService } from "@/services/businessApiService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthService } from "../services/authService";

const COLORS = {
  honeyGold: "#F4A259",
  amber: "#F2CC8F",
  lavenderBlush: "#E0BBE4",
  mint: "#81C6B5",
  deepPurple: "#2D1B3D",
  plum: "#422C50",
  cream: "#FFF8E8",
  dustyRose: "#D4A5A5",
  error: "#E07A7A",
};

const CATEGORIES = [
  "מסעדה",
  "בית קפה",
  "אופנה",
  "טכנולוגיה",
  "ספורט",
  "בריאות",
  "יופי",
  "חינוך",
  "אחר",
];

export default function BusinessProfileSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("https://picsum.photos/400/300");
  const [tags, setTags] = useState("");

  const isFormValid = () => {
    return (
      name.trim() !== "" &&
      description.trim() !== "" &&
      category !== "" &&
      address.trim() !== "" &&
      phone.trim() !== ""
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert("שגיאה", "אנא מלא את כל השדות החובה");
      return;
    }

    setLoading(true);

    const user = await AuthService.getCurrentUser();
    if (!user) {
      Alert.alert("שגיאה", "לא נמצא משתמש מחובר");
      router.replace("/" as any);
      return;
    }

    console.log("📝 User ID:", user.id);

    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    // ✅ מבנה נכון לפי מה שהשרת מצפה
    const businessData = {
      name,
      description,
      category,
      address: {
        street: "רחוב רוטשילד 45",
        city: "תל אביב",
        coordinates: {
          lat: 32.0656,
          lng: 34.7748,
        },
      },
      phone,
      email: email || user.email,
      image,
      tags: tagsArray,
      openingHours: {
        sunday: { open: "09:00", close: "18:00" },
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "14:00" },
        saturday: { open: "09:00", close: "18:00", closed: true },
      },
    };

    console.log("📤 Sending business data:", businessData);

    const result = await BusinessApiService.registerBusiness(businessData);

    setLoading(false);

    if (result.success) {
      console.log("✅ Business created successfully!");
      Alert.alert("הצלחה!", "הפרופיל נוצר בהצלחה", [
        {
          text: "אישור",
          onPress: () => router.replace("/business-dashboard" as any),
        },
      ]);
    } else {
      console.error("❌ Failed to create business:", result.error);
      Alert.alert("שגיאה", result.error || "שגיאה ביצירת פרופיל");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.deepPurple }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.deepPurple} />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-forward" size={24} color={COLORS.cream} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>יצירת פרופיל עסק</Text>
        </View>

        <View style={styles.content}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              שם העסק <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="storefront"
                size={20}
                color={COLORS.dustyRose}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="לדוגמא: קפה נקטר"
                placeholderTextColor={COLORS.dustyRose}
                value={name}
                onChangeText={setName}
                textAlign="right"
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              תיאור <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, { alignItems: "flex-start" }]}>
              <Ionicons
                name="document-text"
                size={20}
                color={COLORS.dustyRose}
                style={[styles.inputIcon, { marginTop: 12 }]}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="תאר את העסק שלך..."
                placeholderTextColor={COLORS.dustyRose}
                value={description}
                onChangeText={setDescription}
                textAlign="right"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              קטגוריה <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.categoriesContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              כתובת <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="location"
                size={20}
                color={COLORS.dustyRose}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="לדוגמא: רחוב הרצל 10, תל אביב"
                placeholderTextColor={COLORS.dustyRose}
                value={address}
                onChangeText={setAddress}
                textAlign="right"
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              טלפון <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="call"
                size={20}
                color={COLORS.dustyRose}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="לדוגמא: 03-1234567"
                placeholderTextColor={COLORS.dustyRose}
                value={phone}
                onChangeText={setPhone}
                textAlign="right"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>אימייל (אופציונלי)</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail"
                size={20}
                color={COLORS.dustyRose}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="business@example.com"
                placeholderTextColor={COLORS.dustyRose}
                value={email}
                onChangeText={setEmail}
                textAlign="right"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>תגיות (הפרד בפסיקים)</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="pricetag"
                size={20}
                color={COLORS.dustyRose}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="לדוגמא: קפה, בריסטה, ארוחת בוקר"
                placeholderTextColor={COLORS.dustyRose}
                value={tags}
                onChangeText={setTags}
                textAlign="right"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isFormValid() && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid() || loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.deepPurple} />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={COLORS.deepPurple}
                />
                <Text style={styles.submitButtonText}>צור פרופיל</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepPurple,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 20,
    paddingTop: 16,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.plum,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.cream,
    textAlign: "right",
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.cream,
    marginBottom: 8,
    textAlign: "right",
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.plum,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "30",
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.cream,
  },
  textArea: {
    paddingTop: 14,
    paddingBottom: 14,
    minHeight: 100,
    textAlignVertical: "top",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.plum,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "30",
  },
  categoryChipActive: {
    backgroundColor: COLORS.honeyGold,
    borderColor: COLORS.amber,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dustyRose,
  },
  categoryChipTextActive: {
    color: COLORS.deepPurple,
    fontWeight: "800",
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: COLORS.honeyGold,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
    elevation: 5,
    shadowColor: COLORS.honeyGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.dustyRose,
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.deepPurple,
  },
});
