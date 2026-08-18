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

const requests = [
  {
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

    description:
      'Vehicle is not starting. Battery seems completely discharged.',

    earning: '₹450',
    estimatedTime: '25 mins',

    requestedAt: 'Just now',

    latitude: 12.9165,
    longitude: 80.2275,
  },

  {
    id: 'REQ002',
    service: 'Tyre Issue',
    icon: 'disc-outline',
    serviceColor: colors.serviceTyre,
    serviceBackground: colors.borderLight,

    driver: 'Suresh Kumar',
    phone: '+91 91234 56789',

    vehicle: 'Tata Nexon',
    vehicleNumber: 'TN 09 CD 7821',

    distance: '4.1 km',
    location: 'Velachery, Chennai',

    description:
      'Rear tyre punctured and vehicle cannot be driven.',

    earning: '₹600',
    estimatedTime: '35 mins',

    requestedAt: '3 mins ago',

    latitude: 12.9750,
    longitude: 80.2212,
  },

  {
    id: 'REQ003',
    service: 'Fuel Issue',
    icon: 'water-outline',
    serviceColor: colors.serviceFuel,
    serviceBackground: colors.warningLight,

    driver: 'Arun Prakash',
    phone: '+91 99887 66554',

    vehicle: 'Maruti Swift',
    vehicleNumber: 'TN 22 EF 1298',

    distance: '5.7 km',
    location: 'Tambaram, Chennai',

    description:
      'Vehicle ran out of fuel and is stopped on the roadside.',

    earning: '₹500',
    estimatedTime: '40 mins',

    requestedAt: '7 mins ago',

    latitude: 12.9249,
    longitude: 80.1000,
  },

  {
    id: 'REQ004',
    service: 'Engine Issue',
    icon: 'settings-outline',
    serviceColor: colors.serviceEngine,
    serviceBackground: '#F3E8FF',

    driver: 'Vignesh R',
    phone: '+91 90000 12345',

    vehicle: 'Mahindra XUV300',
    vehicleNumber: 'TN 11 GH 3388',

    distance: '6.8 km',
    location: 'Guindy, Chennai',

    description:
      'Engine stopped suddenly while driving. Vehicle is currently parked safely.',

    earning: '₹750',
    estimatedTime: '45 mins',

    requestedAt: '12 mins ago',

    latitude: 13.0067,
    longitude: 80.2206,
  },
];

