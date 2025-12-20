// components/customer/BenefitQRDisplay.tsx
import { BenefitApiService } from "@/services/benefitApiService";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

const COLORS = {
  honeyGold: "#F4A259",
  amber: "#F2CC8F",
  lavenderBlush: "#E0BBE4",
  mint: "#81C6B5",
  deepPurple: "#2D1B3D",
  plum: "#422C50",
  midnight: "#1A1423",
  cream: "#FFF8E8",
  softWhite: "#F5F1E3",
  error: "#E07A7A",
  success: "#66C9B5",
  dustyRose: "#D4A5A5", // ✅ הוסף כאן
};

interface BenefitQRDisplayProps {
  visible: boolean;
  onClose: () => void;
}

export const BenefitQRDisplay: React.FC<BenefitQRDisplayProps> = ({
  visible,
  onClose,
}) => {
  const [displayCode, setDisplayCode] = useState("");
  const [qrData, setQrData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [benefitInfo, setBenefitInfo] = useState<any>(null);

  const handleGenerateQR = async () => {
    if (!displayCode.trim()) {
      setError("אנא הכנס קוד הטבה");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ שימוש ב-BenefitApiService
      const response = await BenefitApiService.getByDisplayCode(displayCode);

      if (!response.success) {
        throw new Error(response.error || "קוד לא נמצא במערכת");
      }

      // בדוק שההטבה פעילה
      if (response.data.customerBenefit.status !== "active") {
        throw new Error("ההטבה כבר מומשה או לא פעילה");
      }

      // בדוק שלא פג תוקף
      if (new Date() > new Date(response.data.customerBenefit.expiresAt)) {
        throw new Error("ההטבה פגת תוקף");
      }

      setQrData(response.data.customerBenefit.qrData);
      setBenefitInfo(response.data);
    } catch (err: any) {
      setError(err.message || "שגיאה בטעינת ההטבה");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDisplayCode("");
    setQrData(null);
    setBenefitInfo(null);
    setError("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={COLORS.cream} />
            </TouchableOpacity>
            <Text style={styles.title}>הצג QR להטבה</Text>
            <View style={{ width: 28 }} />
          </View>

          {!qrData ? (
            // Input Stage
            <View style={styles.inputStage}>
              <View style={styles.iconContainer}>
                <Ionicons name="qr-code" size={80} color={COLORS.honeyGold} />
              </View>

              <Text style={styles.instructionTitle}>הכנס את קוד ההטבה שלך</Text>
              <Text style={styles.instructionText}>
                הקוד שקיבלת כשיצרת את ההטבה
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="ticket"
                  size={20}
                  color={COLORS.dustyRose}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="לדוגמא: איתי_לוי_נכנסתי_רק__1cyi"
                  placeholderTextColor={COLORS.dustyRose}
                  value={displayCode}
                  onChangeText={(text) => {
                    setDisplayCode(text);
                    setError("");
                  }}
                  textAlign="right"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle"
                    size={20}
                    color={COLORS.error}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.generateButton,
                  !displayCode.trim() && styles.generateButtonDisabled,
                ]}
                onPress={handleGenerateQR}
                disabled={!displayCode.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.deepPurple} />
                ) : (
                  <>
                    <Ionicons
                      name="qr-code-outline"
                      size={24}
                      color={COLORS.deepPurple}
                    />
                    <Text style={styles.generateButtonText}>צור QR</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.tipBox}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={COLORS.mint}
                />
                <Text style={styles.tipText}>
                  הצג את ה-QR לבעל העסק לסריקה וקבלת ההטבה
                </Text>
              </View>
            </View>
          ) : (
            // QR Display Stage
            <View style={styles.qrStage}>
              <View style={styles.qrContainer}>
                <QRCode
                  value={qrData}
                  size={250}
                  backgroundColor="transparent"
                />
              </View>

              {benefitInfo && (
                <View style={styles.benefitInfoCard}>
                  <Text style={styles.benefitTitle}>
                    {benefitInfo.benefit.title}
                  </Text>
                  <Text style={styles.benefitDiscount}>
                    {benefitInfo.benefit.discount}
                  </Text>
                  <Text style={styles.benefitBusiness}>
                    {benefitInfo.business.name}
                  </Text>

                  <View style={styles.benefitDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="ticket" size={16} color={COLORS.mint} />
                      <Text style={styles.detailText}>{displayCode}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={16} color={COLORS.amber} />
                      <Text style={styles.detailText}>
                        תוקף עד:{" "}
                        {new Date(
                          benefitInfo.customerBenefit.expiresAt
                        ).toLocaleDateString("he-IL")}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.qrInstructions}>
                <Ionicons name="scan" size={32} color={COLORS.honeyGold} />
                <Text style={styles.qrInstructionTitle}>
                  הצג את הקוד לבעל העסק
                </Text>
                <Text style={styles.qrInstructionText}>
                  הוא יסרוק את הקוד באפליקציה שלו ותקבל את ההטבה מיד
                </Text>
              </View>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
              >
                <Ionicons name="refresh" size={20} color={COLORS.cream} />
                <Text style={styles.resetButtonText}>הטבה אחרת</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(26, 20, 35, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: COLORS.deepPurple,
    borderRadius: 30,
    padding: 24,
    borderWidth: 2,
    borderColor: COLORS.honeyGold + "40",
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.plum,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.cream,
  },
  inputStage: {
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.cream,
    marginBottom: 8,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.lavenderBlush,
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.plum,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.honeyGold + "30",
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.cream,
  },
  errorContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.error + "20",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
  generateButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.honeyGold,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    gap: 10,
    elevation: 5,
    shadowColor: COLORS.honeyGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  generateButtonDisabled: {
    backgroundColor: COLORS.dustyRose,
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.deepPurple,
  },
  tipBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.plum,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.mint + "30",
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.softWhite,
    textAlign: "right",
  },
  qrStage: {
    alignItems: "center",
  },
  qrContainer: {
    backgroundColor: COLORS.cream,
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    elevation: 10,
    shadowColor: COLORS.honeyGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  benefitInfoCard: {
    backgroundColor: COLORS.plum,
    padding: 20,
    borderRadius: 16,
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "20",
  },
  benefitTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.cream,
    marginBottom: 8,
    textAlign: "right",
  },
  benefitDiscount: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.honeyGold,
    marginBottom: 8,
    textAlign: "right",
  },
  benefitBusiness: {
    fontSize: 16,
    color: COLORS.lavenderBlush,
    marginBottom: 16,
    textAlign: "right",
  },
  benefitDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.softWhite,
  },
  qrInstructions: {
    alignItems: "center",
    marginBottom: 24,
  },
  qrInstructionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.cream,
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  qrInstructionText: {
    fontSize: 14,
    color: COLORS.lavenderBlush,
    textAlign: "center",
    lineHeight: 20,
  },
  resetButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.mint,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.cream,
  },
});
