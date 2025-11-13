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

const COLORS = {
  honeyGold: "#F4A259",
  amber: "#F2CC8F",
  deepPurple: "#2D1B3D",
  plum: "#422C50",
  cream: "#FFF8E8",
  softWhite: "#F5F1E3",
  dustyRose: "#D4A5A5",
  error: "#E07A7A",
  success: "#66C9B5",
};

export default function LoginScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkIfLoggedIn();
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

  const checkIfLoggedIn = async () => {
    await AuthService.init();
    const isLoggedIn = await AuthService.isLoggedIn();
    if (isLoggedIn) {
      router.replace("/homepage" as any);
    }
    setCheckingAuth(false);
  };

  const isFormValid = () => {
    return (
      email.trim() !== "" && password.trim() !== "" && validateEmail(email)
    );
  };

  const handleLogin = async () => {
    if (!isFormValid()) return;

    setError("");
    setLoading(true);

    const result = await AuthService.login(email, password);

    if (result.success) {
      router.replace("/homepage" as any);
    } else {
      setError(result.error || "שגיאה בהתחברות");
      // Shake animation
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }

    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.deepPurple,
          },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.honeyGold} />
        <Text style={[styles.title, { color: COLORS.cream, marginTop: 20 }]}>
          טוען...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.deepPurple }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.deepPurple} />
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Logo/Title */}
        <View style={styles.headerContainer}>
          <Text style={styles.logo}>🍯</Text>
          <Text style={styles.title}>ברוכים הבאים ל-Nectar</Text>
          <Text style={styles.subtitle}>שתף וזכה בתגמולים מתוקים</Text>
        </View>

        {/* Error Message */}
        {error !== "" && (
          <Animated.View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
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
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={COLORS.dustyRose}
              style={styles.inputIcon}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="סיסמה"
            placeholderTextColor={COLORS.dustyRose}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError("");
            }}
            secureTextEntry={!showPassword}
            textAlign="right"
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            !isFormValid() && styles.primaryButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={!isFormValid() || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.deepPurple} />
          ) : (
            <Text style={styles.primaryButtonText}>התחבר</Text>
          )}
        </TouchableOpacity>

        {/* Links */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => router.push("/forgot-password")}>
            <Text style={styles.linkText}>שכחתי סיסמה</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={[styles.linkText, styles.signupLink]}>
              צור חשבון חדש
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo Credentials */}
        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>🎯 חשבון דמו לבדיקה:</Text>
          <Text style={styles.demoText}>אימייל: test@nectar.com</Text>
          <Text style={styles.demoText}>סיסמה: 123456</Text>
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
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.cream,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.dustyRose,
    textAlign: "center",
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
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.dustyRose + "30",
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
  primaryButton: {
    backgroundColor: COLORS.honeyGold,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
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
    alignItems: "center",
    gap: 16,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.dustyRose,
  },
  linkText: {
    color: COLORS.amber,
    fontWeight: "600",
    fontSize: 15,
  },
  signupLink: {
    color: COLORS.honeyGold,
    fontWeight: "700",
  },
  demoContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: COLORS.plum + "80",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.honeyGold + "30",
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.honeyGold,
    marginBottom: 8,
    textAlign: "center",
  },
  demoText: {
    fontSize: 13,
    color: COLORS.softWhite,
    textAlign: "center",
    marginTop: 4,
  },
});
