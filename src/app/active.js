import {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import colors from '../constants/colors';
import spacing from '../constants/spacing';

import {
  getMechanicRequestById,
  updateMechanicRequestStatus,
} from '../services/mechanicApi';
import BottomNavigation from '../components/BottomNavigation';

// =========================================================
// HELPERS
// =========================================================

function getInitials(name) {

  if (!name) {
    return 'DR';
  }

  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0).toUpperCase()
    )
    .join('');
}


function getServiceName(category) {

  const map = {
    BATTERY: 'Battery Assistance',
    TYRE: 'Tyre Issue',
    FUEL: 'Fuel Assistance',
    BREAKDOWN: 'Breakdown Assistance',
    TOWING: 'Towing Assistance',
  };

  return (
    map[
      String(category || '')
        .toUpperCase()
    ] ||
    category ||
    'Service Request'
  );
}


function formatVehicle(vehicle) {

  if (!vehicle) {
    return 'Vehicle details unavailable';
  }

  const manufacturer =
    vehicle.manufacturer || '';

  const model =
    vehicle.model || '';

  const registration =
    vehicle.registrationNumber || '';

  const vehicleName =
    [
      manufacturer,
      model,
    ]
      .filter(Boolean)
      .join(' ');

  if (
    vehicleName &&
    registration
  ) {
    return `${vehicleName} • ${registration}`;
  }

  return (
    vehicleName ||
    registration ||
    'Vehicle details unavailable'
  );
}


function formatDistance(distanceKm) {

  if (
    distanceKm === null ||
    distanceKm === undefined ||
    Number.isNaN(
      Number(distanceKm)
    )
  ) {
    return 'Distance unavailable';
  }

  const distance =
    Number(distanceKm);

  return `${distance.toFixed(1)} km away`;
}


function calculateEta(distanceKm) {

  if (
    distanceKm === null ||
    distanceKm === undefined
  ) {
    return null;
  }

  const distance =
    Number(distanceKm);

  if (
    Number.isNaN(distance)
  ) {
    return null;
  }

  const minutes =
    Math.max(
      2,
      Math.round(
        distance * 4
      )
    );

  return minutes;
}


function normalizeStatus(status) {

  return String(
    status || ''
  )
    .trim()
    .toUpperCase();
}


// =========================================================
// ACTIVE SCREEN
// =========================================================

