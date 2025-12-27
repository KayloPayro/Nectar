import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthService, validateEmail } from "../services/authService";

import { COLORS } from "@/colors/colors";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isFormValid = () => {
    return email.trim() !== "" && validateEmail(email);
  };

  const handleResetPassword = async () => {
    if (!isFormValid()) return;

    setError("");
    setLoading(true);

    const result = await AuthService.resetPassword(email);

    if (result.success) {
      setSuccess(true);
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } else {
      setError(result.error || "שגיאה בשליחת הקישור");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: COLORS.deepPurple, justifyContent: "center" },
        ]}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.deepPurple}
        />
        <Animated.View style={[styles.successContainer, { opacity: fadeAnim }]}>
          <View style={styles.successIconContainer}>
            <Ionicons
              name="checkmark-circle"
              size={80}
              color={COLORS.success}
            />
          </View>
          <Text style={styles.successTitle}>הקישור נשלח בהצלחה! ✉️</Text>
          <Text style={styles.successText}>
            שלחנו אליך קישור לאיפוס סיסמה ל:
          </Text>
          <Text style={styles.successEmail}>{email}</Text>
          <Text style={styles.successSubtext}>
            בדוק את תיבת הדואר שלך ועקוב אחר ההוראות
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/")}
          >
            <Text style={styles.backButtonText}>חזרה להתחברות</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.deepPurple }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.deepPurple} />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.headerBackButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-forward" size={24} color={COLORS.cream} />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={50} color={COLORS.honeyGold} />
          </View>
          <Text style={styles.title}>שכחת סיסמה?</Text>
          <Text style={styles.description}>
            אל דאגה! הכנס את האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
          </Text>
        </View>

        {/* Error Message */}
        {error !== "" && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={COLORS.dustyRose}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="אימייל"
            placeholderTextColor={COLORS.dustyRose}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            textAlign="right"
          />
          {email !== "" && (
            <Ionicons
              name={validateEmail(email) ? "checkmark-circle" : "close-circle"}
              size={20}
              color={validateEmail(email) ? COLORS.success : COLORS.error}
              style={styles.validationIcon}
            />
          )}
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            !isFormValid() && styles.primaryButtonDisabled,
          ]}
          onPress={handleResetPassword}
          disabled={!isFormValid() || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.deepPurple} />
          ) : (
            <>
              <Ionicons
                name="paper-plane"
                size={20}
                color={COLORS.deepPurple}
                style={{ marginLeft: 8 }}
              />
              <Text style={styles.primaryButtonText}>שלח קישור</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Link */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text style={styles.linkText}>חזרה להתחברות</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
    paddingVertical: 60,
  },
  headerBackButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.plum,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.plum,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.cream,
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: COLORS.dustyRose,
    textAlign: "center",
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.error + "20",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.plum,
    borderRadius: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.dustyRose + "30",
  },
  inputIcon: {
    marginLeft: 12,
  },
  validationIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.cream,
  },
  primaryButton: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.honeyGold,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    elevation: 5,
    shadowColor: COLORS.honeyGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.dustyRose,
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.deepPurple,
  },
  linksContainer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
  },
  linkText: {
    color: COLORS.amber,
    fontWeight: "600",
    fontSize: 15,
  },
  successContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.cream,
    marginBottom: 16,
    textAlign: "center",
  },
  successText: {
    fontSize: 16,
    color: COLORS.softWhite,
    textAlign: "center",
    marginBottom: 12,
  },
  successEmail: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.honeyGold,
    marginBottom: 12,
    textAlign: "center",
  },
  successSubtext: {
    fontSize: 14,
    color: COLORS.dustyRose,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: COLORS.honeyGold,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.deepPurple,
  },
});
