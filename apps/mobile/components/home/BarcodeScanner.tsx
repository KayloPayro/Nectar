// components/home/BarcodeScanner.tsx
import { COLORS } from "@/colors/colors";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, PermissionResponse } from "expo-camera";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BarcodeScannerProps {
  visible: boolean;
  permission: PermissionResponse | null;
  onClose: () => void;
  onScan: (data: string) => void;
  onRequestPermission: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  visible,
  permission,
  onClose,
  onScan,
  onRequestPermission,
}) => {
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanLineAnim.setValue(0);
    }
  }, [visible]);

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.barcodeModal}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={({ data }) => onScan(data)}
            barcodeScannerSettings={{
              barcodeTypes: [
                "qr",
                "ean13",
                "ean8",
                "code128",
                "code39",
                "upc_a",
                "upc_e",
              ],
            }}
          />
        ) : (
          <View style={styles.permissionDenied}>
            <Ionicons name="camera-outline" size={64} color={COLORS.error} />
            <Text style={styles.permissionText}>אין הרשאה למצלמה</Text>
            <TouchableOpacity
              style={styles.requestPermissionButton}
              onPress={onRequestPermission}
            >
              <Text style={styles.requestPermissionText}>אפשר גישה</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Overlay */}
        <View style={styles.barcodeOverlay}>
          <View style={styles.overlayTop}>
            <Animated.View style={{ opacity: scanLineAnim }}>
              <View style={styles.instructionCard}>
                <Ionicons name="scan" size={40} color={COLORS.honeyGold} />
                <Text style={styles.instructionText}>
                  סרוק את הברקוד על השולחן
                </Text>
                <Text style={styles.instructionSubtext}>
                  והתחל להרוויח הטבות מתוקות 🍯
                </Text>
              </View>
            </Animated.View>
          </View>

          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />

            <View style={styles.scanBox}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />

              <Animated.View
                style={[
                  styles.hexagonContainer,
                  {
                    opacity: scanLineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.6],
                    }),
                  },
                ]}
              >
                <Text style={styles.hexagonText}>🐝</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanLineTranslateY }] },
                ]}
              >
                <View style={styles.scanLineGlow} />
              </Animated.View>
            </View>

            <View style={styles.overlaySide} />
          </View>

          <View style={styles.overlayBottom}>
            <Animated.View style={{ opacity: scanLineAnim }}>
              <View style={styles.tipCard}>
                <Ionicons name="bulb" size={20} color={COLORS.amber} />
                <Text style={styles.tipText}>
                  מקם את הברקוד במרכז המסגרת לסריקה מהירה
                </Text>
              </View>
            </Animated.View>
          </View>
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close-circle" size={28} color={COLORS.cream} />
          <Text style={styles.closeButtonText}>סגור</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  barcodeModal: {
    flex: 1,
    backgroundColor: COLORS.midnight,
  },
  permissionDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.deepPurple,
    padding: 20,
  },
  permissionText: {
    color: COLORS.cream,
    fontSize: 18,
    marginTop: 16,
    fontWeight: "600",
  },
  requestPermissionButton: {
    marginTop: 20,
    backgroundColor: COLORS.honeyGold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  requestPermissionText: {
    color: COLORS.deepPurple,
    fontSize: 16,
    fontWeight: "700",
  },
  barcodeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(26, 20, 35, 0.85)",
    width: "100%",
    justifyContent: "flex-end",
    paddingBottom: 30,
    alignItems: "center",
  },
  instructionCard: {
    backgroundColor: COLORS.deepPurple + "DD",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: COLORS.honeyGold + "40",
  },
  instructionText: {
    color: COLORS.cream,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  instructionSubtext: {
    color: COLORS.lavenderBlush,
    fontSize: 14,
    textAlign: "center",
  },
  overlayMiddle: {
    flexDirection: "row",
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(26, 20, 35, 0.85)",
  },
  scanBox: {
    width: 280,
    height: 220,
    backgroundColor: "transparent",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 50,
    height: 50,
    borderColor: COLORS.honeyGold,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 12,
  },
  hexagonContainer: {
    opacity: 0.3,
  },
  hexagonText: {
    fontSize: 60,
  },
  scanLine: {
    position: "absolute",
    width: "90%",
    height: 3,
    backgroundColor: COLORS.mint,
    shadowColor: COLORS.mint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    borderRadius: 2,
  },
  scanLineGlow: {
    width: "100%",
    height: 20,
    backgroundColor: COLORS.mint,
    opacity: 0.3,
    borderRadius: 10,
    marginTop: -8.5,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(26, 20, 35, 0.85)",
    width: "100%",
    justifyContent: "flex-start",
    paddingTop: 30,
    alignItems: "center",
  },
  tipCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.deepPurple + "DD",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.amber + "30",
  },
  tipText: {
    flex: 1,
    color: COLORS.softWhite,
    fontSize: 13,
    textAlign: "right",
  },
  closeButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButtonText: {
    color: COLORS.cream,
    fontSize: 18,
    fontWeight: "800",
  },
});
