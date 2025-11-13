import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthService } from "../../services/authService"; // ✅ שימוש נכון לפי המבנה שלך

export default function MainScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      Alert.alert("התנתקת בהצלחה");

      // לאחר ההתנתקות, ננווט חזרה למסך ההתחברות
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("שגיאה", "משהו השתבש במהלך ההתנתקות");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ברוכים הבאים ל-Nectar</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.buttonText}>התחברות</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#84A59D" }]}
        onPress={() => router.push("/homepage")}
      >
        <Text style={styles.buttonText}>אפליקציה</Text>
      </TouchableOpacity>

      {/* כפתור ההתנתקות */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#E76F51" }]}
        onPress={handleLogout}
      >
        <Text style={[styles.buttonText, { color: "#FFF" }]}>התנתק</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 40,
    color: "#22223B",
  },
  button: {
    backgroundColor: "#FFC857",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#22223B",
  },
});
