// app/business-dashboard.tsx
import { COLORS } from "@/colors/colors";
import { Benefit } from "@/types/benefit";
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
import { BusinessProfile } from "../services/businessService";

export default function BusinessDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfile | null>(null);
  const [Benefits, setBenefits] = useState<Benefit[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);

        const businessResult = await BusinessApiService.getMyBusiness();
        if (businessResult.success) {
          setBusinessProfile(businessResult.business);

          const benefitsResult = await BenefitApiService.getMyBenefits();
          if (benefitsResult.success) {
            setBenefits(benefitsResult.benefits);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const loadData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const businessResult = await BusinessApiService.getMyBusiness();
      if (businessResult.success) {
        setBusinessProfile(businessResult.business);

        const benefitsResult = await BenefitApiService.getMyBenefits();
        if (benefitsResult.success) {
          setBenefits(benefitsResult.benefits);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  // שימוש ב-OnRefresh:
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(true); // שולח flag שזה רפרש
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

  const handleAddbenefit = () => {
    router.push("/benefit-create" as any);
  };

  const handleToggleBenefitstatus = async (benefit: Benefit) => {
    // const result = await BusinessService.updatebenefit(benefit.id, {
    //   isActive: !benefit.isActive,
    // });
    // if (result.success) {
    //   setBenefits((prev) =>
    //     prev.map((o) =>
    //       o.id === benefit.id ? { ...o, isActive: !o.isActive } : o
    //     )
    //   );
    // } else {
    //   Alert.alert("שגיאה", result.error);
    // }
  };
  const handleDeletebenefit = (benefitId: string) => {
    Alert.alert("מחיקת הטבה", "האם אתה בטוח?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "מחק",
        style: "destructive",
        onPress: async () => {
          await BenefitApiService.deleteBenefit(benefitId);
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

  const activeBenefits = Benefits.filter((o) => o.isActive).length;
  const totalUsage = Benefits.reduce((sum, o) => sum + o.usageCount, 0);

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
          <Text style={styles.statNumber}>{Benefits.length}</Text>
          <Text style={styles.statLabel}>הטבות</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={32} color={COLORS.mint} />
          <Text style={styles.statNumber}>{activeBenefits}</Text>
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

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAddbenefit}
        >
          <Ionicons name="add-circle" size={24} color={COLORS.mint} />
          <Text style={styles.actionText}>הוסף הטבה</Text>
        </TouchableOpacity>
      </View>

      {/* Benefits List */}
      <View style={styles.BenefitsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ההטבות שלי</Text>
          <Ionicons name="gift" size={24} color={COLORS.honeyGold} />
        </View>

        {Benefits.length === 0 ? (
          <View style={styles.emptyBenefitsContainer}>
            <Ionicons name="gift-outline" size={60} color={COLORS.dustyRose} />
            <Text style={styles.emptyBenefitsText}>עדיין אין הטבות</Text>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleAddbenefit}
            >
              <Text style={styles.secondaryButtonText}>צור הטבה ראשונה</Text>
            </TouchableOpacity>
          </View>
        ) : (
          Benefits.map((benefit) => (
            <View
              key={benefit._id?.toString() || benefit.benefitId}
              style={[
                styles.benefitCard,
                !benefit.isActive && styles.benefitCardInactive,
              ]}
            >
              <View style={styles.benefitHeader}>
                <View style={styles.benefitTitleRow}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  {benefit.isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>פעיל</Text>
                    </View>
                  )}
                </View>
                <View style={styles.benefitActions}>
                  <TouchableOpacity
                    onPress={() => handleToggleBenefitstatus(benefit)}
                  >
                    <Ionicons
                      name={benefit.isActive ? "pause-circle" : "play-circle"}
                      size={28}
                      color={benefit.isActive ? COLORS.amber : COLORS.mint}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeletebenefit(benefit.benefitId)}
                  >
                    <Ionicons name="trash" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.benefitDescription} numberOfLines={2}>
                {benefit.description}
              </Text>

              <View style={styles.benefitDetails}>
                <View style={styles.benefitDetailItem}>
                  <Ionicons
                    name="pricetag"
                    size={16}
                    color={COLORS.honeyGold}
                  />
                  <Text style={styles.benefitDetailText}>
                    {benefit.discount}
                  </Text>
                </View>

                <View style={styles.benefitDetailItem}>
                  <Ionicons name="people" size={16} color={COLORS.mint} />
                  <Text style={styles.benefitDetailText}>
                    {benefit.usageCount} שימושים
                  </Text>
                </View>

                <View style={styles.benefitDetailItem}>
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={COLORS.lavenderBlush}
                  />
                  <Text style={styles.benefitDetailText}>
                    עד{" "}
                    {new Date(benefit.validUntil).toLocaleDateString("he-IL")}
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
  BenefitsSection: {
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
  emptyBenefitsContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: COLORS.plum,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "20",
  },
  emptyBenefitsText: {
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
  benefitCard: {
    backgroundColor: COLORS.plum,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lavenderBlush + "20",
  },
  benefitCardInactive: {
    opacity: 0.6,
  },
  benefitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  benefitTitleRow: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  benefitTitle: {
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
  benefitActions: {
    flexDirection: "row",
    gap: 12,
  },
  benefitDescription: {
    fontSize: 14,
    color: COLORS.lavenderBlush,
    marginBottom: 12,
    lineHeight: 20,
  },
  benefitDetails: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  benefitDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  benefitDetailText: {
    fontSize: 13,
    color: COLORS.dustyRose,
    fontWeight: "600",
  },
});
