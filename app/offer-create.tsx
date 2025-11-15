// app/offer-create.tsx
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
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthService } from "../services/authService";
import { BusinessService } from "../services/businessService";

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

export default function OfferCreate() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [terms, setTerms] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [hasMaxUsage, setHasMaxUsage] = useState(false);
  const [maxUsage, setMaxUsage] = useState("");

  const isFormValid = () => {
    return (
      title.trim() !== "" &&
      description.trim() !== "" &&
      discount.trim() !== "" &&
      validUntil.trim() !== ""
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
      router.replace("/" as any);
      return;
    }

    const businessProfile = await BusinessService.getBusinessByOwnerId(user.id);
    if (!businessProfile) {
      Alert.alert("שגיאה", "פרופיל העסק לא נמצא");
      setLoading(false);
      return;
    }

    const result = await BusinessService.createOffer(businessProfile.id, {
      title,
      description,
      discount,
      validUntil: new Date(validUntil).toISOString(),
      terms: terms || "אין תנאים מיוחדים",
      isActive,
      maxUsage: hasMaxUsage && maxUsage ? parseInt(maxUsage) : undefined,
    });

    setLoading(false);

    if (result.success) {
      Alert.alert("הצלחה!", "ההטבה נוצרה בהצלחה", [
        {
          text: "אישור",
          onPress: () => router.back(),
        },
      ]);
    } else {
      Alert.alert("שגיאה", result.error);
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
          <Text style={styles.headerTitle}>יצירת הטבה חדשה</Text>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              כותרת <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="gift"
                size={20}
                color={COLORS.dustyRose}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="לדוגמא: 20% הנחה על כל התפריט"
                placeholderTextColor={COLORS.dustyRose}
                value={title}
                onChangeText={setTitle}
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
                placeholder="תאר את ההטבה בפירוט..."
                placeholderTextColor={COLORS.dustyRose}
                value={description}
                onChangeText={setDescription}
                textAlign="right"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Discount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              גובה ההנחה <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="pricetag"
                size={20}
                color={COLORS.dustyRose}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="לדוגמא: 20% או 50 ש״ח"
                placeholderTextColor={COLORS.dustyRose}
                value={discount}
                onChangeText={setDiscount}
                textAlign="right"
              />
            </View>
          </View>

          {/* Valid Until */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              תוקף עד <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="calendar"
                size={20}
                color={COLORS.dustyRose}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="לדוגמא: 2025-12-31"
                placeholderTextColor={COLORS.dustyRose}
                value={validUntil}
                onChangeText={setValidUntil}
                textAlign="right"
              />
            </View>
            <Text style={styles.hint}>פורמט: YYYY-MM-DD</Text>
          </View>

          {/* Terms */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>תנאים (אופציונלי)</Text>
            <View style={[styles.inputContainer, { alignItems: "flex-start" }]}>
              <Ionicons
                name="list"
                size={20}
                color={COLORS.dustyRose}
                style={[styles.inputIcon, { marginTop: 12 }]}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="תנאי השימוש בהטבה..."
                placeholderTextColor={COLORS.dustyRose}
                value={terms}
                onChangeText={setTerms}
                textAlign="right"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Is Active */}
          <View style={styles.switchGroup}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.label}>הטבה פעילה</Text>
              <Text style={styles.hint}>האם להציג ללקוחות מיד?</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: COLORS.dustyRose, true: COLORS.mint }}
              thumbColor={isActive ? COLORS.cream : COLORS.plum}
            />
          </View>

          {/* Max Usage */}
          <View style={styles.switchGroup}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.label}>הגבלת שימושים</Text>
              <Text style={styles.hint}>מספר מקסימלי של פדיונות</Text>
            </View>
            <Switch
              value={hasMaxUsage}
              onValueChange={setHasMaxUsage}
              trackColor={{ false: COLORS.dustyRose, true: COLORS.mint }}
              thumbColor={hasMaxUsage ? COLORS.cream : COLORS.plum}
            />
          </View>

          {hasMaxUsage && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>מספר שימושים מקסימלי</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="people"
                  size={20}
                  color={COLORS.dustyRose}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="לדוגמא: 100"
                  placeholderTextColor={COLORS.dustyRose}
                  value={maxUsage}
                  onChangeText={setMaxUsage}
                  textAlign="right"
                  keyboardType="number-pad"
                />
              </View>
            </View>
          )}

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
                <Text style={styles.submitButtonText}>צור הטבה</Text>
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
  hint: {
    fontSize: 13,
    color: COLORS.dustyRose,
    marginTop: 6,
    textAlign: "right",
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
  switchGroup: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.plum,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "30",
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
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
