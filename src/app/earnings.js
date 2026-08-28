import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import BottomNavigation from "../components/BottomNavigation";

import colors from "../constants/colors";
import spacing from "../constants/spacing";

import {
  getMechanicRequestHistory,
  getMyMechanicProfile,
  getServicePayment,
} from "../services/mechanicApi";

export default function EarningsScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [earnings, setEarnings] = useState({
    total: 0,
    jobs: 0,
    completed: 0,
    rating: 0,
    thisWeek: 0,
    growth: 0,
    previousMonth: 0,
    daily: [],
    recent: [],
  });

  const formatMoney = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;

  const statusOf = (value) =>
    String(value || "")
      .trim()
      .toUpperCase();

  const toDate = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const isPaid = (payment) =>
    ["PAID", "COMPLETED", "SUCCESS", "SUCCESSFUL"].includes(
      statusOf(payment?.status),
    );

  const amountOf = (payment) => {
    const n = Number(payment?.amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const categoryMeta = (category) => {
    const c = String(category || "").toUpperCase();

    if (c.includes("TYRE")) {
      return {
        icon: "disc-outline",
        iconColor: colors.serviceTyre,
        iconBackground: colors.borderLight,
      };
    }

    if (c.includes("BATTERY")) {
      return {
        icon: "battery-charging-outline",
        iconColor: colors.serviceBattery,
        iconBackground: colors.warningLight,
      };
    }

    if (c.includes("FUEL") || c.includes("DIESEL")) {
      return {
        icon: "water-outline",
        iconColor: colors.serviceFuel,
        iconBackground: colors.warningLight,
      };
    }

    if (c.includes("ENGINE") || c.includes("BREAKDOWN")) {
      return {
        icon: "settings-outline",
        iconColor: colors.serviceEngine,
        iconBackground: colors.accentLight,
      };
    }

    return {
      icon: "construct-outline",
      iconColor: colors.accent,
      iconBackground: colors.accentLight,
    };
  };

  const formatDate = (value) => {
    const d = toDate(value);

    if (!d) {
      return "Date unavailable";
    }

    const today = new Date();

    if (d.toDateString() === today.toDateString()) {
      return `Today • ${d.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    }

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const loadEarnings = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError(null);

      const [historyResponse, profileResponse] = await Promise.all([
        getMechanicRequestHistory(),
        getMyMechanicProfile(),
      ]);

      let requests = [];

      if (Array.isArray(historyResponse)) {
        requests = historyResponse;
      } else if (Array.isArray(historyResponse?.data)) {
        requests = historyResponse.data;
      } else if (Array.isArray(historyResponse?.requests)) {
        requests = historyResponse.requests;
      } else if (Array.isArray(historyResponse?.content)) {
        requests = historyResponse.content;
      }

      const completedRequests = requests.filter(
        (request) => statusOf(request?.status) === "COMPLETED",
      );

      const paidItems = (
        await Promise.all(
          completedRequests.map(async (request) => {
            try {
              const payment = await getServicePayment(request.id);

              if (!isPaid(payment)) {
                return null;
              }

              const amount = amountOf(payment);

              if (!amount) {
                return null;
              }

              return {
                request,
                payment,
                amount,
                date: toDate(
                  payment?.paidAt || payment?.createdAt || request?.createdAt,
                ),
              };
            } catch {
              return null;
            }
          }),
        )
      )
        .filter(Boolean)
        .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

      const now = new Date();

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const previousMonthStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );

      const weekStart = new Date(now);
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - 6);

      const sum = (items) =>
        items.reduce((total, item) => total + item.amount, 0);

      const thisMonthItems = paidItems.filter(
        (item) =>
          item.date && item.date >= monthStart && item.date < nextMonthStart,
      );

      const previousMonthItems = paidItems.filter(
        (item) =>
          item.date &&
          item.date >= previousMonthStart &&
          item.date < monthStart,
      );

      const weekItems = paidItems.filter(
        (item) =>
          item.date && item.date >= weekStart && item.date < nextMonthStart,
      );

      const thisMonth = sum(thisMonthItems);

      const previousMonth = sum(previousMonthItems);

      const thisWeek = sum(weekItems);

      const growth =
        previousMonth > 0
          ? ((thisMonth - previousMonth) / previousMonth) * 100
          : 0;

      const daily = Array.from({ length: 7 }, (_, index) => {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + index);

        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);

        return {
          day: day.toLocaleDateString("en-IN", { weekday: "short" }),
          amount: sum(
            weekItems.filter(
              (item) => item.date && item.date >= day && item.date < nextDay,
            ),
          ),
        };
      });

      const recent = paidItems.slice(0, 4).map((item) => {
        const category =
          item.request?.category || item.request?.service || "Service";

        const driver = item.request?.driver;

        return {
          id: item.request?.id,
          ...categoryMeta(category),
          title: category,
          customer: driver?.name || driver?.fullName || "Driver",
          date: formatDate(item.date),
          amount: formatMoney(item.amount),
        };
      });

      const rating = Number(
        profileResponse?.rating ?? profileResponse?.averageRating ?? 0,
      );

      setEarnings({
        total: thisMonth,
        jobs: requests.length,
        completed: completedRequests.length,
        rating: Number.isFinite(rating) ? rating : 0,
        thisWeek,
        growth,
        previousMonth,
        daily,
        recent,
      });
    } catch (loadError) {
      console.error("[Mechanic Earnings] Load error:", loadError);

      setError(loadError?.message || "Unable to load earnings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings(true);

    const interval = setInterval(() => loadEarnings(false), 30000);

    return () => clearInterval(interval);
  }, []);

  const maxDailyAmount = Math.max(
    ...earnings.daily.map((item) => item.amount),
    1,
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.accent} />

        <Text style={styles.loadingText}>Loading earnings...</Text>

        <BottomNavigation />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {error && (
          <View style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={colors.danger}
            />

            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity onPress={() => loadEarnings(true)}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Earnings</Text>

            <Text style={styles.subtitle}>
              Track your earnings and completed jobs
            </Text>
          </View>

          <TouchableOpacity style={styles.calendarButton} activeOpacity={0.8}>
            <Ionicons name="calendar-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* ================================================= */}
        {/* TOTAL EARNINGS */}
        {/* ================================================= */}

        <View style={styles.totalCard}>
          <View style={styles.totalTop}>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet-outline" size={23} color={colors.accent} />
            </View>

            <View style={styles.monthBadge}>
              <Text style={styles.monthBadgeText}>THIS MONTH</Text>
            </View>
          </View>

          <Text style={styles.totalLabel}>Total earnings</Text>

          <Text style={styles.totalAmount}>{formatMoney(earnings.total)}</Text>

          <View style={styles.growthRow}>
            <View style={styles.growthIcon}>
              <Ionicons name="trending-up" size={14} color={colors.success} />
            </View>

            <Text style={styles.growthText}>
              {earnings.previousMonth > 0
                ? `${Math.abs(earnings.growth).toFixed(1)}% ${
                    earnings.growth >= 0 ? "higher" : "lower"
                  } than last month`
                : "No previous-month earnings available"}
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <Text style={styles.sectionTitle}>Earnings summary</Text>

        <View style={styles.summaryRow}>
          <SummaryCard
            icon="briefcase-outline"
            iconColor={colors.accent}
            iconBackground={colors.accentLight}
            value={earnings.jobs}
            label="Jobs"
          />

          <SummaryCard
            icon="checkmark-circle-outline"
            iconColor={colors.success}
            iconBackground={colors.successLight}
            value={earnings.completed}
            label="Completed"
          />

          <SummaryCard
            icon="star-outline"
            iconColor={colors.warning}
            iconBackground={colors.warningLight}
            value={earnings.rating.toFixed(1)}
            label="Rating"
          />
        </View>

        {/* ================================================= */}
        {/* WEEKLY PERFORMANCE */}
        {/* ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Weekly earnings</Text>

            <Text style={styles.sectionSubtitle}>
              Your earnings over the last 7 days
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartAmountRow}>
            <View>
              <Text style={styles.chartLabel}>This week</Text>

              <Text style={styles.chartAmount}>
                {formatMoney(earnings.thisWeek)}
              </Text>
            </View>

            <View style={styles.chartTrend}>
              <Ionicons name="arrow-up" size={13} color={colors.success} />

              <Text style={styles.chartTrendText}>
                {earnings.thisWeek > 0 ? "Active" : "No earnings"}
              </Text>
            </View>
          </View>

          {/* SIMPLE BAR CHART */}

          <View style={styles.chart}>
            {earnings.daily.map((item, index) => (
              <Bar
                key={`${item.day}-${index}`}
                day={item.day}
                amount={item.amount > 0 ? formatMoney(item.amount) : "₹0"}
                height={Math.max(
                  item.amount > 0 ? (item.amount / maxDailyAmount) * 105 : 4,
                  4,
                )}
                active={index === earnings.daily.length - 1}
              />
            ))}
          </View>
        </View>

        {/* ================================================= */}
        {/* RECENT PAYMENTS */}
        {/* ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recent earnings</Text>

            <Text style={styles.sectionSubtitle}>
              Your latest completed jobs
            </Text>
          </View>

          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {earnings.recent.length === 0 ? (
          <View style={styles.emptyRecentCard}>
            <Ionicons
              name="wallet-outline"
              size={28}
              color={colors.textMuted}
            />

            <Text style={styles.emptyRecentTitle}>No paid earnings yet</Text>

            <Text style={styles.emptyRecentText}>
              Completed jobs will appear here after payment is received.
            </Text>
          </View>
        ) : (
          earnings.recent.map((item) => (
            <EarningItem
              key={item.id}
              icon={item.icon}
              iconColor={item.iconColor}
              iconBackground={item.iconBackground}
              title={item.title}
              customer={item.customer}
              date={item.date}
              amount={item.amount}
            />
          ))
        )}

        {/* ================================================= */}
        {/* PAYMENT INFO */}
        {/* ================================================= */}

        <View style={styles.paymentCard}>
          <View style={styles.paymentIcon}>
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color={colors.success}
            />
          </View>

          <View style={styles.paymentContent}>
            <Text style={styles.paymentTitle}>Payments are up to date</Text>

            <Text style={styles.paymentText}>
              All completed job earnings have been processed successfully.
            </Text>
          </View>
        </View>

        {/* FOOTER */}

        <Text style={styles.footer}>RoadAssist Mechanic • Earnings</Text>
      </ScrollView>

      {/* ================================================= */}
      {/* BOTTOM NAVIGATION */}
      {/* ================================================= */}

      <BottomNavigation />
    </View>
  );
}

/* ========================================================= */
/* SUMMARY CARD */
/* ========================================================= */

function SummaryCard({ icon, iconColor, iconBackground, value, label }) {
  return (
    <View style={styles.summaryCard}>
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <Text style={styles.summaryValue}>{value}</Text>

      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

/* ========================================================= */
/* BAR */
/* ========================================================= */

function Bar({ day, amount, height, active = false }) {
  return (
    <View style={styles.barColumn}>
      <Text style={styles.barAmount}>{amount}</Text>

      <View
        style={[
          styles.bar,
          {
            height,
            backgroundColor: active ? colors.accent : colors.accentLight,
          },
        ]}
      />

      <Text style={styles.barDay}>{day}</Text>
    </View>
  );
}

/* ========================================================= */
/* EARNING ITEM */
/* ========================================================= */

function EarningItem({
  icon,
  iconColor,
  iconBackground,
  title,
  customer,
  date,
  amount,
}) {
  return (
    <TouchableOpacity style={styles.earningCard} activeOpacity={0.85}>
      <View
        style={[
          styles.earningIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons name={icon} size={21} color={iconColor} />
      </View>

      <View style={styles.earningContent}>
        <Text style={styles.earningTitle}>{title}</Text>

        <Text style={styles.earningCustomer}>{customer}</Text>

        <Text style={styles.earningDate}>{date}</Text>
      </View>

      <View style={styles.earningRight}>
        <Text style={styles.earningAmount}>{amount}</Text>

        <View style={styles.paidBadge}>
          <Ionicons name="checkmark" size={10} color={colors.success} />

          <Text style={styles.paidText}>PAID</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ========================================================= */
/* STYLES */
/* ========================================================= */

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontFamily: "InterRegular",
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 8,
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },

  errorText: {
    flex: 1,
    fontFamily: "InterRegular",
    fontSize: 9,
    color: colors.textSecondary,
    marginLeft: 7,
  },

  retryText: {
    fontFamily: "InterSemiBold",
    fontSize: 9,
    color: colors.accent,
    paddingHorizontal: 5,
  },

  emptyRecentCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMedium,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 22,
    alignItems: "center",
    marginBottom: 9,
  },

  emptyRecentTitle: {
    fontFamily: "InterSemiBold",
    fontSize: 11,
    color: colors.text,
    marginTop: 7,
  },

  emptyRecentText: {
    fontFamily: "InterRegular",
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 3,
    textAlign: "center",
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.screenHorizontal,

    paddingTop: 20,

    paddingBottom: 110,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    fontFamily: "InterBold",
    fontSize: 22,
    color: colors.text,
  },

  subtitle: {
    fontFamily: "InterRegular",
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
  },

  calendarButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  /* TOTAL */

  totalCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 18,

    shadowColor: colors.shadow,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  totalTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  walletIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },

  monthBadge: {
    backgroundColor: colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  monthBadgeText: {
    fontFamily: "InterBold",
    fontSize: 7,
    color: colors.accent,
  },

  totalLabel: {
    fontFamily: "InterRegular",
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 17,
  },

  totalAmount: {
    fontFamily: "InterBold",
    fontSize: 30,
    color: colors.text,
    marginTop: 3,
  },

  growthRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  growthIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: colors.successLight,
    alignItems: "center",
    justifyContent: "center",
  },

  growthText: {
    fontFamily: "InterMedium",
    fontSize: 9,
    color: colors.successDark,
    marginLeft: 6,
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 22,
    marginBottom: 10,
  },

  sectionTitle: {
    fontFamily: "InterBold",
    fontSize: 15,
    color: colors.text,
  },

  sectionSubtitle: {
    fontFamily: "InterRegular",
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 3,
  },

  viewAll: {
    fontFamily: "InterSemiBold",
    fontSize: 9,
    color: colors.accent,
  },

  /* SUMMARY */

  summaryRow: {
    flexDirection: "row",
    gap: 9,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMedium,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 11,
  },

  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryValue: {
    fontFamily: "InterBold",
    fontSize: 17,
    color: colors.text,
    marginTop: 8,
  },

  summaryLabel: {
    fontFamily: "InterRegular",
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 2,
  },

  /* CHART */

  chartCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
  },

  chartAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  chartLabel: {
    fontFamily: "InterRegular",
    fontSize: 9,
    color: colors.textMuted,
  },

  chartAmount: {
    fontFamily: "InterBold",
    fontSize: 20,
    color: colors.text,
    marginTop: 2,
  },

  chartTrend: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.successLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  chartTrendText: {
    fontFamily: "InterSemiBold",
    fontSize: 8,
    color: colors.successDark,
    marginLeft: 2,
  },

  chart: {
    height: 155,
    marginTop: 17,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  barColumn: {
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    width: 34,
  },

  barAmount: {
    fontFamily: "InterRegular",
    fontSize: 6,
    color: colors.textLight,
    marginBottom: 4,
  },

  bar: {
    width: 17,
    borderRadius: 6,
  },

  barDay: {
    fontFamily: "InterMedium",
    fontSize: 7,
    color: colors.textMuted,
    marginTop: 7,
    marginBottom: 5,
  },

  /* EARNINGS */

  earningCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMedium,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 13,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  earningIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  earningContent: {
    flex: 1,
  },

  earningTitle: {
    fontFamily: "InterSemiBold",
    fontSize: 11,
    color: colors.text,
  },

  earningCustomer: {
    fontFamily: "InterRegular",
    fontSize: 8,
    color: colors.textSecondary,
    marginTop: 2,
  },

  earningDate: {
    fontFamily: "InterRegular",
    fontSize: 7,
    color: colors.textLight,
    marginTop: 3,
  },

  earningRight: {
    alignItems: "flex-end",
  },

  earningAmount: {
    fontFamily: "InterBold",
    fontSize: 14,
    color: colors.text,
  },

  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.successLight,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 4,
  },

  paidText: {
    fontFamily: "InterBold",
    fontSize: 6,
    color: colors.successDark,
    marginLeft: 2,
  },

  /* PAYMENT */

  paymentCard: {
    backgroundColor: colors.successLight,
    borderRadius: spacing.radiusMedium,
    padding: 13,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  paymentContent: {
    flex: 1,
  },

  paymentTitle: {
    fontFamily: "InterSemiBold",
    fontSize: 10,
    color: colors.text,
  },

  paymentText: {
    fontFamily: "InterRegular",
    fontSize: 8,
    lineHeight: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  /* FOOTER */

  footer: {
    fontFamily: "InterRegular",
    fontSize: 8,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 17,
  },
});