export default function RequestsScreen() {
  const router = useRouter();

  const openRequest = (request) => {
    router.push({
      pathname: '/request-details',
      params: {
        requestId: request.id,
      },
    });
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

          <View style={styles.headerText}>

            <Text style={styles.headerTitle}>
              Available Requests
            </Text>

            <Text style={styles.headerSubtitle}>
              Service requests near you
            </Text>

          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>

        </View>


        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <View style={styles.summaryCard}>

          <View style={styles.summaryIcon}>
            <Ionicons
              name="location-outline"
              size={21}
              color={colors.accent}
            />
          </View>

          <View style={styles.summaryContent}>

            <Text style={styles.summaryTitle}>
              4 requests nearby
            </Text>

            <Text style={styles.summaryText}>
              Showing service requests within 10 km
            </Text>

          </View>

          <View style={styles.liveBadge}>

            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              LIVE
            </Text>

          </View>

        </View>


        {/* =====================================================
            FILTERS
        ===================================================== */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >

          <TouchableOpacity
            style={styles.filterActive}
          >
            <Text style={styles.filterActiveText}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filter}>

            <Ionicons
              name="battery-charging-outline"
              size={15}
              color={colors.textMuted}
            />

            <Text style={styles.filterText}>
              Battery
            </Text>

          </TouchableOpacity>

          <TouchableOpacity style={styles.filter}>

            <Ionicons
              name="disc-outline"
              size={15}
              color={colors.textMuted}
            />

            <Text style={styles.filterText}>
              Tyre
            </Text>

          </TouchableOpacity>

          <TouchableOpacity style={styles.filter}>

            <Ionicons
              name="water-outline"
              size={15}
              color={colors.textMuted}
            />

            <Text style={styles.filterText}>
              Fuel
            </Text>

          </TouchableOpacity>

          <TouchableOpacity style={styles.filter}>

            <Ionicons
              name="settings-outline"
              size={15}
              color={colors.textMuted}
            />

            <Text style={styles.filterText}>
              Engine
            </Text>

          </TouchableOpacity>

        </ScrollView>


        {/* =====================================================
            REQUESTS
        ===================================================== */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Service requests
          </Text>

          <Text style={styles.countText}>
            {requests.length} available
          </Text>

        </View>


        {requests.map((request, index) => (

          <TouchableOpacity
            key={request.id}
            style={styles.requestCard}
            onPress={() => openRequest(request)}
            activeOpacity={0.88}
          >

            {/* TOP */}

            <View style={styles.requestTop}>

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
                  size={23}
                  color={request.serviceColor}
                />

              </View>

              <View style={styles.requestHeading}>

                <View style={styles.titleRow}>

                  <Text style={styles.requestTitle}>
                    {request.service}
                  </Text>

                  {index === 0 && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>
                        NEW
                      </Text>
                    </View>
                  )}

                </View>

                <Text style={styles.requestTime}>
                  {request.requestedAt}
                </Text>

              </View>

              <Ionicons
                name="chevron-forward"
                size={19}
                color={colors.textLight}
              />

            </View>


            {/* LOCATION */}

            <View style={styles.locationRow}>

              <View style={styles.locationIcon}>

                <Ionicons
                  name="location"
                  size={14}
                  color={colors.accent}
                />

              </View>

              <View style={styles.locationContent}>

                <Text style={styles.locationText}>
                  {request.location}
                </Text>

                <Text style={styles.distanceText}>
                  {request.distance} away
                </Text>

              </View>

            </View>


            {/* VEHICLE */}

            <View style={styles.vehicleRow}>

              <View style={styles.vehicleItem}>

                <Ionicons
                  name="person-outline"
                  size={16}
                  color={colors.textMuted}
                />

                <Text style={styles.vehicleText}>
                  {request.driver}
                </Text>

              </View>

              <View style={styles.vehicleItem}>

                <Ionicons
                  name="car-outline"
                  size={16}
                  color={colors.textMuted}
                />

                <Text style={styles.vehicleText}>
                  {request.vehicle}
                </Text>

              </View>

            </View>


            {/* CARD BOTTOM */}

            <View style={styles.cardBottom}>

              <View>

                <Text style={styles.earningLabel}>
                  Estimated earning
                </Text>

                <Text style={styles.earning}>
                  {request.earning}
                </Text>

              </View>

              <View style={styles.viewButton}>

                <Text style={styles.viewButtonText}>
                  VIEW REQUEST
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={colors.accent}
                />

              </View>

            </View>

          </TouchableOpacity>

        ))}

      </ScrollView>


      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ===================================================== */}

      <BottomNavigation />

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

    // Space for bottom navigation
    paddingBottom: 110,
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

  headerText: {
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

  refreshButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },


  /* SUMMARY */

  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 12,
    color: colors.text,
  },

  summaryText: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 4,
  },

  liveText: {
    fontFamily: 'InterBold',
    fontSize: 8,
    color: colors.successDark,
  },


  /* FILTER */

  filterScroll: {
    marginTop: 17,
    marginBottom: 20,
  },

  filterContent: {
    gap: 8,
  },

  filterActive: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterActiveText: {
    fontFamily: 'InterSemiBold',
    fontSize: 10,
    color: colors.white,
  },

  filter: {
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  filterText: {
    fontFamily: 'InterMedium',
    fontSize: 10,
    color: colors.textSecondary,
  },


  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },

  sectionTitle: {
    fontFamily: 'InterBold',
    fontSize: 16,
    color: colors.text,
  },

  countText: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
  },


  /* REQUEST CARD */

  requestCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.cardPadding,
    marginBottom: 12,

    shadowColor: colors.shadow,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.045,
    shadowRadius: 10,
    elevation: 2,
  },

  requestTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  serviceIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  requestHeading: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  requestTitle: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: colors.text,
  },

  requestTime: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },

  newBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 7,
  },

  newBadgeText: {
    fontFamily: 'InterBold',
    fontSize: 7,
    color: colors.accent,
  },


  /* LOCATION */

  locationRow: {
    marginTop: 14,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  locationContent: {
    flex: 1,
  },

  locationText: {
    fontFamily: 'InterSemiBold',
    fontSize: 10,
    color: colors.text,
  },

  distanceText: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },


  /* VEHICLE */

  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 15,
  },

  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  vehicleText: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textSecondary,
    marginLeft: 6,
  },


  /* CARD BOTTOM */

  cardBottom: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 13,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  earningLabel: {
    fontFamily: 'InterRegular',
    fontSize: 8,
    color: colors.textMuted,
  },

  earning: {
    fontFamily: 'InterBold',
    fontSize: 17,
    color: colors.text,
    marginTop: 1,
  },

  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  viewButtonText: {
    fontFamily: 'InterBold',
    fontSize: 8,
    color: colors.accent,
  },

});