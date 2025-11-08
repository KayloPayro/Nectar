import UserTypeSelector from "@/components/UserTypeSelector";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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

export default function SignupScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [userType, setUserType] = useState<"business" | "customer">("customer");

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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Animated.View
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.title}>צור חשבון חדש</Text>

          {/* בחירת סוג משתמש */}
          <UserTypeSelector onSelect={(type) => setUserType(type)} />

          {/* שדות טופס */}
          <TextInput
            style={styles.input}
            placeholder="שם מהומווווווווווולא"
            placeholderTextColor="#9A9A9A"
          />
          <TextInput
            style={styles.input}
            placeholder="אימייל"
            placeholderTextColor="#9A9A9A"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="סיסמה"
            placeholderTextColor="#9A9A9A"
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="אימות סיסמה"
            placeholderTextColor="#9A9A9A"
            secureTextEntry
          />

          {/* כפתור הרשמה */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => alert(`Signup as ${userType}`)}
          >
            <Animated.Text style={[styles.primaryButtonText]}>
              צור חשבון
            </Animated.Text>
          </TouchableOpacity>

          {/* קישורים */}
          <View style={styles.linksContainer}>
            <Text style={{ color: "#4A4E69" }}>יש לך כבר חשבון?</Text>
            <TouchableOpacity onPress={() => router.push("/")}>
              <Animated.Text style={styles.linkText}>התחבר</Animated.Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
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
  primaryButtonText: { fontSize: 18, fontWeight: "700", color: "#22223B" },
  linksContainer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  linkText: { color: "#3D5A80", fontWeight: "600" },
});
