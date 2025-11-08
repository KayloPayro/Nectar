import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
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

export default function LoginScreen() {
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
        <Text style={styles.title}>ברוכים הבאים ל-Nectar</Text>

        <TextInput
          style={styles.input}
          placeholder="אימייל"
          placeholderTextColor="#9A9A9A"
        />
        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          placeholderTextColor="#9A9A9A"
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/homepage")}
        >
          <Text style={styles.primaryButtonText}>התחבר</Text>
        </TouchableOpacity>

        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => router.push("/forgot-password")}>
            <Text style={styles.linkText}>שכחתי סיסמה</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.linkText}>צור חשבון חדש</Text>
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
    marginBottom: 40,
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
    justifyContent: "space-between",
  },
  linkText: {
    color: "#3D5A80",
    fontWeight: "600",
  },
});
