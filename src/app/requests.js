import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import colors from "../constants/colors";

import { getMechanicRequestHistory } from "../services/mechanicApi";

import { navigateToMechanicRequest } from "../utils/mechanicRequestNavigation";

// =========================================================
// REQUESTS SCREEN
// =========================================================

export default function RequestsScreen() {
  const router = useRouter();

  // =======================================================
  // STATE
  // =======================================================

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  // =======================================================
  // LOAD REQUESTS
  // =======================================================

  const loadRequests = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError(null);

      console.log("====================================");

      console.log("[MECHANIC REQUESTS] Loading requests...");

      const response = await getMechanicRequestHistory();

      console.log(
        "[MECHANIC REQUESTS] RAW API RESPONSE:",
        JSON.stringify(response, null, 2),
      );

      // =====================================================
      // NORMALIZE BACKEND RESPONSE
      // =====================================================

      let data = [];

      if (Array.isArray(response)) {
        // Backend directly returned array
        data = response;
      } else if (Array.isArray(response?.requests)) {
        // { requests: [...] }
        data = response.requests;
      } else if (Array.isArray(response?.data)) {
        // { data: [...] }
        data = response.data;
      } else if (Array.isArray(response?.items)) {
        // { items: [...] }
        data = response.items;
      } else if (Array.isArray(response?.results)) {
        // { results: [...] }
        data = response.results;
      } else if (Array.isArray(response?.data?.requests)) {
        // { data: { requests: [...] } }
        data = response.data.requests;
      } else if (Array.isArray(response?.data?.items)) {
        // { data: { items: [...] } }
        data = response.data.items;
      } else if (Array.isArray(response?.data?.results)) {
        // { data: { results: [...] } }
        data = response.data.results;
      } else if (Array.isArray(response?.content)) {
        // Spring-style paginated response
        data = response.content;
      } else {
        console.warn(
          "[MECHANIC REQUESTS] Unknown API response structure:",
          response,
        );
      }

      // =====================================================
      // NORMALIZE REQUEST OBJECTS
      // =====================================================

      data = data
        .filter((request) => request && typeof request === "object")
        .map((request) => ({
          ...request,

          id: request.id || request.requestId,

          category: request.category || request.serviceCategory || request.type,

          service: request.service || request.serviceName,

          description: request.description || request.issueDescription,

          address: request.address || request.locationAddress,

          distanceKm: request.distanceKm ?? request.distance,

          requestedAt: request.requestedAt || request.createdAt || "Just now",

          // Service value / amount from backend.
          amount:
            request.amount ??
            request.serviceAmount ??
            request.estimatedAmount ??
            request.price ??
            request.servicePrice ??
            request.service?.amount ??
            null,
        }))
        .filter((request) => Boolean(request.id));

      console.log("[MECHANIC REQUESTS] Normalized request count:", data.length);

      console.log(
        "[MECHANIC REQUESTS] Normalized requests:",
        JSON.stringify(data, null, 2),
      );

      setRequests(data);
    } catch (requestError) {
      console.error("[MECHANIC REQUESTS] Request loading error:", requestError);

      console.error("[MECHANIC REQUESTS] Error status:", requestError?.status);

      console.error("[MECHANIC REQUESTS] Error data:", requestError?.data);

      setError(requestError?.message || "Unable to load service requests.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadRequests(true);
  }, [loadRequests]);

  // =======================================================
  // AUTO REFRESH
  // =======================================================

  useEffect(() => {
    const interval = setInterval(() => {
      loadRequests(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [loadRequests]);

  // =======================================================
  // PULL TO REFRESH
  // =======================================================

  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    loadRequests(false);
  }, [loadRequests]);

  // =======================================================
  // OPEN REQUEST
  // =======================================================

  const openRequest = useCallback(
    (request) => {
      if (!request?.id) {
        return;
      }

      console.log("====================================");
      console.log("[MECHANIC] REQUEST OPEN");
      console.log(JSON.stringify(request, null, 2));
      console.log("====================================");

      navigateToMechanicRequest(
        router,
        request
      );
    },
    [router],
  );

  // =======================================================
  // RETRY
  // =======================================================

  const handleRetry = useCallback(() => {
    loadRequests(true);
  }, [loadRequests]);

  // =======================================================
  // LOADING
  // =======================================================

  if (loading && requests.length === 0) {
    return (
      <View style={styles.container}>
        <Header requestCount={0} />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />

          <Text style={styles.loadingText}>Loading request history...</Text>

          <Text style={styles.loadingSubtext}>
            Loading your service request history.
          </Text>
        </View>

        <BottomNavigation active="requests" />
      </View>
    );
  }

  // =======================================================
  // MAIN
  // =======================================================

  return (
    <View style={styles.container}>
      <Header requestCount={requests.length} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={[
          styles.content,

          requests.length === 0 && styles.emptyContent,
        ]}
      >
        {/* =================================================
            ERROR
        ================================================= */}

        {error && requests.length === 0 && (
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <Ionicons
                name="cloud-offline-outline"
                size={24}
                color={colors.danger}
              />
            </View>

            <Text style={styles.errorTitle}>Unable to load requests</Text>

            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Ionicons name="refresh-outline" size={17} color={colors.white} />

              <Text style={styles.retryButtonText}>TRY AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!error && requests.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="construct-outline"
                size={34}
                color={colors.accent}
              />
            </View>

            <Text style={styles.emptyTitle}>No service requests</Text>

            <Text style={styles.emptyText}>
              You do not have any service request history yet.
            </Text>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRetry}
            >
              <Ionicons
                name="refresh-outline"
                size={17}
                color={colors.accent}
              />

              <Text style={styles.refreshButtonText}>REFRESH</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* =================================================
            REQUEST LIST
        ================================================= */}

        {requests.length > 0 && (
          <View style={styles.list}>
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onPress={() => openRequest(request)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNavigation active="requests" />
    </View>
  );
}

// =========================================================
// BOTTOM NAVIGATION
// =========================================================

function BottomNavigation({ active }) {
  const router = useRouter();

  const navigate = (path) => {
    if (path === "/") {
      router.replace("/");
      return;
    }

    router.replace(path);
  };

  return (
    <View style={styles.bottomNavigation}>
      <BottomNavItem
        icon="home"
        outlineIcon="home-outline"
        label="Home"
        active={active === "home"}
        onPress={() => navigate("/")}
      />

      <BottomNavItem
        icon="clipboard"
        outlineIcon="clipboard-outline"
        label="Requests"
        active={active === "requests"}
        onPress={() => navigate("/requests")}
      />

      <BottomNavItem
        icon="wallet"
        outlineIcon="wallet-outline"
        label="Earnings"
        active={active === "earnings"}
        onPress={() => navigate("/earnings")}
      />

      <BottomNavItem
        icon="person"
        outlineIcon="person-outline"
        label="Profile"
        active={active === "profile"}
        onPress={() => navigate("/profile")}
      />
    </View>
  );
}

// =========================================================
// BOTTOM NAV ITEM
// =========================================================

function BottomNavItem({ icon, outlineIcon, label, active, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.bottomNavItem}
      onPress={onPress}
    >
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
    </TouchableOpacity>
  );
}

// =========================================================
// HEADER
// =========================================================

function Header({ requestCount }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerEyebrow}>MECHANIC</Text>

        <Text style={styles.headerTitle}>Service Requests</Text>

        <Text style={styles.headerSubtitle}>Your service request history</Text>
      </View>

      <View style={styles.countBadge}>
        <Ionicons
          name="notifications-outline"
          size={18}
          color={colors.accent}
        />

        <Text style={styles.countText}>{requestCount}</Text>
      </View>
    </View>
  );
}

// =========================================================
// REQUEST CARD
// =========================================================

function RequestCard({ request, onPress }) {
  const iconName = request?.icon || getCategoryIcon(request?.category);

  const iconColor = request?.serviceColor || colors.accent;

  const iconBackground = request?.serviceBackground || colors.accentLight;

  const serviceName = request?.service || formatCategory(request?.category);

  const location = request?.location || request?.address || "Current location";

  const distance =
    request?.distanceKm !== null && request?.distanceKm !== undefined
      ? `${Number(request.distanceKm).toFixed(1)} km away`
      : null;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.requestCard}
      onPress={onPress}
    >
      {/* =================================================
          TOP
      ================================================= */}

      <View style={styles.requestHeader}>
        <View style={styles.serviceInfo}>
          <View
            style={[
              styles.serviceIcon,

              {
                backgroundColor: iconBackground,
              },
            ]}
          >
            <Ionicons name={iconName} size={23} color={iconColor} />
          </View>

          <View style={styles.serviceText}>
            <Text style={styles.serviceTitle} numberOfLines={1}>
              {serviceName}
            </Text>

            <Text style={styles.requestTime}>
              {request?.requestedAt || "Just now"}
            </Text>
          </View>
        </View>

        <StatusBadge status={request?.status} />
      </View>

      {/* =================================================
          LOCATION
      ================================================= */}

      <View style={styles.infoRow}>
        <View style={styles.infoIcon}>
          <Ionicons
            name="location-outline"
            size={16}
            color={colors.textSecondary}
          />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>LOCATION</Text>

          <Text style={styles.infoValue} numberOfLines={2}>
            {location}
          </Text>
        </View>
      </View>

      {/* =================================================
          DISTANCE
      ================================================= */}

      {distance && (
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="navigate-outline"
              size={16}
              color={colors.textSecondary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>DISTANCE</Text>

            <Text style={styles.infoValue}>{distance}</Text>
          </View>
        </View>
      )}

      {/* =================================================
          SERVICE VALUE
      ================================================= */}

      {request?.amount !== null &&
        request?.amount !== undefined &&
        request?.amount !== "" && (
          <View style={styles.amountBox}>

            <View style={styles.amountIcon}>
              <Ionicons
                name="cash-outline"
                size={18}
                color={colors.accent}
              />
            </View>

            <View style={styles.amountContent}>
              <Text style={styles.amountLabel}>
                SERVICE VALUE
              </Text>

              <Text style={styles.amountValue}>
                ₹{Number(request.amount).toLocaleString("en-IN")}
              </Text>
            </View>

          </View>
        )}

      {/* =================================================
          DESCRIPTION
      ================================================= */}

      {!!request?.description && (
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionLabel}>ISSUE DESCRIPTION</Text>

          <Text style={styles.descriptionText} numberOfLines={3}>
            {request.description}
          </Text>
        </View>
      )}

      {/* =================================================
          FOOTER
      ================================================= */}

      <View style={styles.cardFooter}>
        <Text style={styles.viewDetailsText}>View request details</Text>

        <View style={styles.arrowCircle}>
          <Ionicons name="chevron-forward" size={17} color={colors.accent} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({ status }) {
  const normalized = String(status || "UNKNOWN")
    .trim()
    .toUpperCase();

  const statusConfig = {
    PENDING: {
      label: "PENDING",
      background: colors.accentLight,
      foreground: colors.accent,
    },
    REQUESTED: {
      label: "NEW",
      background: colors.accentLight,
      foreground: colors.accent,
    },
    ACCEPTED: {
      label: "ACCEPTED",
      background: colors.accentLight,
      foreground: colors.accent,
    },
    MECHANIC_EN_ROUTE: {
      label: "EN ROUTE",
      background: colors.accentLight,
      foreground: colors.accent,
    },
    ARRIVED: {
      label: "ARRIVED",
      background: colors.accentLight,
      foreground: colors.accent,
    },
    IN_PROGRESS: {
      label: "IN PROGRESS",
      background: colors.accentLight,
      foreground: colors.accent,
    },
    PAYMENT_PENDING: {
      label: "PAYMENT PENDING",
      background: colors.accentLight,
      foreground: colors.accent,
    },
    COMPLETED: {
      label: "COMPLETED",
      background: colors.accentLight,
      foreground: colors.accent,
    },
    CANCELLED: {
      label: "CANCELLED",
      background: colors.accentLight,
      foreground: colors.accent,
    },
  };

  const config = statusConfig[normalized] || {
    label: normalized.replace(/_/g, " "),
    background: colors.accentLight,
    foreground: colors.accent,
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.background }]}>
      <View
        style={[styles.statusDot, { backgroundColor: config.foreground }]}
      />

      <Text style={[styles.statusBadgeText, { color: config.foreground }]}>
        {config.label}
      </Text>
    </View>
  );
}

