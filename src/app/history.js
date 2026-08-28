import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import colors from '../constants/colors';
import spacing from '../constants/spacing';

import {
  getMechanicRequestHistory,
  getMyMechanicProfile,
  getServicePayment,
} from '../services/mechanicApi';

const getArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.requests)) return response.requests;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data?.requests)) return response.data.requests;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  return [];
};

const statusOf = (value) =>
  String(value || '').trim().toUpperCase();

const amountOf = (payment) => {
  const value =
    payment?.amount ??
    payment?.serviceAmount ??
    payment?.price ??
    payment?.totalAmount ??
    null;

  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const isPaid = (payment) =>
  ['PAID', 'SUCCESS', 'COMPLETED'].includes(
    statusOf(payment?.status)
  ) || Boolean(payment?.paidAt);

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = toDate(value);

  if (!date) {
    return 'Date unavailable';
  }

  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;

const getDriverName = (request) =>
  request?.driver?.name ||
  request?.driver?.fullName ||
  request?.driverName ||
  request?.driver?.mobile ||
  'Driver';

const getVehicleName = (request) =>
  request?.vehicle?.name ||
  request?.vehicle?.model ||
  request?.vehicle?.vehicleName ||
  request?.vehicleName ||
  request?.vehicle?.registrationNumber ||
  'Vehicle';

const getCategory = (request) =>
  request?.service ||
  request?.serviceName ||
  request?.category ||
  request?.serviceCategory ||
  'Service';

const categoryMeta = (category) => {
  const value = String(category || '').toUpperCase();

  if (value.includes('BATTERY')) {
    return {
      icon: 'battery-charging-outline',
      color: colors.serviceBattery,
      background: colors.warningLight,
    };
  }

  if (value.includes('TYRE') || value.includes('TIRE')) {
    return {
      icon: 'disc-outline',
      color: colors.serviceTyre,
      background: colors.borderLight,
    };
  }

  if (value.includes('FUEL') || value.includes('DIESEL')) {
    return {
      icon: 'water-outline',
      color: colors.serviceFuel,
      background: colors.warningLight,
    };
  }

  return {
    icon: 'construct-outline',
    color: colors.accent,
    background: colors.accentLight,
  };
};

export default function HistoryScreen() {
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rating, setRating] = useState(0);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError(null);

      const [historyResponse, profileResponse] =
        await Promise.all([
          getMechanicRequestHistory(),
          getMyMechanicProfile(),
        ]);

      const requests = getArray(historyResponse);

      const completedRequests = requests.filter(
        (request) =>
          statusOf(request?.status) === 'COMPLETED'
      );

      const paymentResults =
        await Promise.all(
          completedRequests.map(async (request) => {
            try {
              const payment =
                await getServicePayment(request.id);

              return {
                request,
                payment,
                amount: amountOf(payment),
                paid: isPaid(payment),
                date:
                  toDate(payment?.paidAt) ||
                  toDate(payment?.createdAt) ||
                  toDate(request?.completedAt) ||
                  toDate(request?.createdAt),
              };
            } catch {
              return {
                request,
                payment: null,
                amount: 0,
                paid: false,
                date:
                  toDate(request?.completedAt) ||
                  toDate(request?.createdAt),
              };
            }
          })
        );

      const sorted = paymentResults.sort(
        (a, b) =>
          (b.date?.getTime() || 0) -
          (a.date?.getTime() || 0)
      );

      setJobs(sorted);

      const profileRating =
        profileResponse?.rating ??
        profileResponse?.averageRating ??
        profileResponse?.average_rating ??
        0;

      setRating(Number(profileRating) || 0);
    } catch (loadError) {
      console.error(
        '[MECHANIC HISTORY] Load error:',
        loadError
      );

      setError(
        loadError?.message ||
          'Unable to load job history.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(true);
  }, [loadHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory(false);
  }, [loadHistory]);

  const completedCount = jobs.length;

  const totalEarnings = jobs.reduce(
    (sum, item) =>
      sum +
      (item.paid ? item.amount : 0),
    0
  );

  if (loading && jobs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.accent}
          />

          <Text style={styles.loadingText}>
            Loading job history...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={colors.text}
            />
          </TouchableOpacity>

          <View>
            <Text style={styles.title}>
              Job History
            </Text>

            <Text style={styles.subtitle}>
              Your completed service requests
            </Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={colors.danger}
            />

            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadHistory(true)}
            >
              <Text style={styles.retryText}>
                RETRY
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {completedCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Completed
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {formatMoney(totalEarnings)}
            </Text>

            <Text style={styles.summaryLabel}>
              Earnings
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {rating.toFixed(1)}
            </Text>

            <Text style={styles.summaryLabel}>
              Rating
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Recent jobs
        </Text>

        {jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="construct-outline"
                size={32}
                color={colors.accent}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No completed jobs
            </Text>

            <Text style={styles.emptyText}>
              Your completed service requests will
              appear here.
            </Text>
          </View>
        ) : (
          jobs.map((item, index) => {
            const job = item.request;
            const meta = categoryMeta(
              getCategory(job)
            );

            return (
              <TouchableOpacity
                key={
                  String(job?.id || index)
                }
                activeOpacity={0.92}
                style={styles.jobCard}
                onPress={() =>
                  router.push({
                    pathname:
                      '/request-details',
                    params: {
                      requestId:
                        String(job.id),
                    },
                  })
                }
              >
                <View style={styles.jobTop}>
                  <View
                    style={[
                      styles.serviceIcon,
                      {
                        backgroundColor:
                          meta.background,
                      },
                    ]}
                  >
                    <Ionicons
                      name={meta.icon}
                      size={22}
                      color={meta.color}
                    />
                  </View>

                  <View style={styles.jobInfo}>
                    <Text
                      style={styles.jobTitle}
                      numberOfLines={1}
                    >
                      {getCategory(job)}
                    </Text>

                    <Text style={styles.jobDate}>
                      {formatDate(item.date)}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.completedBadge
                    }
                  >
                    <Text
                      style={
                        styles.completedText
                      }
                    >
                      COMPLETED
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="person-outline"
                      size={15}
                      color={colors.textMuted}
                    />

                    <Text
                      style={styles.detailText}
                      numberOfLines={1}
                    >
                      {getDriverName(job)}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Ionicons
                      name="car-outline"
                      size={15}
                      color={colors.textMuted}
                    />

                    <Text
                      style={styles.detailText}
                      numberOfLines={1}
                    >
                      {getVehicleName(job)}
                    </Text>
                  </View>
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.amountLabel}>
                    {item.paid
                      ? 'Earned'
                      : 'Amount'}
                  </Text>

                  <Text style={styles.amount}>
                    {item.amount > 0
                      ? formatMoney(
                          item.amount
                        )
                      : '—'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal:
      spacing.screenHorizontal,
    paddingTop: 20,
    paddingBottom: 30,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  loadingText: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 10,
  },

  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  title: {
    fontFamily: 'InterBold',
    fontSize: 18,
    color: colors.text,
  },

  subtitle: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },

  errorCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 13,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  errorText: {
    flex: 1,
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textSecondary,
    marginHorizontal: 9,
  },

  retryButton: {
    backgroundColor: colors.accent,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  retryText: {
    fontFamily: 'InterBold',
    fontSize: 7,
    color: colors.white,
  },

  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusLarge,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryValue: {
    fontFamily: 'InterBold',
    fontSize: 18,
    color: colors.white,
  },

  summaryLabel: {
    fontFamily: 'InterRegular',
    fontSize: 8,
    color: '#CBD5E1',
    marginTop: 3,
  },

  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#334155',
  },

  sectionTitle: {
    fontFamily: 'InterBold',
    fontSize: 15,
    color: colors.text,
    marginTop: 23,
    marginBottom: 10,
  },

  jobCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.cardPadding,
    marginBottom: 11,
  },

  jobTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  serviceIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  jobInfo: {
    flex: 1,
  },

  jobTitle: {
    fontFamily: 'InterBold',
    fontSize: 12,
    color: colors.text,
  },

  jobDate: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },

  completedBadge: {
    backgroundColor: colors.successLight,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  completedText: {
    fontFamily: 'InterBold',
    fontSize: 7,
    color: colors.successDark,
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },

  detailsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailText: {
    flex: 1,
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textSecondary,
    marginLeft: 6,
  },

  bottomRow: {
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  amountLabel: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
  },

  amount: {
    fontFamily: 'InterBold',
    fontSize: 16,
    color: colors.successDark,
  },

  emptyState: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 30,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontFamily: 'InterBold',
    fontSize: 13,
    color: colors.text,
    marginTop: 12,
  },

  emptyText: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 14,
  },
});