export default function ActiveScreen() {

  const router =
    useRouter();


  const params =
    useLocalSearchParams();


  const requestId =
    Array.isArray(
      params.requestId
    )
      ? params.requestId[0]
      : params.requestId;


  // =======================================================
  // STATE
  // =======================================================

  const [
    request,
    setRequest,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState('');


  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);


  // =======================================================
  // LOAD REQUEST
  // =======================================================

  async function loadRequest(
    showLoader = true
  ) {

    console.log(
      '===================================='
    );

    console.log(
      '[MECHANIC ACTIVE] Loading request'
    );

    console.log(
      '[MECHANIC ACTIVE] Request ID:',
      requestId
    );


    if (!requestId) {

      console.error(
        '[MECHANIC ACTIVE] Missing requestId'
      );

      setError(
        'Request ID is missing.'
      );

      setLoading(false);

      return;
    }


    try {

      if (showLoader) {
        setLoading(true);
      }

      setError('');


      const response =
        await getMechanicRequestById(
          requestId
        );


      console.log(
        '[MECHANIC ACTIVE] API response:',
        JSON.stringify(
          response,
          null,
          2
        )
      );


      console.log(
        '[MECHANIC ACTIVE] Backend status:',
        response?.status
      );


      setRequest(
        response
      );

    } catch (err) {

      console.error(
        '[MECHANIC ACTIVE] Request error:',
        err
      );


      setError(
        err?.message ||
        'Unable to load request.'
      );

    } finally {

      setLoading(false);

    }
  }


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(
    () => {

      loadRequest();

    },
    [
      requestId,
    ]
  );


  // =======================================================
  // UPDATE STATUS
  // =======================================================

  const handleStatusUpdate =
    async (
      nextStatus
    ) => {

      if (
        !requestId ||
        updatingStatus
      ) {
        return;
      }


      const currentStatus =
        normalizeStatus(
          request?.status
        );


      const targetStatus =
        normalizeStatus(
          nextStatus
        );


      console.log(
        '===================================='
      );

      console.log(
        '[MECHANIC ACTIVE] Status update'
      );

      console.log(
        '[MECHANIC ACTIVE] Request ID:',
        requestId
      );

      console.log(
        '[MECHANIC ACTIVE] Current:',
        currentStatus
      );

      console.log(
        '[MECHANIC ACTIVE] Target:',
        targetStatus
      );


      try {

        setUpdatingStatus(true);


        const response =
          await updateMechanicRequestStatus(
            requestId,
            targetStatus
          );


        console.log(
          '[MECHANIC ACTIVE] Status response:',
          JSON.stringify(
            response,
            null,
            2
          )
        );


        // -------------------------------------------------
        // ALWAYS RELOAD FROM BACKEND
        // -------------------------------------------------

        await loadRequest(
          false
        );

        return true;


      } catch (err) {

        console.error(
          '[MECHANIC ACTIVE] Status update error:',
          err
        );


        Alert.alert(
          'Unable to Update',
          err?.data?.message ||
          err?.message ||
          `Unable to update status to ${targetStatus}.`
        );

        return false;

      } finally {

        setUpdatingStatus(false);

      }
    };


  // =======================================================
  // CALL DRIVER
  // =======================================================

  const handleCallDriver =
    async () => {

      const phone =
        request?.driver?.phone;


      if (!phone) {

        console.log(
          '[MECHANIC ACTIVE] Driver phone unavailable'
        );

        return;
      }


      try {

        await Linking.openURL(
          `tel:${phone}`
        );

      } catch (err) {

        console.error(
          '[MECHANIC ACTIVE] Unable to call:',
          err
        );

      }
    };


  // =======================================================
  // NAVIGATE
  // =======================================================

  const handleNavigate =
    async () => {

      const latitude =
        request?.latitude;

      const longitude =
        request?.longitude;


      if (
        latitude === null ||
        latitude === undefined ||
        longitude === null ||
        longitude === undefined
      ) {

        Alert.alert(
          'Location unavailable',
          'Driver location is not available.'
        );

        return;
      }


      const url =
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;


      try {

        await Linking.openURL(
          url
        );

      } catch (err) {

        console.error(
          '[MECHANIC ACTIVE] Navigation error:',
          err
        );

      }
    };


  // =======================================================
  // NEXT ACTION
  // =======================================================

  const handleNext =
    async () => {

      const status =
        normalizeStatus(
          request?.status
        );


      // ---------------------------------------------------
      // ASSIGNED → MECHANIC_EN_ROUTE
      // ---------------------------------------------------

      if (
        status === 'ASSIGNED'
      ) {

        handleStatusUpdate(
          'MECHANIC_EN_ROUTE'
        );

        return;
      }


      // ---------------------------------------------------
      // MECHANIC_EN_ROUTE → ARRIVED
      // ---------------------------------------------------

      if (
        status ===
        'MECHANIC_EN_ROUTE'
      ) {

        handleStatusUpdate(
          'ARRIVED'
        );

        return;
      }


      // ---------------------------------------------------
      // ARRIVED → IN_PROGRESS
      // ---------------------------------------------------

      if (
        status === 'ARRIVED'
      ) {

        // IMPORTANT:
        // The service must be changed in the backend BEFORE
        // opening the mechanic service screen.
        const updated =
          await handleStatusUpdate(
            'IN_PROGRESS'
          );

        // Do not open the service screen if the backend
        // status update failed.
        if (!updated) {
          return;
        }

        router.push({
          pathname:
            '/service',

          params: {
            requestId:
              requestId || '',
          },
        });

        return;
      }


      // ---------------------------------------------------
      // ALREADY IN PROGRESS
      // ---------------------------------------------------

      if (
        status === 'IN_PROGRESS'
      ) {

        router.push({
          pathname:
            '/service',

          params: {
            requestId:
              requestId || '',
          },
        });

        return;
      }

    };


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (
      <View
        style={styles.centerContainer}
      >

        <ActivityIndicator
          size="large"
          color={colors.accent}
        />

        <Text
          style={styles.loadingText}
        >
          Loading active request...
        </Text>

      </View>
    );

  }


  // =======================================================
  // ERROR
  // =======================================================

  if (
    error ||
    !request
  ) {

    return (
      <View
        style={styles.centerContainer}
      >

        <View
          style={styles.errorIcon}
        >

          <Ionicons
            name="alert-circle-outline"
            size={34}
            color={colors.accent}
          />

        </View>


        <Text
          style={styles.errorTitle}
        >
          Request not found
        </Text>


        <Text
          style={styles.errorMessage}
        >
          {error ||
            'Unable to load this service request.'}
        </Text>


        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() =>
            router.back()
          }
        >

          <Text
            style={styles.goBackText}
          >
            GO BACK
          </Text>

        </TouchableOpacity>

      </View>
    );

  }


  // =======================================================
  // DATA
  // =======================================================

  const driver =
    request.driver ||
    null;


  const vehicle =
    request.vehicle ||
    null;


  const driverName =
    driver?.name ||
    'Driver';


  const driverPhone =
    driver?.phone ||
    '';


  const vehicleText =
    formatVehicle(
      vehicle
    );


  const serviceName =
    getServiceName(
      request.category
    );


  const distanceText =
    formatDistance(
      request.distanceKm
    );


  const eta =
    calculateEta(
      request.distanceKm
    );


  const location =
    request.address ||
    'Driver location';


  const status =
    normalizeStatus(
      request.status
    );


  // =======================================================
  // STATUS UI
  // =======================================================

  const isArrived =
    status === 'ARRIVED';


  const isEnRoute =
    status ===
    'MECHANIC_EN_ROUTE';


  const isAssigned =
    status ===
    'ASSIGNED';


  const isInProgress =
    status ===
    'IN_PROGRESS';


  let statusTitle =
    'Active Request';


  let statusSubtitle =
    'Service request is active.';


  let statusIcon =
    'ellipse-outline';


  if (isAssigned) {

    statusTitle =
      'Request accepted';

    statusSubtitle =
      'Start travelling to the driver location.';

    statusIcon =
      'checkmark-circle-outline';

  }


  if (isEnRoute) {

    statusTitle =
      'On the way';

    statusSubtitle =
      'Navigate to the driver location.';

    statusIcon =
      'navigate-outline';

  }


  if (isArrived) {

    statusTitle =
      'You have arrived';

    statusSubtitle =
      'You can now start the service.';

    statusIcon =
      'checkmark-circle-outline';

  }


  if (isInProgress) {

    statusTitle =
      'Service in progress';

    statusSubtitle =
      'Service is currently in progress.';

    statusIcon =
      'construct-outline';

  }


  // =======================================================
  // BUTTON TEXT
  // =======================================================

  let buttonText =
    'START TRAVEL';


  let buttonIcon =
    'navigate-outline';


  if (isEnRoute) {

    buttonText =
      "I'VE ARRIVED";

    buttonIcon =
      'checkmark';

  }


  if (isArrived) {

    buttonText =
      'START SERVICE';

    buttonIcon =
      'arrow-forward';

  }


  if (isInProgress) {

    buttonText =
      'CONTINUE SERVICE';

    buttonIcon =
      'arrow-forward';

  }


  // =======================================================
  // UI
  // =======================================================

  return (
    <View
      style={styles.container}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View
          style={styles.header}
        >

          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
          >

            <Ionicons
              name="arrow-back"
              size={20}
              color={colors.text}
            />

          </TouchableOpacity>


          <View
            style={styles.headerText}
          >

            <Text
              style={styles.headerTitle}
            >
              Active Request
            </Text>


            <Text
              style={styles.headerSubtitle}
            >
              Request #{request.id}
            </Text>

          </View>


          <View
            style={styles.activeBadge}
          >

            <View
              style={styles.activeDot}
            />

            <Text
              style={styles.activeBadgeText}
            >
              {status || 'ACTIVE'}
            </Text>

          </View>

        </View>


        {/* =================================================
            MAP
        ================================================= */}

        <View
          style={styles.mapCard}
        >

          <View
            style={styles.mapArea}
          >

            <View
              style={styles.mapRoad1}
            />

            <View
              style={styles.mapRoad2}
            />


            <View
              style={styles.locationPin}
            >

              <Ionicons
                name="location"
                size={26}
                color={colors.accent}
              />

            </View>


            <View
              style={styles.locationLabel}
            >

              <Text
                style={
                  styles.locationLabelText
                }
              >
                Driver location
              </Text>

            </View>

          </View>


          <View
            style={styles.locationBottom}
          >

            <View
              style={styles.locationInfo}
            >

              <View
                style={styles.locationIcon}
              >

                <Ionicons
                  name="navigate-outline"
                  size={18}
                  color={colors.accent}
                />

              </View>


              <View>

                <Text
                  style={styles.locationTitle}
                >
                  {location}
                </Text>


                <Text
                  style={
                    styles.locationSubtitle
                  }
                >

                  {distanceText}

                  {eta
                    ? ` • Approx. ${eta} min`
                    : ''}

                </Text>

              </View>

            </View>


            <TouchableOpacity
              style={
                styles.navigateButton
              }
              onPress={
                handleNavigate
              }
            >

              <Ionicons
                name="navigate"
                size={16}
                color={colors.white}
              />


              <Text
                style={
                  styles.navigateText
                }
              >
                Navigate
              </Text>

            </TouchableOpacity>

          </View>

        </View>


        {/* =================================================
            DRIVER
        ================================================= */}

        <Text
          style={styles.sectionTitle}
        >
          Driver details
        </Text>


        <View
          style={styles.card}
        >

          <View
            style={styles.avatar}
          >

            <Text
              style={styles.avatarText}
            >
              {getInitials(
                driverName
              )}
            </Text>

          </View>


          <View
            style={styles.driverInfo}
          >

            <Text
              style={styles.driverName}
            >
              {driverName}
            </Text>


            <Text
              style={styles.driverVehicle}
            >
              {vehicleText}
            </Text>


            {driverPhone ? (

              <Text
                style={
                  styles.driverPhone
                }
              >
                {driverPhone}
              </Text>

            ) : null}

          </View>


          <TouchableOpacity
            style={styles.callButton}
            onPress={
              handleCallDriver
            }
          >

            <Ionicons
              name="call-outline"
              size={19}
              color={colors.success}
            />

          </TouchableOpacity>

        </View>


        {/* =================================================
            REQUEST DETAILS
        ================================================= */}

        <Text
          style={styles.sectionTitle}
        >
          Request details
        </Text>


        <View
          style={styles.card}
        >

          <DetailRow
            icon="construct-outline"
            iconColor={colors.accent}
            title="Service"
            value={serviceName}
          />


          <View
            style={styles.divider}
          />


          <DetailRow
            icon="location-outline"
            iconColor={colors.accent}
            title="Location"
            value={location}
          />


          <View
            style={styles.divider}
          />


          <DetailRow
            icon="document-text-outline"
            iconColor={colors.accent}
            title="Description"
            value={
              request.description ||
              'No additional description'
            }
          />

        </View>


        {/* =================================================
            STATUS
        ================================================= */}

        <View
          style={styles.statusCard}
        >

          <View
            style={[
              styles.statusIcon,
              isArrived &&
                styles.statusIconSuccess,
            ]}
          >

            <Ionicons
              name={statusIcon}
              size={21}
              color={
                isArrived
                  ? colors.success
                  : colors.accent
              }
            />

          </View>


          <View
            style={styles.statusContent}
          >

            <Text
              style={styles.statusTitle}
            >
              {statusTitle}
            </Text>


            <Text
              style={
                styles.statusSubtitle
              }
            >
              {statusSubtitle}
            </Text>

          </View>

        </View>

      </ScrollView>


      {/* ===================================================
          BOTTOM ACTION
      =================================================== */}

      <View
        style={styles.bottomBar}
      >

        <TouchableOpacity
          style={[
            styles.primaryButton,
            updatingStatus &&
              styles.primaryButtonDisabled,
          ]}
          onPress={
            handleNext
          }
          disabled={
            updatingStatus
          }
          activeOpacity={0.85}
        >

          {updatingStatus ? (

            <View
              style={
                styles.loadingButtonContent
              }
            >

              <ActivityIndicator
                size="small"
                color={colors.white}
              />

              <Text
                style={
                  styles.primaryButtonText
                }
              >
                UPDATING...
              </Text>

            </View>

          ) : (

            <>

              <Text
                style={
                  styles.primaryButtonText
                }
              >
                {buttonText}
              </Text>


              <View
                style={styles.buttonIcon}
              >

                <Ionicons
                  name={buttonIcon}
                  size={19}
                  color={colors.white}
                />

              </View>

            </>

          )}

        </TouchableOpacity>

      </View>

      {/* ===================================================
          MAIN BOTTOM NAVIGATION
      =================================================== */}

      <BottomNavigation
        active="requests"
      />

    </View>
  );
}