// =========================================================
// CATEGORY ICON FALLBACK
// =========================================================

function getCategoryIcon(category) {
  switch (String(category || "").toUpperCase()) {
    case "BATTERY":
      return "battery-charging-outline";

    case "TYRE":
      return "disc-outline";

    case "FUEL":
      return "flame-outline";

    case "BREAKDOWN":
      return "construct-outline";

    default:
      return "construct-outline";
  }
}

// =========================================================
// CATEGORY NAME FALLBACK
// =========================================================

function formatCategory(category) {
  if (!category) {
    return "Service Request";
  }

  return String(category)
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
    .replace(/_/g, " ");
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  // =====================================================
  // CONTAINER
  // =====================================================

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 17,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerEyebrow: {
    fontFamily: "InterSemiBold",
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.accent,
    marginBottom: 4,
  },

  headerTitle: {
    fontFamily: "InterExtraBold",
    fontSize: 23,
    color: colors.text,
  },

  headerSubtitle: {
    fontFamily: "InterRegular",
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },

  countBadge: {
    minWidth: 46,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },

  countText: {
    fontFamily: "InterBold",
    fontSize: 13,
    color: colors.accent,
  },

  // =====================================================
  // CONTENT
  // =====================================================

  content: {
    padding: 16,
    paddingBottom: 110,
  },

  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  // =====================================================
  // LIST
  // =====================================================

  list: {
    gap: 13,
  },

  // =====================================================
  // REQUEST CARD
  // =====================================================

  requestCard: {
    backgroundColor: colors.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  // =====================================================
  // REQUEST HEADER
  // =====================================================

  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  serviceInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  serviceText: {
    flex: 1,
  },

  serviceTitle: {
    fontFamily: "InterBold",
    fontSize: 15,
    color: colors.text,
  },

  requestTime: {
    fontFamily: "InterRegular",
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },

  // =====================================================
  // NEW BADGE
  // =====================================================

  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    height: 27,
    borderRadius: 9,
    backgroundColor: colors.accentLight,
  },

  newDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 5,
  },

  newBadgeText: {
    fontFamily: "InterBold",
    fontSize: 9,
    color: colors.accent,
    letterSpacing: 0.5,
  },

  // =====================================================
  // STATUS BADGE
  // =====================================================

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    height: 27,
    borderRadius: 9,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },

  statusBadgeText: {
    fontFamily: "InterBold",
    fontSize: 9,
    letterSpacing: 0.5,
  },

  // =====================================================
  // INFO ROW
  // =====================================================

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
  },

  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  infoContent: {
    flex: 1,
    paddingTop: 1,
  },

  infoLabel: {
    fontFamily: "InterSemiBold",
    fontSize: 8,
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginBottom: 3,
  },

  infoValue: {
    fontFamily: "InterMedium",
    fontSize: 11,
    lineHeight: 17,
    color: colors.text,
  },

  // =====================================================
  // SERVICE VALUE
  // =====================================================

  amountBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.accentLight,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.accentLight,
  },

  amountIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  amountContent: {
    marginLeft: 10,
    flex: 1,
  },

  amountLabel: {
    fontFamily: "InterSemiBold",
    fontSize: 8,
    letterSpacing: 0.8,
    color: colors.textMuted,
  },

  amountValue: {
    fontFamily: "InterBold",
    fontSize: 18,
    color: colors.accent,
    marginTop: 2,
  },

  // =====================================================
  // DESCRIPTION
  // =====================================================

  descriptionBox: {
    marginTop: 13,
    padding: 11,
    borderRadius: 12,
    backgroundColor: colors.background,
  },

  descriptionLabel: {
    fontFamily: "InterSemiBold",
    fontSize: 8,
    letterSpacing: 0.7,
    color: colors.textMuted,
    marginBottom: 4,
  },

  descriptionText: {
    fontFamily: "InterRegular",
    fontSize: 11,
    lineHeight: 17,
    color: colors.text,
  },

  // =====================================================
  // FOOTER
  // =====================================================

  cardFooter: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  viewDetailsText: {
    fontFamily: "InterSemiBold",
    fontSize: 10,
    color: colors.accent,
  },

  arrowCircle: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
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
  },

  bottomNavIconActive: {
    backgroundColor: colors.accentLight,
  },

  bottomNavLabel: {
    fontFamily: "InterRegular",
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 3,
  },

  bottomNavLabelActive: {
    fontFamily: "InterSemiBold",
    color: colors.accent,
  },

  // =====================================================
  // LOADING
  // =====================================================

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  loadingText: {
    fontFamily: "InterSemiBold",
    fontSize: 13,
    color: colors.text,
    marginTop: 15,
  },

  loadingSubtext: {
    fontFamily: "InterRegular",
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 5,
    textAlign: "center",
  },

  // =====================================================
  // EMPTY
  // =====================================================

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontFamily: "InterExtraBold",
    fontSize: 18,
    color: colors.text,
    textAlign: "center",
  },

  emptyText: {
    fontFamily: "InterRegular",
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 290,
    marginTop: 7,
  },

  refreshButton: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    gap: 7,
  },

  refreshButtonText: {
    fontFamily: "InterBold",
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 0.4,
  },

  // =====================================================
  // ERROR
  // =====================================================

  errorCard: {
    backgroundColor: colors.white,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 22,
    alignItems: "center",
  },

  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 19,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  errorTitle: {
    fontFamily: "InterBold",
    fontSize: 15,
    color: colors.text,
    textAlign: "center",
  },

  errorText: {
    fontFamily: "InterRegular",
    fontSize: 10,
    lineHeight: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
  },

  retryButton: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
    gap: 7,
  },

  retryButtonText: {
    fontFamily: "InterBold",
    fontSize: 10,
    color: colors.white,
    letterSpacing: 0.4,
  },
});
