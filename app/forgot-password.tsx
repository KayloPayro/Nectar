// app/forgot-password.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.title}>שחזור סיסמה</Text>

        <Text style={styles.description}>
          הכנס את האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
        </Text>

        <TextInput
          style={styles.input}
          placeholder="אימייל"
          placeholderTextColor="#9A9A9A"
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => alert("Reset Password Pressed")}
        >
          <Animated.Text
            style={[
              styles.primaryButtonText,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            שלח קישור
          </Animated.Text>
        </TouchableOpacity>

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
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#22223B",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#4A4E69",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#22223B",
  },
  primaryButton: {
    backgroundColor: "#FFC857",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#22223B",
  },
  linksContainer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
  },
  linkText: {
    color: "#3D5A80",
    fontWeight: "600",
  },
});
