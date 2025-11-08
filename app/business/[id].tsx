import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getDistance } from "geolib";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Clipboard,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import businessData from "../../data/businesses.json";

const { width, height } = Dimensions.get("window");

// Nectar Colors
const COLORS = {
  honeyGold: "#F4A259",
  amber: "#F2CC8F",
  lavenderBlush: "#E0BBE4",
  mint: "#81C6B5",
  sage: "#A8DADC",
  deepPurple: "#2D1B3D",
  plum: "#422C50",
  midnight: "#1A1423",
  cream: "#FFF8E8",
  softWhite: "#F5F1E3",
  dustyRose: "#D4A5A5",
  success: "#66C9B5",
  error: "#E07A7A",
};

interface Offer {
  id: string;
  title: string;
  description: string;
  reward: string;
  requiredReferrals: number;
  image: string;
  terms: string;
}

interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  image: string;
  logo: string;
  rating: number;
  reviewCount: number;
  coordinates: { lat: number; lng: number };
  tags: string[];
  offers: Offer[];
}

export default function BusinessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [couponName, setCouponName] = useState("USER123");
  const [showTerms, setShowTerms] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  // Load business from JSON
  useEffect(() => {
    console.log("Looking for business ID:", businessId);
    console.log(
      "Available businesses:",
      businessData.map((b) => ({ id: b.id, name: b.name }))
    );

    const foundBusiness = businessData.find((b) => b.id === businessId);

    if (foundBusiness) {
      console.log("Found business:", foundBusiness.name);
      console.log("Business offers:", foundBusiness.offers);
      setBusiness(foundBusiness as any);
    } else {
      console.log("Business not found!");
      alert("העסק לא נמצא");
      router.back();
    }
  }, [businessId]);

  useEffect(() => {
    if (bottomSheetVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [bottomSheetVisible]);

  useEffect(() => {
    if (successModalVisible) {
      Animated.sequence([
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [successModalVisible]);

  const handleCreateCode = () => {
    if (!acceptedTerms || !couponName.trim()) return;

    // Generate code
    const code = `NECTAR-${couponName.toUpperCase()}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;
    setGeneratedCode(code);
    setBottomSheetVisible(false);
    setSuccessModalVisible(true);
  };

  const handleCopyCode = () => {
    Clipboard.setString(generatedCode);
    alert("הקוד הועתק ללוח! 📋");
  };

  const handleOfferPress = (offer: Offer) => {
    setSelectedOffer(offer);
    setAcceptedTerms(false);
    setShowTerms(false);
    setBottomSheetVisible(true);
  };

  if (!business) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={styles.businessName}>טוען...</Text>
      </View>
    );
  }

  const distance = getDistance(
    { latitude: 32.0853, longitude: 34.7818 },
    business.coordinates
  );

  const renderOfferCard = ({ item }: { item: Offer }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => handleOfferPress(item)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.offerImage} />
      <View style={styles.offerOverlay} />

      <View style={styles.offerContent}>
        <View style={styles.offerBadge}>
          <Ionicons name="gift" size={16} color={COLORS.deepPurple} />
          <Text style={styles.offerBadgeText}>
            {item.requiredReferrals} חברים
          </Text>
        </View>

        <Text style={styles.offerTitle}>{item.title}</Text>
        <Text style={styles.offerDescription}>{item.description}</Text>

        <View style={styles.offerReward}>
          <Ionicons name="trophy" size={18} color={COLORS.honeyGold} />
          <Text style={styles.offerRewardText}>{item.reward}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.deepPurple} />

      {/* Header with Image */}
      <View style={styles.headerImageContainer}>
        <Image source={{ uri: business.image }} style={styles.headerImage} />
        <View style={styles.headerOverlay} />

        {/* Top Actions */}
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-forward" size={24} color={COLORS.cream} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? COLORS.error : COLORS.cream}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Business Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={styles.logoContainer}>
              <Image source={{ uri: business.logo }} style={styles.logo} />
            </View>
            <View style={styles.titleContent}>
              <Text style={styles.businessName}>{business.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={18} color={COLORS.honeyGold} />
                <Text style={styles.rating}>{business.rating}</Text>
                <Text style={styles.reviewCount}>
                  ({business.reviewCount} ביקורות)
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.description}>{business.description}</Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={20} color={COLORS.sage} />
              <Text style={styles.detailText}>{business.address}</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="navigate" size={20} color={COLORS.mint} />
              <Text style={styles.detailText}>
                {(distance / 1000).toFixed(1)} ק"מ ממך
              </Text>
            </View>
          </View>
        </View>

        {/* Offers Section */}
        <View style={styles.offersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎁 חבילות שיווק</Text>
            <Text style={styles.sectionSubtitle}>
              בחר הצעה ושתף עם חברים כדי לזכות בתגמולים
            </Text>
          </View>

          {business.offers && business.offers.length > 0 ? (
            <FlatList
              data={business.offers}
              renderItem={renderOfferCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.offersList}
            />
          ) : (
            <View style={styles.noOffersContainer}>
              <Text style={styles.noOffersText}>אין הצעות זמינות כרגע</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sheet */}
      {bottomSheetVisible && selectedOffer && (
        <Animated.View
          style={[styles.bottomSheetOverlay, { opacity: fadeAnim }]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setBottomSheetVisible(false)}
          />
        </Animated.View>
      )}

      {bottomSheetVisible && selectedOffer && (
        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sheetHandle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>{selectedOffer.title}</Text>
              <Text style={styles.sheetDescription}>
                {selectedOffer.description}
              </Text>

              <View style={styles.rewardBox}>
                <Ionicons name="gift" size={32} color={COLORS.honeyGold} />
                <View style={styles.rewardContent}>
                  <Text style={styles.rewardLabel}>התגמול שלך:</Text>
                  <Text style={styles.rewardValue}>{selectedOffer.reward}</Text>
                </View>
              </View>

              <View style={styles.requirementBox}>
                <Ionicons name="people" size={24} color={COLORS.mint} />
                <Text style={styles.requirementText}>
                  הזמן {selectedOffer.requiredReferrals} חברים וקבל את התגמול
                </Text>
              </View>

              {/* Terms & Conditions */}
              <TouchableOpacity
                style={styles.termsToggle}
                onPress={() => setShowTerms(!showTerms)}
              >
                <Text style={styles.termsToggleText}>תנאים והגבלות</Text>
                <Ionicons
                  name={showTerms ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={COLORS.dustyRose}
                />
              </TouchableOpacity>

              {showTerms && (
                <View style={styles.termsContent}>
                  <Text style={styles.termsText}>{selectedOffer.terms}</Text>
                </View>
              )}

              {/* Code Name Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>שם הקוד שלך (אופציונלי):</Text>
                <TextInput
                  style={styles.input}
                  value={couponName}
                  onChangeText={setCouponName}
                  placeholder="למשל: YOSSI2024"
                  placeholderTextColor={COLORS.dustyRose}
                  maxLength={20}
                />
              </View>

              {/* Accept Terms Checkbox */}
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    acceptedTerms && styles.checkboxBoxActive,
                  ]}
                >
                  {acceptedTerms && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={COLORS.deepPurple}
                    />
                  )}
                </View>
                <Text style={styles.checkboxText}>
                  קראתי והבנתי את התנאים וההגבלות
                </Text>
              </TouchableOpacity>

              {/* Create Code Button */}
              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!acceptedTerms || !couponName.trim()) &&
                    styles.createButtonDisabled,
                ]}
                onPress={handleCreateCode}
                disabled={!acceptedTerms || !couponName.trim()}
              >
                <Ionicons name="create" size={22} color={COLORS.deepPurple} />
                <Text style={styles.createButtonText}>צור קוד שיתוף</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.successOverlay}>
          <Animated.View
            style={[styles.successModal, { opacity: confettiAnim }]}
          >
            <Text style={styles.confetti}>🎉</Text>
          </Animated.View>

          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <Ionicons
                name="checkmark-circle"
                size={80}
                color={COLORS.success}
              />
            </View>

            <Text style={styles.successTitle}>הקוד נוצר בהצלחה!</Text>
            <Text style={styles.successSubtitle}>
              שתף את הקוד עם חברים והתחל לצבור תגמולים
            </Text>

            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>הקוד שלך:</Text>
              <Text style={styles.codeText}>{generatedCode}</Text>
            </View>

            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyCode}
            >
              <Ionicons name="copy" size={20} color={COLORS.cream} />
              <Text style={styles.copyButtonText}>העתק קוד</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton}>
              <Ionicons
                name="share-social"
                size={20}
                color={COLORS.deepPurple}
              />
              <Text style={styles.shareButtonText}>שתף ברשתות חברתיות</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeSuccessButton}
              onPress={() => {
                setSuccessModalVisible(false);
                router.back();
              }}
            >
              <Text style={styles.closeSuccessText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  noOffersContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  noOffersText: {
    fontSize: 16,
    color: COLORS.lavenderBlush,
    textAlign: "center",
    opacity: 0.8,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.deepPurple,
  },
  headerImageContainer: {
    height: 280,
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(29, 27, 61, 0.4)",
  },
  topActions: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.plum + "CC",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.deepPurple,
  },
  infoSection: {
    padding: 20,
    backgroundColor: COLORS.plum,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  titleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: COLORS.honeyGold,
    marginLeft: 16,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  titleContent: {
    flex: 1,
    alignItems: "flex-end",
  },
  businessName: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.cream,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rating: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.cream,
  },
  reviewCount: {
    fontSize: 14,
    color: COLORS.dustyRose,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.lavenderBlush,
    marginBottom: 20,
    textAlign: "right",
  },
  detailsRow: {
    gap: 12,
  },
  detailItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.softWhite,
    flex: 1,
    textAlign: "right",
  },
  offersSection: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.cream,
    marginBottom: 8,
    textAlign: "right",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.lavenderBlush,
    textAlign: "right",
  },
  offersList: {
    gap: 16,
  },
  offerCard: {
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.plum,
  },
  offerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  offerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(29, 27, 61, 0.75)",
  },
  offerContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  offerBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.honeyGold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  offerBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.deepPurple,
  },
  offerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.cream,
    textAlign: "right",
  },
  offerDescription: {
    fontSize: 15,
    color: COLORS.lavenderBlush,
    textAlign: "right",
  },
  offerReward: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  offerRewardText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.honeyGold,
  },
  bottomSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.plum,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.85,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 50,
    height: 5,
    backgroundColor: COLORS.dustyRose,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetContent: {
    padding: 24,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.cream,
    marginBottom: 12,
    textAlign: "right",
  },
  sheetDescription: {
    fontSize: 16,
    color: COLORS.lavenderBlush,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "right",
  },
  rewardBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.deepPurple,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    gap: 16,
  },
  rewardContent: {
    flex: 1,
    alignItems: "flex-end",
  },
  rewardLabel: {
    fontSize: 13,
    color: COLORS.dustyRose,
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.honeyGold,
  },
  requirementBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.mint + "20",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.cream,
    textAlign: "right",
  },
  termsToggle: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.deepPurple,
    marginBottom: 16,
  },
  termsToggleText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.softWhite,
  },
  termsContent: {
    backgroundColor: COLORS.deepPurple + "80",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  termsText: {
    fontSize: 13,
    color: COLORS.lavenderBlush,
    lineHeight: 20,
    textAlign: "right",
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.softWhite,
    marginBottom: 12,
    textAlign: "right",
  },
  input: {
    backgroundColor: COLORS.deepPurple,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.cream,
    textAlign: "right",
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "30",
  },
  checkbox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  checkboxBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.dustyRose,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxBoxActive: {
    backgroundColor: COLORS.honeyGold,
    borderColor: COLORS.honeyGold,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.softWhite,
    textAlign: "right",
  },
  createButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.honeyGold,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
  },
  createButtonDisabled: {
    backgroundColor: COLORS.dustyRose,
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.deepPurple,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(29, 27, 61, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  successModal: {
    position: "absolute",
    top: height * 0.15,
  },
  confetti: {
    fontSize: 120,
  },
  successContent: {
    width: width * 0.85,
    backgroundColor: COLORS.plum,
    borderRadius: 30,
    padding: 32,
    alignItems: "center",
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.cream,
    marginBottom: 12,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 15,
    color: COLORS.lavenderBlush,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  codeBox: {
    width: "100%",
    backgroundColor: COLORS.deepPurple,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  codeLabel: {
    fontSize: 13,
    color: COLORS.dustyRose,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.honeyGold,
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.mint,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    marginBottom: 12,
    gap: 10,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.cream,
  },
  shareButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.honeyGold,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    marginBottom: 20,
    gap: 10,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.deepPurple,
  },
  closeSuccessButton: {
    paddingVertical: 12,
  },
  closeSuccessText: {
    fontSize: 15,
    color: COLORS.dustyRose,
    fontWeight: "600",
  },
});
