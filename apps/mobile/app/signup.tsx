import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import {
  AuthService,
  validateEmail,
  validatePassword,
} from "../services/authService";
import { COLORS } from "@/colors/colors";



export default function SignupScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [userType, setUserType] = useState<"business" | "customer">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    return (
      name.trim() !== "" &&
      email.trim() !== "" &&
      password.trim() !== "" &&
      confirmPassword.trim() !== "" &&
      validateEmail(email) &&
      validatePassword(password).valid &&
      password === confirmPassword
    );
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { text: "חלשה", color: COLORS.error };
    if (password.length < 8) return { text: "בינונית", color: COLORS.amber };
    return { text: "חזקה", color: COLORS.mint };
  };

  const handleSignup = async () => {
    if (!isFormValid()) return;

    setError("");
    setLoading(true);

    const result = await AuthService.signup(email, password, name, userType);

    if (result.success && result.user) {
      // Navigate based on user type
      if (result.user.type === "business") {
        router.replace("/business-dashboard" as any);
      } else {
        router.replace("/homepage" as any);
      }
    } else {
      setError(result.error || "שגיאה ביצירת חשבון");
    }

    setLoading(false);
  };

  const passwordStrength = getPasswordStrength();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.deepPurple }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.deepPurple} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Animated.View
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.logo}>🍯</Text>
            <Text style={styles.title}>הצטרף ל-Nectar</Text>
            <Text style={styles.subtitle}>התחל לצבור תגמולים היום</Text>
          </View>

          {/* Error Message */}
          {error !== "" && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* User Type Selector */}
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "customer" && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType("customer")}
            >
              <Ionicons
                name="person"
                size={24}
                color={
                  userType === "customer" ? COLORS.deepPurple : COLORS.dustyRose
                }
              />
              <Text
                style={[
                  styles.userTypeText,
                  userType === "customer" && styles.userTypeTextActive,
                ]}
              >
                לקוח
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "business" && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType("business")}
            >
              <Ionicons
                name="business"
                size={24}
                color={
                  userType === "business" ? COLORS.deepPurple : COLORS.dustyRose
                }
              />
              <Text
                style={[
                  styles.userTypeText,
                  userType === "business" && styles.userTypeTextActive,
                ]}
              >
                בעל עסק
              </Text>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color={COLORS.dustyRose}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="שם מלא"
              placeholderTextColor={COLORS.dustyRose}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError("");
              }}
              textAlign="right"
            />
          </View>

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
                name={
                  validateEmail(email) ? "checkmark-circle" : "close-circle"
                }
                size={20}
                color={validateEmail(email) ? COLORS.mint : COLORS.error}
                style={styles.validationIcon}
              />
            )}
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

          {/* Password Strength Indicator */}
          {passwordStrength && (
            <View style={styles.passwordStrengthContainer}>
              <View
                style={[
                  styles.passwordStrengthBar,
                  { backgroundColor: passwordStrength.color },
                ]}
              />
              <Text
                style={[
                  styles.passwordStrengthText,
                  { color: passwordStrength.color },
                ]}
              >
                {passwordStrength.text}
              </Text>
            </View>
          )}

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={COLORS.dustyRose}
                style={styles.inputIcon}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="אימות סיסמה"
              placeholderTextColor={COLORS.dustyRose}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError("");
              }}
              secureTextEntry={!showConfirmPassword}
              textAlign="right"
            />
            {confirmPassword !== "" && (
              <Ionicons
                name={
                  password === confirmPassword
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={20}
                color={
                  password === confirmPassword ? COLORS.mint : COLORS.error
                }
                style={styles.validationIcon}
              />
            )}
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !isFormValid() && styles.primaryButtonDisabled,
            ]}
            onPress={handleSignup}
            disabled={!isFormValid() || loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.deepPurple} />
            ) : (
              <Text style={styles.primaryButtonText}>צור חשבון</Text>
            )}
          </TouchableOpacity>

          {/* Links */}
          <View style={styles.linksContainer}>
            <Text style={styles.questionText}>יש לך כבר חשבון?</Text>
            <TouchableOpacity onPress={() => router.push("/")}>
              <Text style={styles.linkText}>התחבר</Text>
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
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
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
  userTypeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.plum,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
    gap: 8,
  },
  userTypeButtonActive: {
    backgroundColor: COLORS.honeyGold,
    borderColor: COLORS.amber,
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.dustyRose,
  },
  userTypeTextActive: {
    color: COLORS.deepPurple,
    fontWeight: "800",
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
  validationIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.cream,
  },
  passwordStrengthContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  passwordStrengthBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 13,
    fontWeight: "600",
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
    gap: 8,
  },
  questionText: {
    color: COLORS.softWhite,
    fontSize: 15,
  },
  linkText: {
    color: COLORS.honeyGold,
    fontWeight: "700",
    fontSize: 15,
  },
});
