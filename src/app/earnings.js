import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavigation from '../components/BottomNavigation';

import colors from '../constants/colors';
import spacing from '../constants/spacing';

export default function EarningsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              My Earnings
            </Text>

            <Text style={styles.subtitle}>
              Track your earnings and completed jobs
            </Text>
          </View>

          <TouchableOpacity
            style={styles.calendarButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>


        {/* ================================================= */}
        {/* TOTAL EARNINGS */}
        {/* ================================================= */}

        <View style={styles.totalCard}>

          <View style={styles.totalTop}>
            <View style={styles.walletIcon}>
              <Ionicons
                name="wallet-outline"
                size={23}
                color={colors.accent}
              />
            </View>

            <View style={styles.monthBadge}>
              <Text style={styles.monthBadgeText}>
                THIS MONTH
              </Text>
            </View>
          </View>

          <Text style={styles.totalLabel}>
            Total earnings
          </Text>

          <Text style={styles.totalAmount}>
            ₹18,750
          </Text>

          <View style={styles.growthRow}>
            <View style={styles.growthIcon}>
              <Ionicons
                name="trending-up"
                size={14}
                color={colors.success}
              />
            </View>

            <Text style={styles.growthText}>
              12.5% higher than last month
            </Text>
          </View>

        </View>


        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <Text style={styles.sectionTitle}>
          Earnings summary
        </Text>

        <View style={styles.summaryRow}>

          <SummaryCard
            icon="briefcase-outline"
            iconColor={colors.accent}
            iconBackground={colors.accentLight}
            value="32"
            label="Jobs"
          />

          <SummaryCard
            icon="checkmark-circle-outline"
            iconColor={colors.success}
            iconBackground={colors.successLight}
            value="30"
            label="Completed"
          />

          <SummaryCard
            icon="star-outline"
            iconColor={colors.warning}
            iconBackground={colors.warningLight}
            value="4.9"
            label="Rating"
          />

        </View>


        {/* ================================================= */}
        {/* WEEKLY PERFORMANCE */}
        {/* ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Weekly earnings
            </Text>

            <Text style={styles.sectionSubtitle}>
              Your earnings over the last 7 days
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>

          <View style={styles.chartAmountRow}>
            <View>
              <Text style={styles.chartLabel}>
                This week
              </Text>

              <Text style={styles.chartAmount}>
                ₹5,850
              </Text>
            </View>

            <View style={styles.chartTrend}>
              <Ionicons
                name="arrow-up"
                size={13}
                color={colors.success}
              />

              <Text style={styles.chartTrendText}>
                8.4%
              </Text>
            </View>
          </View>


          {/* SIMPLE BAR CHART */}

          <View style={styles.chart}>

            <Bar
              day="Mon"
              amount="₹650"
              height={55}
            />

            <Bar
              day="Tue"
              amount="₹900"
              height={78}
            />

            <Bar
              day="Wed"
              amount="₹450"
              height={40}
            />

            <Bar
              day="Thu"
              amount="₹1.1K"
              height={95}
              active
            />

            <Bar
              day="Fri"
              amount="₹750"
              height={65}
            />

            <Bar
              day="Sat"
              amount="₹1.2K"
              height={105}
            />

            <Bar
              day="Sun"
              amount="₹800"
              height={70}
            />

          </View>

        </View>


        {/* ================================================= */}
        {/* RECENT PAYMENTS */}
        {/* ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Recent earnings
            </Text>

            <Text style={styles.sectionSubtitle}>
              Your latest completed jobs
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
          >
            <Text style={styles.viewAll}>
              View all
            </Text>
          </TouchableOpacity>
        </View>


        <EarningItem
          icon="battery-charging-outline"
          iconColor={colors.serviceBattery}
          iconBackground={colors.warningLight}
          title="Battery Issue"
          customer="Rajesh Kumar"
          date="Today • 10:35 AM"
          amount="₹450"
        />

        <EarningItem
          icon="disc-outline"
          iconColor={colors.serviceTyre}
          iconBackground={colors.borderLight}
          title="Tyre Issue"
          customer="Suresh Kumar"
          date="Yesterday • 4:20 PM"
          amount="₹600"
        />

        <EarningItem
          icon="water-outline"
          iconColor={colors.serviceFuel}
          iconBackground={colors.warningLight}
          title="Fuel Delivery"
          customer="Arun Prakash"
          date="Yesterday • 11:15 AM"
          amount="₹500"
        />

        <EarningItem
          icon="settings-outline"
          iconColor={colors.serviceEngine}
          iconBackground="#F3E8FF"
          title="Engine Issue"
          customer="Vignesh R"
          date="12 Aug • 6:40 PM"
          amount="₹750"
        />


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

            <Text style={styles.paymentTitle}>
              Payments are up to date
            </Text>

            <Text style={styles.paymentText}>
              All completed job earnings have been
              processed successfully.
            </Text>

          </View>

        </View>


        {/* FOOTER */}

        <Text style={styles.footer}>
          RoadAssist Mechanic • Earnings
        </Text>

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

function SummaryCard({
  icon,
  iconColor,
  iconBackground,
  value,
  label,
}) {
  return (
    <View style={styles.summaryCard}>

      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={iconColor}
        />
      </View>

      <Text style={styles.summaryValue}>
        {value}
      </Text>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>

    </View>
  );
}


/* ========================================================= */
/* BAR */
/* ========================================================= */

function Bar({
  day,
  amount,
  height,
  active = false,
}) {
  return (
    <View style={styles.barColumn}>

      <Text style={styles.barAmount}>
        {amount}
      </Text>

      <View
        style={[
          styles.bar,
          {
            height,
            backgroundColor: active
              ? colors.accent
              : colors.accentLight,
          },
        ]}
      />

      <Text style={styles.barDay}>
        {day}
      </Text>

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
    <TouchableOpacity
      style={styles.earningCard}
      activeOpacity={0.85}
    >

      <View
        style={[
          styles.earningIcon,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={iconColor}
        />
      </View>

      <View style={styles.earningContent}>

        <Text style={styles.earningTitle}>
          {title}
        </Text>

        <Text style={styles.earningCustomer}>
          {customer}
        </Text>

        <Text style={styles.earningDate}>
          {date}
        </Text>

      </View>

      <View style={styles.earningRight}>

        <Text style={styles.earningAmount}>
          {amount}
        </Text>

        <View style={styles.paidBadge}>
          <Ionicons
            name="checkmark"
            size={10}
            color={colors.success}
          />

          <Text style={styles.paidText}>
            PAID
          </Text>
        </View>

      </View>

    </TouchableOpacity>
  );
}


/* ========================================================= */
/* STYLES */
/* ========================================================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  content: {
    paddingHorizontal:
      spacing.screenHorizontal,

    paddingTop: 20,

    paddingBottom: 110,
  },


  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  title: {
    fontFamily: 'InterBold',
    fontSize: 22,
    color: colors.text,
  },

  subtitle: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
  },

  calendarButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor:
      colors.white,
    borderWidth: 1,
    borderColor:
      colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },


  /* TOTAL */

  totalCard: {
    backgroundColor:
      colors.white,
    borderRadius:
      spacing.radiusLarge,
    borderWidth: 1,
    borderColor:
      colors.borderLight,
    padding: 18,

    shadowColor:
      colors.shadow,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  totalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  walletIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor:
      colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  monthBadge: {
    backgroundColor:
      colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  monthBadgeText: {
    fontFamily: 'InterBold',
    fontSize: 7,
    color: colors.accent,
  },

  totalLabel: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 17,
  },

  totalAmount: {
    fontFamily: 'InterBold',
    fontSize: 30,
    color: colors.text,
    marginTop: 3,
  },

  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  growthIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor:
      colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  growthText: {
    fontFamily: 'InterMedium',
    fontSize: 9,
    color: colors.successDark,
    marginLeft: 6,
  },


  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 22,
    marginBottom: 10,
  },

  sectionTitle: {
    fontFamily: 'InterBold',
    fontSize: 15,
    color: colors.text,
  },

  sectionSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 3,
  },

  viewAll: {
    fontFamily: 'InterSemiBold',
    fontSize: 9,
    color: colors.accent,
  },


  /* SUMMARY */

  summaryRow: {
    flexDirection: 'row',
    gap: 9,
  },

  summaryCard: {
    flex: 1,
    backgroundColor:
      colors.white,
    borderRadius:
      spacing.radiusMedium,
    borderWidth: 1,
    borderColor:
      colors.borderLight,
    padding: 11,
  },

  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryValue: {
    fontFamily: 'InterBold',
    fontSize: 17,
    color: colors.text,
    marginTop: 8,
  },

  summaryLabel: {
    fontFamily: 'InterRegular',
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 2,
  },


  /* CHART */

  chartCard: {
    backgroundColor:
      colors.white,
    borderRadius:
      spacing.radiusLarge,
    borderWidth: 1,
    borderColor:
      colors.borderLight,
    padding: 16,
  },

  chartAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  chartLabel: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
  },

  chartAmount: {
    fontFamily: 'InterBold',
    fontSize: 20,
    color: colors.text,
    marginTop: 2,
  },

  chartTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      colors.successLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  chartTrendText: {
    fontFamily: 'InterSemiBold',
    fontSize: 8,
    color: colors.successDark,
    marginLeft: 2,
  },

  chart: {
    height: 155,
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent:
      'space-between',
    borderBottomWidth: 1,
    borderBottomColor:
      colors.borderLight,
  },

  barColumn: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 34,
  },

  barAmount: {
    fontFamily: 'InterRegular',
    fontSize: 6,
    color: colors.textLight,
    marginBottom: 4,
  },

  bar: {
    width: 17,
    borderRadius: 6,
  },

  barDay: {
    fontFamily: 'InterMedium',
    fontSize: 7,
    color: colors.textMuted,
    marginTop: 7,
    marginBottom: 5,
  },


  /* EARNINGS */

  earningCard: {
    backgroundColor:
      colors.white,
    borderRadius:
      spacing.radiusMedium,
    borderWidth: 1,
    borderColor:
      colors.borderLight,
    padding: 13,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  earningIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  earningContent: {
    flex: 1,
  },

  earningTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 11,
    color: colors.text,
  },

  earningCustomer: {
    fontFamily: 'InterRegular',
    fontSize: 8,
    color: colors.textSecondary,
    marginTop: 2,
  },

  earningDate: {
    fontFamily: 'InterRegular',
    fontSize: 7,
    color: colors.textLight,
    marginTop: 3,
  },

  earningRight: {
    alignItems: 'flex-end',
  },

  earningAmount: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: colors.text,
  },

  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      colors.successLight,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 4,
  },

  paidText: {
    fontFamily: 'InterBold',
    fontSize: 6,
    color: colors.successDark,
    marginLeft: 2,
  },


  /* PAYMENT */

  paymentCard: {
    backgroundColor:
      colors.successLight,
    borderRadius:
      spacing.radiusMedium,
    padding: 13,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor:
      colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  paymentContent: {
    flex: 1,
  },

  paymentTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 10,
    color: colors.text,
  },

  paymentText: {
    fontFamily: 'InterRegular',
    fontSize: 8,
    lineHeight: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },


  /* FOOTER */

  footer: {
    fontFamily: 'InterRegular',
    fontSize: 8,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 17,
  },

});