// =========================================================
// DETAIL ROW
// =========================================================

function DetailRow({
  icon,
  iconColor,
  title,
  value,
}) {

  return (
    <View
      style={styles.detailRow}
    >

      <View
        style={styles.detailIcon}
      >

        <Ionicons
          name={icon}
          size={18}
          color={iconColor}
        />

      </View>


      <View
        style={styles.detailText}
      >

        <Text
          style={styles.detailTitle}
        >
          {title}
        </Text>


        <Text
          style={styles.detailValue}
        >
          {value}
        </Text>

      </View>

    </View>
  );
}


// =========================================================
// STYLES
// =========================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },


    centerContainer: {
      flex: 1,
      backgroundColor:
        colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
    },


    loadingText: {
      marginTop: 12,
      fontFamily: 'InterMedium',
      fontSize: 12,
      color: colors.textMuted,
    },


    errorIcon: {
      width: 65,
      height: 65,
      borderRadius: 20,
      backgroundColor:
        colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 15,
    },


    errorTitle: {
      fontFamily: 'InterBold',
      fontSize: 17,
      color: colors.text,
    },


    errorMessage: {
      fontFamily: 'InterRegular',
      fontSize: 11,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 8,
      maxWidth: 320,
    },


    goBackButton: {
      marginTop: 22,
      backgroundColor:
        colors.accent,
      paddingHorizontal: 28,
      paddingVertical: 15,
      borderRadius: 14,
    },


    goBackText: {
      fontFamily: 'InterBold',
      fontSize: 10,
      color: colors.white,
    },


    content: {
      paddingHorizontal:
        spacing.screenHorizontal,
      paddingTop: 18,
      paddingBottom: 180,
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
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
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
      backgroundColor:
        colors.accentLight,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius:
        spacing.radiusRound,
    },


    activeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor:
        colors.accent,
      marginRight: 5,
    },


    activeBadgeText: {
      fontFamily: 'InterBold',
      fontSize: 8,
      color: colors.accent,
    },


    mapCard: {
      backgroundColor:
        colors.surface,
      borderRadius:
        spacing.radiusLarge,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
      overflow: 'hidden',
    },


    mapArea: {
      height: 190,
      backgroundColor:
        colors.mapBackground,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },


    mapRoad1: {
      position: 'absolute',
      width: '120%',
      height: 24,
      backgroundColor:
        colors.mapRoad,
      transform: [
        {
          rotate: '18deg',
        },
      ],
    },


    mapRoad2: {
      position: 'absolute',
      width: '120%',
      height: 18,
      backgroundColor:
        colors.mapRoad,
      transform: [
        {
          rotate: '-32deg',
        },
      ],
    },


    locationPin: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor:
        colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
    },


    locationLabel: {
      marginTop: 7,
      backgroundColor:
        colors.white,
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
      justifyContent:
        'space-between',
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
      backgroundColor:
        colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
    },


    locationTitle: {
      fontFamily: 'InterSemiBold',
      fontSize: 11,
      color: colors.text,
      maxWidth: 210,
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
      backgroundColor:
        colors.accent,
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
      backgroundColor:
        colors.surface,
      borderRadius:
        spacing.radiusLarge,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
      padding:
        spacing.cardPadding,
    },


    avatar: {
      width: 45,
      height: 45,
      borderRadius: 14,
      backgroundColor:
        colors.accentLight,
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


    driverPhone: {
      fontFamily: 'InterMedium',
      fontSize: 9,
      color: colors.textSecondary,
      marginTop: 3,
    },


    callButton: {
      width: 39,
      height: 39,
      borderRadius: 12,
      backgroundColor:
        colors.successLight,
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
      backgroundColor:
        colors.background,
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
      backgroundColor:
        colors.borderLight,
      marginVertical: 12,
    },


    statusCard: {
      marginTop: 18,
      backgroundColor:
        colors.accentLight,
      borderRadius:
        spacing.radiusMedium,
      padding: 13,
      flexDirection: 'row',
      alignItems: 'center',
    },


    statusIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },


    statusIconSuccess: {
      backgroundColor:
        colors.successLight,
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
      bottom: 64,
      backgroundColor:
        colors.surface,
      borderTopWidth: 1,
      borderTopColor:
        colors.borderLight,
      paddingHorizontal:
        spacing.screenHorizontal,
      paddingVertical: 10,
    },


    primaryButton: {
      height:
        spacing.buttonHeight,
      borderRadius: 15,
      backgroundColor:
        colors.accent,
      paddingLeft: 18,
      paddingRight: 7,
      flexDirection: 'row',
      alignItems: 'center',
    },


    primaryButtonDisabled: {
      opacity: 0.7,
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
      backgroundColor:
        colors.accentDark,
      alignItems: 'center',
      justifyContent: 'center',
    },


    loadingButtonContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },

  });