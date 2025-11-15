// app/business-dashboard.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthService, User } from "../services/authService";
import { BenefitApiService } from "../services/benefitApiService";
import { BusinessApiService } from "../services/businessApiService";
import {
  BusinessProfile,
  BusinessService,
  Offer,
} from "../services/businessService";
const COLORS = {
  honeyGold: "#F4A259",
  amber: "#F2CC8F",
  lavenderBlush: "#E0BBE4",
  mint: "#81C6B5",
  deepPurple: "#2D1B3D",
  plum: "#422C50",
  midnight: "#1A1423",
  cream: "#FFF8E8",
  dustyRose: "#D4A5A5",
  error: "#E07A7A",
};

export default function BusinessDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfile | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Get business
    const businessResult = await BusinessApiService.getMyBusiness();
    if (businessResult.success) {
      setBusinessProfile(businessResult.business);

      // Get benefits
      const benefitsResult = await BenefitApiService.getMyBenefits();
      if (benefitsResult.success) {
        setOffers(benefitsResult.benefits);
      }
    }
  };
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleLogout = async () => {
    Alert.alert("התנתקות", "האם אתה בטוח?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "התנתק",
        style: "destructive",
        onPress: async () => {
          await AuthService.logout();
          router.replace("/" as any);
        },
      },
    ]);
  };

  const handleCreateProfile = () => {
    router.push("/business-profile-setup" as any);
  };

  const handleEditProfile = () => {
    router.push("/business-profile-edit" as any);
  };

  const handleAddOffer = () => {
    router.push("/offer-create" as any);
  };

  const handleToggleOfferStatus = async (offer: Offer) => {
    const result = await BusinessService.updateOffer(offer.id, {
      isActive: !offer.isActive,
    });

    if (result.success) {
      setOffers((prev) =>
        prev.map((o) =>
          o.id === offer.id ? { ...o, isActive: !o.isActive } : o
        )
      );
    } else {
      Alert.alert("שגיאה", result.error);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    Alert.alert("מחיקת הטבה", "האם אתה בטוח?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "מחק",
        style: "destructive",
        onPress: async () => {
          const result = await BusinessService.deleteOffer(offerId);
          if (result.success) {
            setOffers((prev) => prev.filter((o) => o.id !== offerId));
          } else {
            Alert.alert("שגיאה", result.error);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.honeyGold} />
      </View>
    );
  }

  if (!businessProfile) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.deepPurple}
        />
        <View style={styles.header}>
          <Text style={styles.logoText}>Nectar Business</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyStateContainer}>
          <Ionicons
            name="storefront-outline"
            size={80}
            color={COLORS.honeyGold}
          />
          <Text style={styles.emptyStateTitle}>שלום {currentUser?.name}!</Text>
          <Text style={styles.emptyStateText}>
            בוא נתחיל לבנות את פרופיל העסק שלך
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCreateProfile}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.deepPurple} />
            <Text style={styles.primaryButtonText}>צור פרופיל עסק</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const activeOffers = offers.filter((o) => o.isActive).length;
  const totalUsage = offers.reduce((sum, o) => sum + o.usageCount, 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.deepPurple} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logoText}>Nectar Business</Text>
          <Text style={styles.businessName}>{businessProfile.name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="gift" size={32} color={COLORS.honeyGold} />
          <Text style={styles.statNumber}>{offers.length}</Text>
          <Text style={styles.statLabel}>הטבות</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={32} color={COLORS.mint} />
          <Text style={styles.statNumber}>{activeOffers}</Text>
          <Text style={styles.statLabel}>פעילות</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="people" size={32} color={COLORS.lavenderBlush} />
          <Text style={styles.statNumber}>{totalUsage}</Text>
          <Text style={styles.statLabel}>שימושים</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="star" size={32} color={COLORS.amber} />
          <Text style={styles.statNumber}>
            {businessProfile.rating.toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>דירוג</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEditProfile}
        >
          <Ionicons name="create" size={24} color={COLORS.honeyGold} />
          <Text style={styles.actionText}>ערוך פרופיל</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleAddOffer}>
          <Ionicons name="add-circle" size={24} color={COLORS.mint} />
          <Text style={styles.actionText}>הוסף הטבה</Text>
        </TouchableOpacity>
      </View>

      {/* Offers List */}
      <View style={styles.offersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ההטבות שלי</Text>
          <Ionicons name="gift" size={24} color={COLORS.honeyGold} />
        </View>

        {offers.length === 0 ? (
          <View style={styles.emptyOffersContainer}>
            <Ionicons name="gift-outline" size={60} color={COLORS.dustyRose} />
            <Text style={styles.emptyOffersText}>עדיין אין הטבות</Text>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleAddOffer}
            >
              <Text style={styles.secondaryButtonText}>צור הטבה ראשונה</Text>
            </TouchableOpacity>
          </View>
        ) : (
          offers.map((offer) => (
            <View
              key={offer.id}
              style={[
                styles.offerCard,
                !offer.isActive && styles.offerCardInactive,
              ]}
            >
              <View style={styles.offerHeader}>
                <View style={styles.offerTitleRow}>
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  {offer.isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>פעיל</Text>
                    </View>
                  )}
                </View>
                <View style={styles.offerActions}>
                  <TouchableOpacity
                    onPress={() => handleToggleOfferStatus(offer)}
                  >
                    <Ionicons
                      name={offer.isActive ? "pause-circle" : "play-circle"}
                      size={28}
                      color={offer.isActive ? COLORS.amber : COLORS.mint}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteOffer(offer.id)}>
                    <Ionicons name="trash" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.offerDescription} numberOfLines={2}>
                {offer.description}
              </Text>

              <View style={styles.offerDetails}>
                <View style={styles.offerDetailItem}>
                  <Ionicons
                    name="pricetag"
                    size={16}
                    color={COLORS.honeyGold}
                  />
                  <Text style={styles.offerDetailText}>{offer.discount}</Text>
                </View>

                <View style={styles.offerDetailItem}>
                  <Ionicons name="people" size={16} color={COLORS.mint} />
                  <Text style={styles.offerDetailText}>
                    {offer.usageCount} שימושים
                  </Text>
                </View>

                <View style={styles.offerDetailItem}>
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={COLORS.lavenderBlush}
                  />
                  <Text style={styles.offerDetailText}>
                    עד {new Date(offer.validUntil).toLocaleDateString("he-IL")}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepPurple,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.deepPurple,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 16,
  },
  headerLeft: {
    flex: 1,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.honeyGold,
  },
  businessName: {
    fontSize: 16,
    color: COLORS.cream,
    marginTop: 4,
    fontWeight: "600",
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.plum,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.cream,
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.dustyRose,
    textAlign: "center",
    marginBottom: 32,
  },
  primaryButton: {
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
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.deepPurple,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.plum,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "20",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.cream,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.dustyRose,
    marginTop: 4,
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: COLORS.plum,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.honeyGold + "30",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.cream,
  },
  offersSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.cream,
  },
  emptyOffersContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: COLORS.plum,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "20",
  },
  emptyOffersText: {
    fontSize: 16,
    color: COLORS.dustyRose,
    marginTop: 16,
    marginBottom: 24,
  },
  secondaryButton: {
    backgroundColor: COLORS.mint,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.deepPurple,
  },
  offerCard: {
    backgroundColor: COLORS.plum,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "20",
  },
  offerCardInactive: {
    opacity: 0.6,
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  offerTitleRow: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.cream,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: COLORS.mint + "30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 11,
    color: COLORS.mint,
    fontWeight: "700",
  },
  offerActions: {
    flexDirection: "row",
    gap: 12,
  },
  offerDescription: {
    fontSize: 14,
    color: COLORS.lavenderBlush,
    marginBottom: 12,
    lineHeight: 20,
  },
  offerDetails: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  offerDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  offerDetailText: {
    fontSize: 13,
    color: COLORS.dustyRose,
    fontWeight: "600",
  },
});
