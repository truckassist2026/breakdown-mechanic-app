import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import colors from '../constants/colors';
import spacing from '../constants/spacing';

const request = {
  id: 'REQ001',

  service: 'Battery Issue',

  icon: 'battery-charging-outline',

  serviceColor: colors.serviceBattery,

  serviceBackground: colors.warningLight,

  driver: 'Rajesh Kumar',

  phone: '+91 98765 43210',

  vehicle: 'Hyundai i20',

  vehicleNumber: 'TN 38 AB 4521',

  distance: '2.4 km',

  location: 'OMR, Chennai',

  address:
    'Near Sholinganallur Junction, Old Mahabalipuram Road, Chennai',

  description:
    'Vehicle is not starting. Battery seems completely discharged and the driver is unable to start the vehicle.',

  earning: '₹450',

  estimatedTime: '25 mins',

  requestedAt: 'Just now',

  latitude: 12.9165,

  longitude: 80.2275,
};

export default function RequestDetailsScreen() {
  const router = useRouter();

  const { requestId } = useLocalSearchParams();

  const handleAccept = () => {
    router.push({
      pathname: '/active',
      params: {
        requestId: requestId || request.id,
      },
    });
  };

  const callDriver = () => {
    // Phone functionality will be connected later.
  };

  const openMap = () => {
    // Map navigation will be connected later.
  };

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={colors.text}
            />
          </TouchableOpacity>

          <View style={styles.headerContent}>

            <Text style={styles.headerTitle}>
              Request Details
            </Text>

            <Text style={styles.headerSubtitle}>
              Service request
            </Text>

          </View>

          <View style={styles.requestIdBadge}>

            <Text style={styles.requestIdText}>
              #{request.id}
            </Text>

          </View>

        </View>


        {/* =====================================================
            SERVICE HEADER
        ===================================================== */}

        <View style={styles.serviceCard}>

          <View
            style={[
              styles.serviceIcon,
              {
                backgroundColor:
                  request.serviceBackground,
              },
            ]}
          >

            <Ionicons
              name={request.icon}
              size={28}
              color={request.serviceColor}
            />

          </View>

          <View style={styles.serviceInfo}>

            <View style={styles.serviceTitleRow}>

              <Text style={styles.serviceTitle}>
                {request.service}
              </Text>

              <View style={styles.newBadge}>

                <Text style={styles.newBadgeText}>
                  NEW
                </Text>

              </View>

            </View>

            <Text style={styles.serviceTime}>
              Requested {request.requestedAt}
            </Text>

          </View>

        </View>


        {/* =====================================================
            LOCATION
        ===================================================== */}

        <Text style={styles.sectionTitle}>
          Service location
        </Text>

        <TouchableOpacity
          style={styles.locationCard}
          onPress={openMap}
          activeOpacity={0.85}
        >

          <View style={styles.mapPlaceholder}>

            <Ionicons
              name="location"
              size={28}
              color={colors.accent}
            />

            <Text style={styles.mapText}>
              Service location
            </Text>

          </View>

          <View style={styles.locationDetails}>

            <View style={styles.locationMain}>

              <View style={styles.locationIcon}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={colors.accent}
                />
              </View>

              <View style={styles.locationTextArea}>

                <Text style={styles.locationTitle}>
                  {request.location}
                </Text>

                <Text style={styles.address}>
                  {request.address}
                </Text>

              </View>

            </View>

            <View style={styles.distanceBadge}>

              <Ionicons
                name="navigate-outline"
                size={14}
                color={colors.accent}
              />

              <Text style={styles.distanceText}>
                {request.distance}
              </Text>

            </View>

          </View>

        </TouchableOpacity>


        {/* =====================================================
            DRIVER
        ===================================================== */}

        <Text style={styles.sectionTitle}>
          Driver & vehicle
        </Text>

        <View style={styles.driverCard}>

          <View style={styles.profileRow}>

            <View style={styles.avatar}>

              <Text style={styles.avatarText}>
                RK
              </Text>

            </View>

            <View style={styles.profileInfo}>

              <Text style={styles.driverName}>
                {request.driver}
              </Text>

              <Text style={styles.driverPhone}>
                {request.phone}
              </Text>

            </View>

            <TouchableOpacity
              style={styles.callButton}
              onPress={callDriver}
              activeOpacity={0.8}
            >

              <Ionicons
                name="call-outline"
                size={19}
                color={colors.success}
              />

            </TouchableOpacity>

          </View>


          <View style={styles.divider} />


          <View style={styles.vehicleDetails}>

            <View style={styles.vehicleIcon}>

              <Ionicons
                name="car-sport-outline"
                size={21}
                color={colors.accent}
              />

            </View>

            <View>

              <Text style={styles.vehicleName}>
                {request.vehicle}
              </Text>

              <Text style={styles.vehicleNumber}>
                {request.vehicleNumber}
              </Text>

            </View>

          </View>

        </View>


        {/* =====================================================
            PROBLEM
        ===================================================== */}

        <Text style={styles.sectionTitle}>
          Problem description
        </Text>

        <View style={styles.descriptionCard}>

          <View style={styles.descriptionIcon}>

            <Ionicons
              name="document-text-outline"
              size={19}
              color={colors.textMuted}
            />

          </View>

          <Text style={styles.descriptionText}>
            {request.description}
          </Text>

        </View>


        {/* =====================================================
            SERVICE INFORMATION
        ===================================================== */}

        <Text style={styles.sectionTitle}>
          Service information
        </Text>

        <View style={styles.infoCard}>

          <View style={styles.infoItem}>

            <View style={styles.infoIcon}>
              <Ionicons
                name="cash-outline"
                size={18}
                color={colors.success}
              />
            </View>

            <View style={styles.infoTextArea}>

              <Text style={styles.infoLabel}>
                Estimated earning
              </Text>

              <Text style={styles.infoValue}>
                {request.earning}
              </Text>

            </View>

          </View>


          <View style={styles.infoItem}>

            <View style={styles.infoIcon}>
              <Ionicons
                name="time-outline"
                size={18}
                color={colors.accent}
              />
            </View>

            <View style={styles.infoTextArea}>

              <Text style={styles.infoLabel}>
                Estimated service time
              </Text>

              <Text style={styles.infoValue}>
                {request.estimatedTime}
              </Text>

            </View>

          </View>

        </View>


        {/* =====================================================
            ACCEPT INFORMATION
        ===================================================== */}

        <View style={styles.noticeCard}>

          <View style={styles.noticeIcon}>

            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.accent}
            />

          </View>

          <View style={styles.noticeContent}>

            <Text style={styles.noticeTitle}>
              Before accepting
            </Text>

            <Text style={styles.noticeText}>
              Make sure you're available to reach the
              driver and provide the requested service.
            </Text>

          </View>

        </View>

      </ScrollView>


      {/* =====================================================
          BOTTOM ACTION
      ===================================================== */}

      <View style={styles.bottomBar}>

        <View style={styles.earningArea}>

          <Text style={styles.bottomLabel}>
            Estimated earning
          </Text>

          <Text style={styles.bottomAmount}>
            {request.earning}
          </Text>

        </View>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAccept}
          activeOpacity={0.85}
        >

          <Text style={styles.acceptText}>
            ACCEPT REQUEST
          </Text>

          <View style={styles.acceptArrow}>

            <Ionicons
              name="arrow-forward"
              size={18}
              color={colors.white}
            />

          </View>

        </TouchableOpacity>

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
    paddingTop: 20,
    paddingBottom: 125,
  },


  /* HEADER */

  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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

  headerContent: {
    flex: 1,
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

  requestIdBadge: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  requestIdText: {
    fontFamily: 'InterSemiBold',
    fontSize: 8,
    color: colors.textMuted,
  },


  /* SERVICE */

  serviceCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  serviceIcon: {
    width: 53,
    height: 53,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  serviceInfo: {
    flex: 1,
  },

  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  serviceTitle: {
    fontFamily: 'InterBold',
    fontSize: 17,
    color: colors.text,
  },

  newBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 8,
  },

  newBadgeText: {
    fontFamily: 'InterBold',
    fontSize: 7,
    color: colors.accent,
  },

  serviceTime: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },


  /* SECTIONS */

  sectionTitle: {
    fontFamily: 'InterBold',
    fontSize: 15,
    color: colors.text,
    marginTop: 22,
    marginBottom: 10,
  },


  /* LOCATION */

  locationCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },

  mapPlaceholder: {
    height: 115,
    backgroundColor: colors.mapBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapText: {
    fontFamily: 'InterMedium',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 5,
  },

  locationDetails: {
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  locationTextArea: {
    flex: 1,
  },

  locationTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 11,
    color: colors.text,
  },

  address: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    lineHeight: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: 8,
  },

  distanceText: {
    fontFamily: 'InterSemiBold',
    fontSize: 8,
    color: colors.accent,
    marginLeft: 3,
  },


  /* DRIVER */

  driverCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.cardPadding,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  avatarText: {
    fontFamily: 'InterBold',
    fontSize: 12,
    color: colors.white,
  },

  profileInfo: {
    flex: 1,
  },

  driverName: {
    fontFamily: 'InterSemiBold',
    fontSize: 12,
    color: colors.text,
  },

  driverPhone: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },

  callButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 13,
  },

  vehicleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  vehicleName: {
    fontFamily: 'InterSemiBold',
    fontSize: 11,
    color: colors.text,
  },

  vehicleNumber: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },


  /* DESCRIPTION */

  descriptionCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMedium,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    flexDirection: 'row',
  },

  descriptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  descriptionText: {
    flex: 1,
    fontFamily: 'InterRegular',
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
  },


  /* INFO */

  infoCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMedium,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },

  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  infoTextArea: {
    flex: 1,
  },

  infoLabel: {
    fontFamily: 'InterRegular',
    fontSize: 8,
    color: colors.textMuted,
  },

  infoValue: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },


  /* NOTICE */

  noticeCard: {
    marginTop: 18,
    backgroundColor: colors.infoLight,
    borderRadius: spacing.radiusMedium,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  noticeIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  noticeContent: {
    flex: 1,
  },

  noticeTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 10,
    color: colors.text,
  },

  noticeText: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    lineHeight: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },


  /* BOTTOM */

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  earningArea: {
    width: 100,
  },

  bottomLabel: {
    fontFamily: 'InterRegular',
    fontSize: 8,
    color: colors.textMuted,
  },

  bottomAmount: {
    fontFamily: 'InterBold',
    fontSize: 18,
    color: colors.text,
    marginTop: 1,
  },

  acceptButton: {
    flex: 1,
    height: 52,
    borderRadius: 15,
    backgroundColor: colors.accent,
    paddingLeft: 16,
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  acceptText: {
    flex: 1,
    fontFamily: 'InterBold',
    fontSize: 11,
    color: colors.white,
  },

  acceptArrow: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

});