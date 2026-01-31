// app/qr-scanner.tsx
import { COLORS } from "@/colors/colors";
import { BenefitApiService } from "@/services/benefitApiService";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

type ScanResult = {
  success: boolean;
  message: string;
  details?: string;
};

export default function QRScanner() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (result) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      fadeAnim.setValue(0);

      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [result]);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);
    Vibration.vibrate(100);

    console.log("📷 QR Code scanned:", data);

    try {
      const apiResult = await BenefitApiService.validateBenefit(data);

      if (apiResult.success) {
        // הצלחה! 🎉
        Vibration.vibrate([0, 100, 100, 100]);
        setResult({
          success: true,
          message: "הטבה מומשה בהצלחה!",
          details: `${apiResult.data.benefit.title} • ${apiResult.data.benefit.discount}`,
        });
      } else {
        // כישלון
        Vibration.vibrate([0, 200, 100, 200]);
        setResult({
          success: false,
          message: "שגיאה באימות הקוד",
          details: apiResult.error || "לא ניתן לאמת את הקוד",
        });
      }
    } catch (error) {
      console.error("❌ Scan error:", error);
      Vibration.vibrate([0, 200, 100, 200]);
      setResult({
        success: false,
        message: "שגיאה בסריקה",
        details: "אירעה שגיאה בסריקת הקוד",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setScanned(false);
    setLoading(false);
  };

  const handleDone = () => {
    router.back();
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.deepPurple}
        />
        <ActivityIndicator size="large" color={COLORS.honeyGold} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.deepPurple}
        />
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={80} color={COLORS.dustyRose} />
          <Text style={styles.permissionTitle}>נדרשת הרשאה למצלמה</Text>
          <Text style={styles.permissionText}>
            כדי לסרוק קודי QR, נדרשת גישה למצלמה
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Ionicons name="camera" size={24} color={COLORS.deepPurple} />
            <Text style={styles.permissionButtonText}>אפשר גישה למצלמה</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButtonAlt}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonAltText}>חזור</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: result?.success ? ["0deg", "360deg"] : ["0deg", "180deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.deepPurple} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-forward" size={28} color={COLORS.cream} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>סריקת קוד הטבה</Text>
        <TouchableOpacity
          style={styles.flashButton}
          onPress={() => setFlashOn(!flashOn)}
        >
          <Ionicons
            name={flashOn ? "flash" : "flash-outline"}
            size={28}
            color={COLORS.cream}
          />
        </TouchableOpacity>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          enableTorch={flashOn}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          {/* Scanning Overlay */}
          <View style={styles.overlay}>
            <View style={styles.topOverlay} />
            <View style={styles.middleRow}>
              <View style={styles.sideOverlay} />
              <View style={styles.scanArea}>
                {/* Corner borders */}
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />

                {loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.honeyGold} />
                    <Text style={styles.loadingText}>מאמת קוד...</Text>
                  </View>
                )}
              </View>
              <View style={styles.sideOverlay} />
            </View>
            <View style={styles.bottomOverlay}>
              <Text style={styles.instructionText}>
                {scanned
                  ? "ממתין לתוצאות..."
                  : "מרכז את קוד ה-QR בתוך המסגרת"}
              </Text>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Result Overlay */}
      {result && (
        <Animated.View
          style={[
            styles.resultOverlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View
            style={[
              styles.resultCard,
              result.success ? styles.resultSuccess : styles.resultError,
            ]}
          >
            {/* Icon with Animation */}
            <Animated.View
              style={[
                styles.iconContainer,
                result.success
                  ? styles.iconContainerSuccess
                  : styles.iconContainerError,
                {
                  transform: [{ scale: scaleAnim }, { rotate: rotation }],
                },
              ]}
            >
              {result.success ? (
                <Ionicons
                  name="checkmark"
                  size={80}
                  color={COLORS.deepPurple}
                />
              ) : (
                <Ionicons name="close" size={80} color={COLORS.deepPurple} />
              )}
            </Animated.View>

            {/* Message */}
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={styles.resultTitle}>{result.message}</Text>
              {result.details && (
                <Text style={styles.resultDetails}>{result.details}</Text>
              )}
            </Animated.View>

            {/* Buttons */}
            <Animated.View
              style={[styles.resultButtons, { opacity: fadeAnim }]}
            >
              <TouchableOpacity
                style={[
                  styles.resultButton,
                  styles.resultButtonPrimary,
                  result.success
                    ? styles.resultButtonSuccess
                    : styles.resultButtonError,
                ]}
                onPress={result.success ? handleDone : handleReset}
              >
                <Text style={styles.resultButtonText}>
                  {result.success ? "סיום" : "נסה שוב"}
                </Text>
              </TouchableOpacity>

              {result.success && (
                <TouchableOpacity
                  style={[styles.resultButton, styles.resultButtonSecondary]}
                  onPress={handleReset}
                >
                  <Text style={styles.resultButtonTextSecondary}>
                    סרוק עוד
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
        </Animated.View>
      )}

      {/* Instructions */}
      {!result && (
        <View style={styles.instructions}>
          <View style={styles.instructionItem}>
            <Ionicons
              name="qr-code-outline"
              size={24}
              color={COLORS.honeyGold}
            />
            <Text style={styles.instructionItemText}>
              בקש מהלקוח להציג את קוד ה-QR
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={COLORS.mint}
            />
            <Text style={styles.instructionItemText}>
              הקוד יאומת אוטומטית לאחר הסריקה
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons
              name="close-circle-outline"
              size={24}
              color={COLORS.error}
            />
            <Text style={styles.instructionItemText}>
              קודים שכבר נוצלו יידחו
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepPurple,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.deepPurple,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
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
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.cream,
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.plum,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  middleRow: {
    flexDirection: "row",
    height: 300,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  scanArea: {
    width: 300,
    height: 300,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.honeyGold,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: COLORS.honeyGold,
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.cream,
    fontSize: 16,
    marginTop: 10,
    fontWeight: "800",
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  instructionText: {
    color: COLORS.cream,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    fontWeight: "600",
  },
  instructions: {
    backgroundColor: COLORS.plum,
    padding: 20,
    gap: 15,
  },
  instructionItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 15,
  },
  instructionItemText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.cream,
    textAlign: "right",
    fontWeight: "600",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.cream,
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.dustyRose,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    flexDirection: "row",
    backgroundColor: COLORS.honeyGold,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    elevation: 5,
    shadowColor: COLORS.honeyGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  permissionButtonText: {
    color: COLORS.deepPurple,
    fontSize: 18,
    fontWeight: "800",
  },
  backButtonAlt: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonAltText: {
    color: COLORS.dustyRose,
    fontSize: 16,
    fontWeight: "600",
  },
  // Result Overlay Styles
  resultOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 32,
    padding: 40,
    alignItems: "center",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  resultSuccess: {
    backgroundColor: COLORS.mint,
  },
  resultError: {
    backgroundColor: COLORS.error,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  iconContainerSuccess: {
    backgroundColor: COLORS.honeyGold,
  },
  iconContainerError: {
    backgroundColor: COLORS.cream,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.deepPurple,
    textAlign: "center",
    marginBottom: 12,
  },
  resultDetails: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.plum,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 26,
  },
  resultButtons: {
    width: "100%",
    gap: 12,
  },
  resultButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  resultButtonPrimary: {
    backgroundColor: COLORS.deepPurple,
  },
  resultButtonSuccess: {
    backgroundColor: COLORS.deepPurple,
  },
  resultButtonError: {
    backgroundColor: COLORS.deepPurple,
  },
  resultButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.deepPurple,
    elevation: 0,
  },
  resultButtonText: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.cream,
  },
  resultButtonTextSecondary: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.deepPurple,
  },
});