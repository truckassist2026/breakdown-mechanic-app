import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import colors from '../constants/colors';
import spacing from '../constants/spacing';

export default function ActiveScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams();

  const [arrived, setArrived] = useState(false);

  const handleNext = () => {
    if (!arrived) {
      setArrived(true);
      return;
    }

    router.push({
      pathname: '/service',
      params: {
        requestId: requestId || 'REQ001',
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Active Request</Text>
            <Text style={styles.headerSubtitle}>
              Request #{requestId || 'REQ001'}
            </Text>
          </View>

          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>
        </View>

        {/* Map */}
        <View style={styles.mapCard}>
          <View style={styles.mapArea}>
            <View style={styles.mapRoad1} />
            <View style={styles.mapRoad2} />

            <View style={styles.locationPin}>
              <Ionicons
                name="location"
                size={26}
                color={colors.accent}
              />
            </View>

            <View style={styles.locationLabel}>
              <Text style={styles.locationLabelText}>
                Driver location
              </Text>
            </View>
          </View>

          <View style={styles.locationBottom}>
            <View style={styles.locationInfo}>
              <View style={styles.locationIcon}>
                <Ionicons
                  name="navigate-outline"
                  size={18}
                  color={colors.accent}
                />
              </View>

              <View>
                <Text style={styles.locationTitle}>
                  OMR, Chennai
                </Text>
                <Text style={styles.locationSubtitle}>
                  2.4 km away • Approx. 8 min
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.navigateButton}>
              <Ionicons
                name="navigate"
                size={16}
                color={colors.white}
              />
              <Text style={styles.navigateText}>
                Navigate
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Driver */}
        <Text style={styles.sectionTitle}>Driver details</Text>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RK</Text>
          </View>

          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>
              Rajesh Kumar
            </Text>
            <Text style={styles.driverVehicle}>
              Hyundai i20 • TN 38 AB 4521
            </Text>
          </View>

          <TouchableOpacity style={styles.callButton}>
            <Ionicons
              name="call-outline"
              size={19}
              color={colors.success}
            />
          </TouchableOpacity>
        </View>

        {/* Request */}
        <Text style={styles.sectionTitle}>Request details</Text>

        <View style={styles.card}>
          <DetailRow
            icon="battery-charging-outline"
            iconColor={colors.serviceBattery}
            title="Service"
            value="Battery Issue"
          />

          <View style={styles.divider} />

          <DetailRow
            icon="cash-outline"
            iconColor={colors.success}
            title="Estimated earning"
            value="₹450"
          />

          <View style={styles.divider} />

          <DetailRow
            icon="time-outline"
            iconColor={colors.accent}
            title="Estimated service time"
            value="25 mins"
          />
        </View>

        {/* Status */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIcon,
              arrived && styles.statusIconSuccess,
            ]}
          >
            <Ionicons
              name={
                arrived
                  ? 'checkmark-circle-outline'
                  : 'navigate-outline'
              }
              size={21}
              color={
                arrived
                  ? colors.success
                  : colors.accent
              }
            />
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              {arrived
                ? 'You have arrived'
                : 'On the way'}
            </Text>

            <Text style={styles.statusSubtitle}>
              {arrived
                ? 'You can now start the service.'
                : 'Navigate to the driver location.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>
            {arrived
              ? 'START SERVICE'
              : "I'VE ARRIVED"}
          </Text>

          <View style={styles.buttonIcon}>
            <Ionicons
              name={
                arrived
                  ? 'arrow-forward'
                  : 'checkmark'
              }
              size={19}
              color={colors.white}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DetailRow({
  icon,
  iconColor,
  title,
  value,
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={iconColor}
        />
      </View>

      <View style={styles.detailText}>
        <Text style={styles.detailTitle}>
          {title}
        </Text>

        <Text style={styles.detailValue}>
          {value}
        </Text>
      </View>
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
    paddingTop: 18,
    paddingBottom: 110,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
    marginLeft: 11,
  },

  headerTitle: {
    fontFamily: 'InterBold',
    fontSize: 18,
    color: colors.text,
  },

  headerSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: spacing.radiusRound,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 5,
  },

  activeBadgeText: {
    fontFamily: 'InterBold',
    fontSize: 8,
    color: colors.accent,
  },

  mapCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },

  mapArea: {
    height: 190,
    backgroundColor: colors.mapBackground,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapRoad1: {
    position: 'absolute',
    width: '120%',
    height: 24,
    backgroundColor: colors.mapRoad,
    transform: [{ rotate: '18deg' }],
  },

  mapRoad2: {
    position: 'absolute',
    width: '120%',
    height: 18,
    backgroundColor: colors.mapRoad,
    transform: [{ rotate: '-32deg' }],
  },

  locationPin: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  locationLabel: {
    marginTop: 7,
    backgroundColor: colors.white,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  locationLabelText: {
    fontFamily: 'InterMedium',
    fontSize: 9,
    color: colors.textSecondary,
  },

  locationBottom: {
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  locationIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  locationTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 11,
    color: colors.text,
  },

  locationSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },

  navigateButton: {
    height: 37,
    borderRadius: 11,
    backgroundColor: colors.accent,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  navigateText: {
    fontFamily: 'InterSemiBold',
    fontSize: 9,
    color: colors.white,
  },

  sectionTitle: {
    fontFamily: 'InterBold',
    fontSize: 15,
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.cardPadding,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  avatarText: {
    fontFamily: 'InterBold',
    fontSize: 12,
    color: colors.accent,
  },

  driverInfo: {
    flex: 1,
  },

  driverName: {
    fontFamily: 'InterSemiBold',
    fontSize: 12,
    color: colors.text,
  },

  driverVehicle: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 3,
  },

  callButton: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  detailText: {
    flex: 1,
  },

  detailTitle: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
  },

  detailValue: {
    fontFamily: 'InterSemiBold',
    fontSize: 12,
    color: colors.text,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },

  statusCard: {
    marginTop: 18,
    backgroundColor: colors.accentLight,
    borderRadius: spacing.radiusMedium,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  statusIconSuccess: {
    backgroundColor: colors.successLight,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 11,
    color: colors.text,
  },

  statusSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 2,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: 10,
  },

  primaryButton: {
    height: spacing.buttonHeight,
    borderRadius: 15,
    backgroundColor: colors.accent,
    paddingLeft: 18,
    paddingRight: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  primaryButtonText: {
    flex: 1,
    fontFamily: 'InterBold',
    fontSize: 11,
    color: colors.white,
  },

  buttonIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: colors.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});