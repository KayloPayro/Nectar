import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MainScreen() {
  const router = useRouter();

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
