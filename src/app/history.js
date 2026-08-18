import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import colors from '../constants/colors';
import spacing from '../constants/spacing';

const jobs = [
  {
    service: 'Battery Issue',
    icon: 'battery-charging-outline',
    color: colors.serviceBattery,
    background: colors.warningLight,
    driver: 'Rajesh Kumar',
    vehicle: 'Hyundai i20',
    amount: '₹450',
    date: 'Today, 5:10 PM',
    status: 'Completed',
  },

  {
    service: 'Tyre Issue',
    icon: 'disc-outline',
    color: colors.serviceTyre,
    background: colors.borderLight,
    driver: 'Suresh Kumar',
    vehicle: 'Tata Nexon',
    amount: '₹600',
    date: 'Today, 2:30 PM',
    status: 'Completed',
  },

  {
    service: 'Fuel Issue',
    icon: 'water-outline',
    color: colors.serviceFuel,
    background: colors.warningLight,
    driver: 'Arun Prakash',
    vehicle: 'Maruti Swift',
    amount: '₹500',
    date: 'Yesterday, 7:20 PM',
    status: 'Completed',
  },
];

export default function HistoryScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
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


        <View style={styles.summaryCard}>

          <View style={styles.summaryItem}>

            <Text style={styles.summaryValue}>
              6
            </Text>

            <Text style={styles.summaryLabel}>
              Completed
            </Text>

          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>

            <Text style={styles.summaryValue}>
              ₹2.4K
            </Text>

            <Text style={styles.summaryLabel}>
              Earnings
            </Text>

          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>

            <Text style={styles.summaryValue}>
              4.9
            </Text>

            <Text style={styles.summaryLabel}>
              Rating
            </Text>

          </View>

        </View>


        <Text style={styles.sectionTitle}>
          Recent jobs
        </Text>


        {jobs.map((job) => (

          <View
            key={job.driver + job.date}
            style={styles.jobCard}
          >

            <View style={styles.jobTop}>

              <View
                style={[
                  styles.serviceIcon,
                  {
                    backgroundColor:
                      job.background,
                  },
                ]}
              >

                <Ionicons
                  name={job.icon}
                  size={22}
                  color={job.color}
                />

              </View>

              <View style={styles.jobInfo}>

                <Text style={styles.jobTitle}>
                  {job.service}
                </Text>

                <Text style={styles.jobDate}>
                  {job.date}
                </Text>

              </View>

              <View style={styles.completedBadge}>

                <Text style={styles.completedText}>
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

                <Text style={styles.detailText}>
                  {job.driver}
                </Text>

              </View>

              <View style={styles.detailItem}>

                <Ionicons
                  name="car-outline"
                  size={15}
                  color={colors.textMuted}
                />

                <Text style={styles.detailText}>
                  {job.vehicle}
                </Text>

              </View>

            </View>


            <View style={styles.bottomRow}>

              <Text style={styles.amountLabel}>
                Earned
              </Text>

              <Text style={styles.amount}>
                {job.amount}
              </Text>

            </View>

          </View>

        ))}

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
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 20,
    paddingBottom: 30,
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
});