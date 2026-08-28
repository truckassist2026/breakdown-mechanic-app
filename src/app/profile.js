import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useEffect, useState } from "react";

import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import { useAuth } from "../context/AuthContext";

import {
  getMyMechanicProfile,
  updateMyMechanicProfile,
} from "../services/mechanicApi";

import colors from "../constants/colors";
import spacing from "../constants/spacing";

// =========================================================
// PROFILE SCREEN
// =========================================================

export default function ProfileScreen() {
  const router = useRouter();

  const { user, logout } = useAuth();

  // =======================================================
  // STATE
  // =======================================================

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState(null);

  // Form fields

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [experienceYears, setExperienceYears] = useState("");

  const [workshopName, setWorkshopName] = useState("");

  const [workshopAddress, setWorkshopAddress] = useState("");

  // =======================================================
  // LOAD PROFILE
  // =======================================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[Mechanic Profile] Loading profile...");

      const response = await getMyMechanicProfile();

      console.log("[Mechanic Profile] Profile response:", response);

      setProfile(response);

      setName(response?.name || "");

      setEmail(response?.email || "");

      setExperienceYears(
        response?.experienceYears !== null &&
          response?.experienceYears !== undefined
          ? String(response.experienceYears)
          : "",
      );

      setWorkshopName(response?.workshopName || "");

      setWorkshopAddress(response?.workshopAddress || "");
    } catch (err) {
      console.error("[Mechanic Profile] Load failed:", err);

      setError(err?.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // SAVE PROFILE
  // =======================================================

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setError(null);

    // ---------------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------------

    if (!name.trim()) {
      setError("Please enter your name.");

      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");

      return;
    }

    if (
      experienceYears !== "" &&
      (isNaN(Number(experienceYears)) || Number(experienceYears) < 0)
    ) {
      setError("Experience must be a valid number.");

      return;
    }

    try {
      setSaving(true);

      console.log("[Mechanic Profile] Saving profile...");

      const response = await updateMyMechanicProfile({
        name,

        email,

        experienceYears,

        workshopName,

        workshopAddress,
      });

      console.log("[Mechanic Profile] Updated profile:", response);

      setProfile(response);

      // Refresh fields from backend response

      setName(response?.name || "");

      setEmail(response?.email || "");

      setExperienceYears(
        response?.experienceYears !== null &&
          response?.experienceYears !== undefined
          ? String(response.experienceYears)
          : "",
      );

      setWorkshopName(response?.workshopName || "");

      setWorkshopAddress(response?.workshopAddress || "");

      setEditing(false);

      if (Platform.OS === "web") {
        console.log("[Mechanic Profile] Profile saved successfully");
      } else {
        Alert.alert(
          "Profile Updated",
          "Your workshop profile has been updated successfully.",
        );
      }
    } catch (err) {
      console.error("[Mechanic Profile] Save failed:", err);

      setError(err?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // =======================================================
  // CANCEL EDIT
  // =======================================================

  const handleCancel = () => {
    if (profile) {
      setName(profile.name || "");

      setEmail(profile.email || "");

      setExperienceYears(
        profile.experienceYears !== null &&
          profile.experienceYears !== undefined
          ? String(profile.experienceYears)
          : "",
      );

      setWorkshopName(profile.workshopName || "");

      setWorkshopAddress(profile.workshopAddress || "");
    }

    setError(null);

    setEditing(false);
  };

  // =======================================================
  // LOGOUT
  // =======================================================

  const handleLogout = async () => {
    await logout();

    router.replace("/login");
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.accent} />

        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // =======================================================
  // PROFILE PICTURE
  // =======================================================

  const profileImage = profile?.profileImageUrl;

  // =======================================================
  // DISPLAY VALUES
  // =======================================================

  const phone = profile?.phone || user?.phone || "Not available";

  const rating =
    profile?.rating !== null && profile?.rating !== undefined
      ? Number(profile.rating).toFixed(1)
      : "0.0";

  const totalJobs = profile?.totalJobs ?? 0;

  return (
    <View style={styles.container}>
      {/* =================================================
          HEADER
          ================================================= */}

      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={() => router.replace("/")}
        >
          <Ionicons name="arrow-back" size={21} color={colors.text} />
        </Pressable>

        <Text style={styles.headerTitle}>My Profile</Text>

        {!editing ? (
          <Pressable style={styles.editButton} onPress={() => setEditing(true)}>
            <Ionicons name="create-outline" size={19} color={colors.accent} />

            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* =============================================
              ERROR
              ============================================= */}

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={19}
                color={colors.danger}
              />

              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* =============================================
              PROFILE HERO
              ============================================= */}

          <View style={styles.profileHero}>
            <View style={styles.avatarContainer}>
              {profileImage ? (
                <Image
                  source={{
                    uri: profileImage,
                  }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={38} color={colors.accent} />
                </View>
              )}
            </View>

            <Text style={styles.profileName} numberOfLines={1}>
              {profile?.name || "Mechanic"}
            </Text>

            <Text style={styles.profileRole}>Mechanic Partner</Text>

            <View style={styles.profileStats}>
              <View style={styles.profileStat}>
                <Ionicons name="star" size={15} color={colors.warning} />

                <Text style={styles.profileStatValue}>{rating}</Text>

                <Text style={styles.profileStatLabel}>Rating</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.profileStat}>
                <Ionicons
                  name="checkmark-circle"
                  size={15}
                  color={colors.success}
                />

                <Text style={styles.profileStatValue}>{totalJobs}</Text>

                <Text style={styles.profileStatLabel}>Jobs</Text>
              </View>
            </View>
          </View>

          {/* =============================================
              PERSONAL INFORMATION
              ============================================= */}

          <SectionTitle title="Personal Information" />

          <View style={styles.card}>
            <ProfileField
              icon="person-outline"
              label="Name"
              value={name}
              editing={editing}
              onChangeText={setName}
              placeholder="Enter your name"
            />

            <ProfileField
              icon="call-outline"
              label="Mobile Number"
              value={phone}
              editing={false}
              readOnly
            />

            <ProfileField
              icon="mail-outline"
              label="Email"
              value={email}
              editing={editing}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* =============================================
              WORKSHOP INFORMATION
              ============================================= */}

          <SectionTitle title="Workshop Information" />

          <View style={styles.card}>
            <ProfileField
              icon="business-outline"
              label="Workshop Name"
              value={workshopName}
              editing={editing}
              onChangeText={setWorkshopName}
              placeholder="Enter workshop name"
            />

            <ProfileField
              icon="location-outline"
              label="Workshop Address"
              value={workshopAddress}
              editing={editing}
              onChangeText={setWorkshopAddress}
              placeholder="Enter workshop address"
              multiline
            />

            <ProfileField
              icon="briefcase-outline"
              label="Experience"
              value={experienceYears ? `${experienceYears} years` : ""}
              editing={editing}
              onChangeText={(value) => {
                const numericValue = value.replace(/[^0-9]/g, "");

                setExperienceYears(numericValue);
              }}
              placeholder="Years of experience"
              keyboardType="numeric"
            />
          </View>

          {/* =============================================
              PROFILE STATUS
              ============================================= */}

          <SectionTitle title="Profile Status" />

          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Ionicons
                name="shield-checkmark"
                size={21}
                color={colors.success}
              />
            </View>

            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Profile Information</Text>

              <Text style={styles.statusDescription}>
                Keep your workshop information up to date so drivers can find
                the right assistance.
              </Text>
            </View>
          </View>

          {/* =============================================
              SAVE / CANCEL
              ============================================= */}

          {editing ? (
            <View style={styles.editActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.saveButton, saving && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color={colors.white} />

                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : null}

          {/* =============================================
              LOGOUT
              ============================================= */}

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={19} color={colors.danger} />

            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>

          <Text style={styles.footer}>Truck Assist • Mechanic Partner</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* =================================================
          BOTTOM NAVIGATION
          ================================================= */}

      <View style={styles.bottomNavigation}>
        <BottomNavItem
          icon="home"
          outlineIcon="home-outline"
          label="Home"
          onPress={() => router.replace("/")}
        />

        <BottomNavItem
          icon="clipboard"
          outlineIcon="clipboard-outline"
          label="Requests"
          onPress={() => router.push("/requests")}
        />

        <BottomNavItem
          icon="wallet"
          outlineIcon="wallet-outline"
          label="Earnings"
          onPress={() => router.push("/earnings")}
        />

        <BottomNavItem
          icon="person"
          outlineIcon="person-outline"
          label="Profile"
          active
          onPress={() => router.replace("/profile")}
        />
      </View>
    </View>
  );
}

// =========================================================
// SECTION TITLE
// =========================================================

function SectionTitle({ title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// =========================================================
// PROFILE FIELD
// =========================================================

function ProfileField({
  icon,
  label,
  value,
  editing,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  multiline,
  readOnly,
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldIcon}>
        <Ionicons name={icon} size={19} color={colors.accent} />
      </View>

      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>

        {editing && !readOnly ? (
          <TextInput
            value={value || ""}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textLight}
            keyboardType={keyboardType || "default"}
            autoCapitalize={autoCapitalize || "sentences"}
            multiline={multiline || false}
            textAlignVertical={multiline ? "top" : "center"}
            style={[styles.input, multiline && styles.multilineInput]}
          />
        ) : (
          <Text style={[styles.fieldValue, !value && styles.emptyValue]}>
            {value || "Not provided"}
          </Text>
        )}
      </View>

      {readOnly ? (
        <Ionicons
          name="lock-closed-outline"
          size={15}
          color={colors.textLight}
        />
      ) : null}
    </View>
  );
}

// =========================================================
// BOTTOM NAV ITEM
// =========================================================

function BottomNavItem({ icon, outlineIcon, label, active, onPress }) {
  return (
    <Pressable style={styles.bottomNavItem} onPress={onPress}>
      <View
        style={[styles.bottomNavIcon, active && styles.bottomNavIconActive]}
      >
        <Ionicons
          name={active ? icon : outlineIcon}
          size={21}
          color={active ? colors.accent : colors.textMuted}
        />
      </View>

      <Text
        style={[styles.bottomNavLabel, active && styles.bottomNavLabelActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingContainer: {
    flex: 1,

    backgroundColor: colors.background,

    alignItems: "center",

    justifyContent: "center",
  },

  loadingText: {
    fontFamily: "InterRegular",

    fontSize: 11,

    color: colors.textMuted,

    marginTop: 10,
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    minHeight: Platform.OS === "web" ? 72 : 66,

    paddingHorizontal: spacing.screenHorizontal,

    paddingTop: Platform.OS === "web" ? 12 : 8,

    paddingBottom: 8,

    backgroundColor: colors.white,

    borderBottomWidth: 1,

    borderBottomColor: colors.borderLight,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  headerButton: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: colors.background,

    alignItems: "center",

    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,

    fontFamily: "InterBold",

    fontSize: 17,

    color: colors.text,

    textAlign: "center",

    marginHorizontal: 10,
  },

  editButton: {
    minWidth: 58,

    height: 38,

    borderRadius: 11,

    backgroundColor: colors.accentLight,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 10,
  },

  editButtonText: {
    fontFamily: "InterSemiBold",

    fontSize: 11,

    color: colors.accent,

    marginLeft: 5,
  },

  headerSpacer: {
    width: 58,
  },

  // =====================================================
  // SCROLL
  // =====================================================

  scrollContent: {
    paddingHorizontal: spacing.screenHorizontal,

    paddingTop: 18,

    paddingBottom: 120,
  },

  // =====================================================
  // ERROR
  // =====================================================

  errorBox: {
    backgroundColor: colors.dangerLight,

    borderRadius: 12,

    padding: 12,

    marginBottom: 14,

    flexDirection: "row",

    alignItems: "center",
  },

  errorText: {
    flex: 1,

    fontFamily: "InterMedium",

    fontSize: 11,

    lineHeight: 16,

    color: colors.danger,

    marginLeft: 8,
  },

  // =====================================================
  // PROFILE HERO
  // =====================================================

  profileHero: {
    backgroundColor: colors.white,

    borderRadius: 20,

    borderWidth: 1,

    borderColor: colors.borderLight,

    alignItems: "center",

    paddingTop: 22,

    paddingBottom: 18,

    marginBottom: 22,

    ...Platform.select({
      web: {
        boxShadow: "0px 2px 10px rgba(15, 23, 42, 0.05)",
      },

      default: {
        shadowColor: colors.shadow,

        shadowOffset: {
          width: 0,
          height: 2,
        },

        shadowOpacity: 0.04,

        shadowRadius: 8,

        elevation: 2,
      },
    }),
  },

  avatarContainer: {
    width: 88,
    height: 88,

    borderRadius: 44,

    overflow: "hidden",

    marginBottom: 10,

    borderWidth: 3,

    borderColor: colors.accentLight,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarPlaceholder: {
    flex: 1,

    backgroundColor: colors.accentLight,

    alignItems: "center",

    justifyContent: "center",
  },

  profileName: {
    fontFamily: "InterBold",

    fontSize: 20,

    color: colors.text,

    maxWidth: "85%",

    textAlign: "center",
  },

  profileRole: {
    fontFamily: "InterRegular",

    fontSize: 11,

    color: colors.textMuted,

    marginTop: 3,

    marginBottom: 16,
  },

  profileStats: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    width: "70%",
  },

  profileStat: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  profileStatValue: {
    fontFamily: "InterBold",

    fontSize: 12,

    color: colors.text,

    marginLeft: 5,
  },

  profileStatLabel: {
    fontFamily: "InterRegular",

    fontSize: 10,

    color: colors.textMuted,

    marginLeft: 4,
  },

  statDivider: {
    width: 1,

    height: 20,

    backgroundColor: colors.border,

    marginHorizontal: 22,
  },

  // =====================================================
  // SECTIONS
  // =====================================================

  sectionHeader: {
    marginBottom: 10,

    marginTop: 2,
  },

  sectionTitle: {
    fontFamily: "InterBold",

    fontSize: 15,

    color: colors.text,
  },

  // =====================================================
  // CARD
  // =====================================================

  card: {
    backgroundColor: colors.white,

    borderRadius: 16,

    borderWidth: 1,

    borderColor: colors.borderLight,

    paddingHorizontal: 14,

    marginBottom: 22,
  },

  field: {
    minHeight: 68,

    flexDirection: "row",

    alignItems: "center",

    borderBottomWidth: 1,

    borderBottomColor: colors.borderLight,
  },

  fieldIcon: {
    width: 38,

    height: 38,

    borderRadius: 11,

    backgroundColor: colors.accentLight,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 11,
  },

  fieldContent: {
    flex: 1,

    paddingVertical: 9,
  },

  fieldLabel: {
    fontFamily: "InterMedium",

    fontSize: 9,

    color: colors.textMuted,

    marginBottom: 4,
  },

  fieldValue: {
    fontFamily: "InterSemiBold",

    fontSize: 12,

    color: colors.text,

    lineHeight: 18,
  },

  emptyValue: {
    color: colors.textLight,

    fontFamily: "InterRegular",
  },

  input: {
    minHeight: 30,

    paddingVertical: 0,

    paddingHorizontal: 0,

    margin: 0,

    fontFamily: "InterSemiBold",

    fontSize: 12,

    color: colors.text,

    outlineStyle: "none",
  },

  multilineInput: {
    minHeight: 55,

    paddingTop: 5,

    paddingBottom: 5,
  },

  // =====================================================
  // STATUS
  // =====================================================

  statusCard: {
    backgroundColor: colors.successLight,

    borderRadius: 16,

    padding: 14,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 22,
  },

  statusIcon: {
    width: 42,

    height: 42,

    borderRadius: 12,

    backgroundColor: colors.white,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 11,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    fontFamily: "InterSemiBold",

    fontSize: 12,

    color: colors.successDark,

    marginBottom: 3,
  },

  statusDescription: {
    fontFamily: "InterRegular",

    fontSize: 9,

    lineHeight: 14,

    color: colors.textSecondary,
  },

  // =====================================================
  // EDIT ACTIONS
  // =====================================================

  editActions: {
    flexDirection: "row",

    marginBottom: 14,
  },

  cancelButton: {
    flex: 0.8,

    height: 50,

    borderRadius: 13,

    backgroundColor: colors.white,

    borderWidth: 1,

    borderColor: colors.border,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 8,
  },

  cancelButtonText: {
    fontFamily: "InterSemiBold",

    fontSize: 11,

    color: colors.textSecondary,
  },

  saveButton: {
    flex: 1.5,

    height: 50,

    borderRadius: 13,

    backgroundColor: colors.accent,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginLeft: 8,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  saveButtonText: {
    fontFamily: "InterSemiBold",

    fontSize: 11,

    color: colors.white,

    marginLeft: 6,
  },

  // =====================================================
  // LOGOUT
  // =====================================================

  logoutButton: {
    height: 48,

    borderRadius: 13,

    borderWidth: 1,

    borderColor: colors.dangerLight,

    backgroundColor: colors.white,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 14,
  },

  logoutText: {
    fontFamily: "InterSemiBold",

    fontSize: 11,

    color: colors.danger,

    marginLeft: 7,
  },

  footer: {
    fontFamily: "InterRegular",

    fontSize: 9,

    color: colors.textLight,

    textAlign: "center",
  },

  // =====================================================
  // BOTTOM NAVIGATION
  // =====================================================

  bottomNavigation: {
    position: "absolute",

    left: 0,

    right: 0,

    bottom: 0,

    height: 76,

    backgroundColor: colors.white,

    borderTopWidth: 1,

    borderTopColor: colors.borderLight,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-around",

    paddingHorizontal: 6,

    paddingBottom: Platform.OS === "web" ? 4 : 8,

    ...Platform.select({
      web: {
        boxShadow: "0px -2px 10px rgba(15, 23, 42, 0.08)",
      },

      default: {
        shadowColor: colors.shadow,

        shadowOffset: {
          width: 0,
          height: -3,
        },

        shadowOpacity: 0.08,

        shadowRadius: 8,

        elevation: 12,
      },
    }),
  },

  bottomNavItem: {
    flex: 1,

    height: 68,

    alignItems: "center",

    justifyContent: "center",

    paddingTop: 4,
  },

  bottomNavIcon: {
    width: 40,

    height: 34,

    borderRadius: 12,

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 2,
  },

  bottomNavIconActive: {
    backgroundColor: colors.accentLight,
  },

  bottomNavLabel: {
    fontFamily: "InterMedium",

    fontSize: 9,

    color: colors.textMuted,
  },

  bottomNavLabelActive: {
    fontFamily: "InterBold",

    color: colors.accent,
  },
});
