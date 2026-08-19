import {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
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
  acceptMechanicRequest,
  getMechanicRequestById,
} from '../services/mechanicApi';


// =========================================================
// CATEGORY CONFIG
// =========================================================

const CATEGORY_CONFIG = {

  BATTERY: {
    title: 'Battery Issue',
    icon: 'battery-charging-outline',
    color: colors.serviceBattery,
    background: colors.warningLight,
  },

  TYRE: {
    title: 'Tyre Issue',
    icon: 'disc-outline',
    color: colors.serviceTyre,
    background: colors.borderLight,
  },

  FUEL: {
    title: 'Fuel Issue',
    icon: 'water-outline',
    color: colors.serviceFuel,
    background: colors.warningLight,
  },

  BREAKDOWN: {
    title: 'Breakdown',
    icon: 'construct-outline',
    color: colors.serviceEngine,
    background: colors.infoLight,
  },

  OTHER: {
    title: 'Other Assistance',
    icon: 'help-circle-outline',
    color: colors.accent,
    background: colors.accentLight,
  },

};


// =========================================================
// CATEGORY HELPER
// =========================================================

function getCategoryConfig(category) {

  return (
    CATEGORY_CONFIG[
      String(category || '').toUpperCase()
    ] ||
    CATEGORY_CONFIG.OTHER
  );

}


// =========================================================
// INITIALS
// =========================================================

function getInitials(name) {

  if (!name) {
    return 'DR';
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0)
    )
    .join('')
    .toUpperCase();

}


// =========================================================
// DATE FORMAT
// =========================================================

function formatRequestedAt(dateValue) {

  if (!dateValue) {
    return '';
  }

  try {

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '';
    }

    return date.toLocaleString(
      'en-IN'
    );

  } catch (error) {

    console.error(
      '[REQUEST DETAILS] Date formatting error:',
      error
    );

    return '';
  }

}


// =========================================================
// SCREEN
// =========================================================

export default function RequestDetailsScreen() {

  const router =
    useRouter();


  // =======================================================
  // ROUTE PARAM
  // =======================================================

  const {
    requestId,
  } =
    useLocalSearchParams();


  // =======================================================
  // STATE
  // =======================================================

  const [
    request,
    setRequest,
  ] =
    useState(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    accepting,
    setAccepting,
  ] =
    useState(false);


  // =======================================================
  // LOAD REQUEST
  // =======================================================

  useEffect(() => {

    let mounted = true;


    async function loadRequest() {

      console.log(
        '========================================'
      );

      console.log(
        '[MECHANIC REQUEST DETAILS] SCREEN OPENED'
      );

      console.log(
        '[MECHANIC REQUEST DETAILS] Raw requestId:',
        requestId
      );

      console.log(
        '[MECHANIC REQUEST DETAILS] requestId type:',
        typeof requestId
      );

      console.log(
        '[MECHANIC REQUEST DETAILS] Is array:',
        Array.isArray(requestId)
      );

      console.log(
        '========================================'
      );


      // ===================================================
      // VALIDATE REQUEST ID
      // ===================================================

      if (!requestId) {

        console.error(
          '[MECHANIC REQUEST DETAILS] ❌ requestId is missing'
        );

        if (mounted) {

          setLoading(false);

          Alert.alert(
            'Request unavailable',
            'Service request ID is missing.',
            [
              {
                text: 'OK',
                onPress: () =>
                  router.back(),
              },
            ]
          );

        }

        return;
      }


      try {

        setLoading(true);


        // =================================================
        // NORMALIZE REQUEST ID
        // =================================================

        const cleanRequestId =
          Array.isArray(requestId)
            ? requestId[0]
            : String(requestId).trim();


        console.log(
          '========================================'
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Normalized requestId:',
          cleanRequestId
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Normalized type:',
          typeof cleanRequestId
        );

        console.log(
          '========================================'
        );


        // =================================================
        // CALL API
        // =================================================

        console.log(
          '[MECHANIC REQUEST DETAILS] Calling API...'
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Function:',
          'getMechanicRequestById'
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] ID:',
          cleanRequestId
        );


        const response =
          await getMechanicRequestById(
            cleanRequestId
          );


        // =================================================
        // RAW API RESPONSE
        // =================================================

        console.log(
          '========================================'
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] API RESPONSE RECEIVED'
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Response:',
          response
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Response type:',
          typeof response
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Response JSON:',
          JSON.stringify(
            response,
            null,
            2
          )
        );

        console.log(
          '========================================'
        );


        // =================================================
        // EMPTY RESPONSE
        // =================================================

        if (!response) {

          console.error(
            '[MECHANIC REQUEST DETAILS] ❌ API returned empty response'
          );

          if (mounted) {
            setRequest(null);
          }

          return;
        }


        // =================================================
        // NORMALIZE RESPONSE
        // =================================================

        let requestData =
          response;


        // -------------------------------------------------
        // response.data
        // -------------------------------------------------

        if (
          response?.data &&
          typeof response.data === 'object' &&
          !Array.isArray(response.data)
        ) {

          console.log(
            '[MECHANIC REQUEST DETAILS] Response wrapper detected: response.data'
          );

          requestData =
            response.data;
        }


        // -------------------------------------------------
        // response.request
        // -------------------------------------------------

        if (
          response?.request &&
          typeof response.request === 'object'
        ) {

          console.log(
            '[MECHANIC REQUEST DETAILS] Response wrapper detected: response.request'
          );

          requestData =
            response.request;
        }


        // =================================================
        // FINAL REQUEST DATA
        // =================================================

        console.log(
          '========================================'
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] FINAL REQUEST DATA'
        );

        console.log(
          JSON.stringify(
            requestData,
            null,
            2
          )
        );

        console.log(
          '========================================'
        );


        // =================================================
        // CHECK REQUEST ID
        // =================================================

        if (!requestData?.id) {

          console.error(
            '[MECHANIC REQUEST DETAILS] ❌ Request data does not contain ID'
          );

          console.error(
            '[MECHANIC REQUEST DETAILS] requestData:',
            requestData
          );

          if (mounted) {
            setRequest(null);
          }

          return;
        }


        // =================================================
        // DRIVER LOG
        // =================================================

        console.log(
          '========================================'
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] DRIVER DATA'
        );

        console.log(
          JSON.stringify(
            requestData.driver,
            null,
            2
          )
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Driver ID:',
          requestData.driver?.id
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Driver Name:',
          requestData.driver?.name
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Driver Phone:',
          requestData.driver?.phone
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Driver Email:',
          requestData.driver?.email
        );

        console.log(
          '========================================'
        );


        // =================================================
        // VEHICLE LOG
        // =================================================

        console.log(
          '========================================'
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] VEHICLE DATA'
        );

        console.log(
          JSON.stringify(
            requestData.vehicle,
            null,
            2
          )
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Vehicle ID:',
          requestData.vehicle?.id
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Registration:',
          requestData.vehicle?.registrationNumber
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Manufacturer:',
          requestData.vehicle?.manufacturer
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Model:',
          requestData.vehicle?.model
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Type:',
          requestData.vehicle?.vehicleType
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Year:',
          requestData.vehicle?.manufacturingYear
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Color:',
          requestData.vehicle?.color
        );

        console.log(
          '========================================'
        );


        // =================================================
        // SUCCESS LOG
        // =================================================

        console.log(
          '========================================'
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] ✅ REQUEST LOADED'
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] ID:',
          requestData.id
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Category:',
          requestData.category
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Status:',
          requestData.status
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Latitude:',
          requestData.latitude
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Longitude:',
          requestData.longitude
        );

        console.log(
          '[MECHANIC REQUEST DETAILS] Address:',
          requestData.address
        );

        console.log(
          '========================================'
        );


        if (mounted) {

          setRequest(
            requestData
          );

        }


      } catch (error) {

        console.error(
          '========================================'
        );

        console.error(
          '[MECHANIC REQUEST DETAILS] ❌ LOAD ERROR'
        );

        console.error(
          '[MECHANIC REQUEST DETAILS] Error:',
          error
        );

        console.error(
          '[MECHANIC REQUEST DETAILS] Message:',
          error?.message
        );

        console.error(
          '[MECHANIC REQUEST DETAILS] Status:',
          error?.status
        );

        console.error(
          '[MECHANIC REQUEST DETAILS] Data:',
          error?.data
        );

        console.error(
          '[MECHANIC REQUEST DETAILS] Response:',
          error?.response
        );

        console.error(
          '========================================'
        );


        if (mounted) {

          setRequest(
            null
          );

        }

      } finally {

        if (mounted) {

          setLoading(
            false
          );

        }

      }

    }


    loadRequest();


    return () => {

      mounted = false;

    };

  }, [
    requestId,
  ]);


  // =======================================================
  // ACCEPT REQUEST
  // =======================================================

  const handleAccept =
    async () => {

      if (!request?.id) {

        console.error(
          '[MECHANIC ACCEPT] ❌ Request ID missing'
        );

        return;
      }


      if (accepting) {

        console.log(
          '[MECHANIC ACCEPT] Already accepting request'
        );

        return;
      }


      try {

        setAccepting(
          true
        );


        console.log(
          '========================================'
        );

        console.log(
          '[MECHANIC ACCEPT] START'
        );

        console.log(
          '[MECHANIC ACCEPT] Request ID:',
          request.id
        );

        console.log(
          '[MECHANIC ACCEPT] Category:',
          request.category
        );

        console.log(
          '[MECHANIC ACCEPT] Current status:',
          request.status
        );

        console.log(
          '========================================'
        );


        const response =
          await acceptMechanicRequest(
            String(request.id)
          );


        console.log(
          '========================================'
        );

        console.log(
          '[MECHANIC ACCEPT] API RESPONSE'
        );

        console.log(
          response
        );

        console.log(
          JSON.stringify(
            response,
            null,
            2
          )
        );

        console.log(
          '========================================'
        );


        console.log(
          '[MECHANIC ACCEPT] ✅ Request accepted'
        );

        console.log(
          '[MECHANIC ACCEPT] Navigating to active screen...'
        );


        router.replace({
          pathname: '/active',
          params: {
            requestId:
              String(request.id),
          },
        });


      } catch (error) {

        console.error(
          '========================================'
        );

        console.error(
          '[MECHANIC ACCEPT] ❌ ACCEPT ERROR'
        );

        console.error(
          'Error:',
          error
        );

        console.error(
          'Message:',
          error?.message
        );

        console.error(
          'Status:',
          error?.status
        );

        console.error(
          'Data:',
          error?.data
        );

        console.error(
          'Response:',
          error?.response
        );

        console.error(
          '========================================'
        );


        Alert.alert(
          'Unable to accept request',
          error?.message ||
            'This request may already have been accepted by another mechanic.'
        );


      } finally {

        setAccepting(
          false
        );

      }

    };


  // =======================================================
  // CALL DRIVER
  // =======================================================

  const callDriver =
    async () => {

      const phone =
        request?.driver?.phone ||
        request?.driverPhone ||
        '';


      console.log(
        '[CALL DRIVER] Driver:',
        request?.driver
      );

      console.log(
        '[CALL DRIVER] Phone:',
        phone
      );


      if (!phone) {

        Alert.alert(
          'Phone unavailable',
          'Driver phone number is not available.'
        );

        return;
      }


      try {

        const phoneUrl =
          `tel:${phone}`;


        console.log(
          '[CALL DRIVER] Opening:',
          phoneUrl
        );


        const supported =
          await Linking.canOpenURL(
            phoneUrl
          );


        console.log(
          '[CALL DRIVER] Can open URL:',
          supported
        );


        if (!supported) {

          Alert.alert(
            'Unable to call',
            'Phone dialer is not available on this device.'
          );

          return;
        }


        await Linking.openURL(
          phoneUrl
        );


      } catch (error) {

        console.error(
          '[CALL DRIVER] ❌ Error:',
          error
        );

        Alert.alert(
          'Unable to call',
          'Unable to open the phone dialer.'
        );

      }

    };


  // =======================================================
  // OPEN MAP
  // =======================================================

  const openMap =
    async () => {

      console.log(
        '[OPEN MAP] Request:',
        request
      );


      if (
        request?.latitude === null ||
        request?.latitude === undefined ||
        request?.longitude === null ||
        request?.longitude === undefined
      ) {

        console.error(
          '[OPEN MAP] ❌ Coordinates unavailable'
        );

        Alert.alert(
          'Location unavailable',
          'Service location coordinates are not available.'
        );

        return;
      }


      const latitude =
        request.latitude;

      const longitude =
        request.longitude;


      const url =
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;


      console.log(
        '[OPEN MAP] Latitude:',
        latitude
      );

      console.log(
        '[OPEN MAP] Longitude:',
        longitude
      );

      console.log(
        '[OPEN MAP] URL:',
        url
      );


      try {

        await Linking.openURL(
          url
        );

      } catch (error) {

        console.error(
          '[OPEN MAP] ❌ Error:',
          error
        );

        Alert.alert(
          'Unable to open maps',
          'Unable to open Google Maps.'
        );

      }

    };


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <ActivityIndicator
          size="large"
          color={
            colors.accent
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading request details...
        </Text>

        <Text
          style={
            styles.loadingSubtext
          }
        >
          Request ID: {String(requestId || '')}
        </Text>

      </View>

    );

  }


  // =======================================================
  // NO REQUEST
  // =======================================================

  if (!request) {

    return (

      <View
        style={
          styles.loadingContainer
        }
      >

        <Ionicons
          name="alert-circle-outline"
          size={42}
          color={
            colors.danger
          }
        />

        <Text
          style={
            styles.emptyTitle
          }
        >
          Request not found
        </Text>

        <Text
          style={
            styles.emptyText
          }
        >
          Unable to load the service request.
        </Text>

        <Text
          style={
            styles.requestIdText
          }
        >
          ID: {String(requestId || '')}
        </Text>

        <TouchableOpacity
          style={
            styles.backHomeButton
          }
          onPress={() =>
            router.back()
          }
        >

          <Text
            style={
              styles.backHomeText
            }
          >
            GO BACK
          </Text>

        </TouchableOpacity>

      </View>

    );

  }


  // =======================================================
  // REQUEST CONFIG
  // =======================================================

  const category =
    getCategoryConfig(
      request.category
    );


  const location =
    request.address ||
    'Location not provided';


  const requestedAt =
    formatRequestedAt(
      request.createdAt
    );


  const description =
    request.description ||
    'No additional description provided.';


  const status =
    request.status ||
    'SEARCHING';


  // =======================================================
  // DRIVER DETAILS
  // =======================================================

  const driver =
    request?.driver || {};


  const driverName =
    driver?.name ||
    request?.driverName ||
    'Driver';


  const driverPhone =
    driver?.phone ||
    request?.driverPhone ||
    '';


  const driverEmail =
    driver?.email ||
    request?.driverEmail ||
    '';


  const driverImage =
    driver?.profileImageUrl ||
    request?.driver?.profileImageUrl ||
    '';


  // =======================================================
  // VEHICLE DETAILS
  // =======================================================

  const vehicle =
    request?.vehicle || {};


  const vehicleNumber =
    vehicle?.registrationNumber ||
    request?.vehicleNumber ||
    'Vehicle number unavailable';


  const vehicleManufacturer =
    vehicle?.manufacturer ||
    '';


  const vehicleModel =
    vehicle?.model ||
    '';


  const vehicleType =
    vehicle?.vehicleType ||
    '';


  const vehicleYear =
    vehicle?.manufacturingYear ||
    '';


  const vehicleColor =
    vehicle?.color ||
    '';


  const vehicleName =
    [
      vehicleManufacturer,
      vehicleModel,
    ]
      .filter(Boolean)
      .join(' ') ||
    vehicleType ||
    'Vehicle';


  const vehicleMeta =
    [
      vehicleType,
      vehicleYear,
      vehicleColor,
    ]
      .filter(Boolean)
      .join(' • ');


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <View
      style={
        styles.container
      }
    >

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View
          style={
            styles.header
          }
        >

          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
          >

            <Ionicons
              name="arrow-back"
              size={20}
              color={
                colors.text
              }
            />

          </TouchableOpacity>


          <View
            style={
              styles.headerTextArea
            }
          >

            <Text
              style={
                styles.headerTitle
              }
            >
              Request Details
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              Service request
            </Text>

          </View>

        </View>


        {/* =================================================
            SERVICE CARD
        ================================================= */}

        <View
          style={
            styles.serviceCard
          }
        >

          <View
            style={[
              styles.serviceIcon,
              {
                backgroundColor:
                  category.background,
              },
            ]}
          >

            <Ionicons
              name={
                category.icon
              }
              size={28}
              color={
                category.color
              }
            />

          </View>


          <View
            style={
              styles.serviceContent
            }
          >

            <Text
              style={
                styles.serviceLabel
              }
            >
              SERVICE REQUEST
            </Text>

            <Text
              style={
                styles.serviceTitle
              }
            >
              {category.title}
            </Text>


            <View
              style={
                styles.statusBadge
              }
            >

              <View
                style={
                  styles.statusDot
                }
              />

              <Text
                style={
                  styles.statusText
                }
              >
                {status}
              </Text>

            </View>

          </View>

        </View>


        {/* =================================================
            DRIVER
        ================================================= */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Driver
        </Text>


        <View
          style={
            styles.card
          }
        >

          <View
            style={
              styles.driverRow
            }
          >

            {/* DRIVER IMAGE / INITIALS */}

            {driverImage ? (

              <Image
                source={{
                  uri: driverImage,
                }}
                style={
                  styles.avatarImage
                }
              />

            ) : (

              <View
                style={
                  styles.avatar
                }
              >

                <Text
                  style={
                    styles.avatarText
                  }
                >
                  {getInitials(
                    driverName
                  )}
                </Text>

              </View>

            )}


            <View
              style={
                styles.driverInfo
              }
            >

              <Text
                style={
                  styles.driverName
                }
              >
                {driverName}
              </Text>


              <Text
                style={
                  styles.driverPhone
                }
              >
                {driverPhone ||
                  'Phone unavailable'}
              </Text>


              {driverEmail ? (

                <Text
                  style={
                    styles.driverEmail
                  }
                  numberOfLines={1}
                >
                  {driverEmail}
                </Text>

              ) : null}

            </View>


            <TouchableOpacity
              style={
                styles.callButton
              }
              onPress={
                callDriver
              }
            >

              <Ionicons
                name="call-outline"
                size={19}
                color={
                  colors.success
                }
              />

            </TouchableOpacity>

          </View>


          <View
            style={
              styles.divider
            }
          />


          {/* =================================================
              VEHICLE
          ================================================= */}

          <View
            style={
              styles.vehicleDetails
            }
          >

            <View
              style={
                styles.vehicleIcon
              }
            >

              <Ionicons
                name="car-outline"
                size={20}
                color={
                  colors.accent
                }
              />

            </View>


            <View
              style={
                styles.vehicleTextArea
              }
            >

              <Text
                style={
                  styles.vehicleName
                }
              >
                {vehicleName}
              </Text>


              <Text
                style={
                  styles.vehicleNumber
                }
              >
                {vehicleNumber}
              </Text>


              {vehicleMeta ? (

                <Text
                  style={
                    styles.vehicleMeta
                  }
                >
                  {vehicleMeta}
                </Text>

              ) : null}

            </View>

          </View>

        </View>


        {/* =================================================
            LOCATION
        ================================================= */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Service Location
        </Text>


        <TouchableOpacity
          style={
            styles.locationCard
          }
          onPress={
            openMap
          }
          activeOpacity={0.8}
        >

          <View
            style={
              styles.locationIcon
            }
          >

            <Ionicons
              name="location-outline"
              size={22}
              color={
                colors.accent
              }
            />

          </View>


          <View
            style={
              styles.locationContent
            }
          >

            <Text
              style={
                styles.locationLabel
              }
            >
              DRIVER LOCATION
            </Text>


            <Text
              style={
                styles.locationText
              }
            >
              {location}
            </Text>


            <Text
              style={
                styles.mapText
              }
            >
              Open in Maps
            </Text>

          </View>


          <Ionicons
            name="chevron-forward"
            size={18}
            color={
              colors.textMuted
            }
          />

        </TouchableOpacity>


        {/* =================================================
            REQUEST DETAILS
        ================================================= */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Request Details
        </Text>


        <View
          style={
            styles.descriptionCard
          }
        >

          <View
            style={
              styles.descriptionIcon
            }
          >

            <Ionicons
              name="document-text-outline"
              size={19}
              color={
                colors.accent
              }
            />

          </View>


          <View
            style={
              styles.descriptionContent
            }
          >

            <Text
              style={
                styles.descriptionLabel
              }
            >
              DRIVER DESCRIPTION
            </Text>


            <Text
              style={
                styles.descriptionText
              }
            >
              {description}
            </Text>

          </View>

        </View>


        {/* =================================================
            INFO
        ================================================= */}

        <View
          style={
            styles.infoCard
          }
        >

          {/* REQUESTED */}

          <View
            style={
              styles.infoItem
            }
          >

            <View
              style={
                styles.infoIcon
              }
            >

              <Ionicons
                name="time-outline"
                size={17}
                color={
                  colors.accent
                }
              />

            </View>


            <View
              style={
                styles.infoTextArea
              }
            >

              <Text
                style={
                  styles.infoLabel
                }
              >
                REQUESTED
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {requestedAt || '-'}
              </Text>

            </View>

          </View>


          {/* DISTANCE */}

          <View
            style={
              styles.infoItem
            }
          >

            <View
              style={
                styles.infoIcon
              }
            >

              <Ionicons
                name="navigate-outline"
                size={17}
                color={
                  colors.accent
                }
              />

            </View>


            <View
              style={
                styles.infoTextArea
              }
            >

              <Text
                style={
                  styles.infoLabel
                }
              >
                DISTANCE
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {
                  request.distanceKm !== null &&
                  request.distanceKm !== undefined
                    ? `${Number(
                        request.distanceKm
                      ).toFixed(2)} km`
                    : '-'
                }
              </Text>

            </View>

          </View>

        </View>


        {/* =================================================
            REQUEST ID
        ================================================= */}

        <View
          style={
            styles.debugCard
          }
        >

          <Text
            style={
              styles.debugLabel
            }
          >
            REQUEST ID
          </Text>

          <Text
            style={
              styles.debugValue
            }
          >
            {request.id}
          </Text>

        </View>

      </ScrollView>


      {/* =================================================
          BOTTOM ACTION
      ================================================= */}

      <View
        style={
          styles.bottomBar
        }
      >

        <TouchableOpacity
          style={[
            styles.acceptButton,
            accepting &&
              styles.acceptButtonDisabled,
          ]}
          onPress={
            handleAccept
          }
          disabled={
            accepting
          }
          activeOpacity={
            0.85
          }
        >

          {accepting ? (

            <ActivityIndicator
              size="small"
              color={
                colors.white
              }
            />

          ) : (

            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={
                colors.white
              }
            />

          )}


          <Text
            style={
              styles.acceptButtonText
            }
          >
            {accepting
              ? 'ACCEPTING...'
              : 'ACCEPT REQUEST'}
          </Text>

        </TouchableOpacity>

      </View>

    </View>

  );

}


// =========================================================
// STYLES
// =========================================================

const styles =
  StyleSheet.create({

    // =====================================================
    // CONTAINER
    // =====================================================

    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },


    content: {
      paddingHorizontal:
        spacing.screenHorizontal,
      paddingTop: 18,
      paddingBottom: 120,
    },


    // =====================================================
    // HEADER
    // =====================================================

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
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
    },


    headerTextArea: {
      flex: 1,
    },


    headerTitle: {
      fontFamily:
        'InterExtraBold',
      fontSize: 18,
      color:
        colors.text,
    },


    headerSubtitle: {
      fontFamily:
        'InterRegular',
      fontSize: 10,
      color:
        colors.textMuted,
      marginTop: 3,
    },


    // =====================================================
    // SERVICE
    // =====================================================

    serviceCard: {
      backgroundColor:
        colors.white,
      borderRadius:
        spacing.radiusMedium,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },


    serviceIcon: {
      width: 58,
      height: 58,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 13,
    },


    serviceContent: {
      flex: 1,
    },


    serviceLabel: {
      fontFamily:
        'InterRegular',
      fontSize: 8,
      color:
        colors.textMuted,
      letterSpacing: 0.6,
    },


    serviceTitle: {
      fontFamily:
        'InterExtraBold',
      fontSize: 18,
      color:
        colors.text,
      marginTop: 3,
    },


    statusBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        colors.successLight,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginTop: 7,
    },


    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor:
        colors.success,
      marginRight: 5,
    },


    statusText: {
      fontFamily:
        'InterBold',
      fontSize: 8,
      color:
        colors.success,
    },


    // =====================================================
    // SECTION
    // =====================================================

    sectionTitle: {
      fontFamily:
        'InterExtraBold',
      fontSize: 13,
      color:
        colors.text,
      marginTop: 20,
      marginBottom: 9,
    },


    // =====================================================
    // CARD
    // =====================================================

    card: {
      backgroundColor:
        colors.white,
      borderRadius:
        spacing.radiusMedium,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
      padding: 14,
    },


    // =====================================================
    // DRIVER
    // =====================================================

    driverRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },


    avatar: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor:
        colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },


    avatarImage: {
      width: 48,
      height: 48,
      borderRadius: 15,
      marginRight: 10,
    },


    avatarText: {
      fontFamily:
        'InterBold',
      fontSize: 12,
      color:
        colors.white,
    },


    driverInfo: {
      flex: 1,
      minWidth: 0,
    },


    driverName: {
      fontFamily:
        'InterSemiBold',
      fontSize: 12,
      color:
        colors.text,
    },


    driverPhone: {
      fontFamily:
        'InterRegular',
      fontSize: 9,
      color:
        colors.textMuted,
      marginTop: 2,
    },


    driverEmail: {
      fontFamily:
        'InterRegular',
      fontSize: 8,
      color:
        colors.textMuted,
      marginTop: 2,
    },


    callButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        colors.successLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },


    divider: {
      height: 1,
      backgroundColor:
        colors.borderLight,
      marginVertical: 13,
    },


    // =====================================================
    // VEHICLE
    // =====================================================

    vehicleDetails: {
      flexDirection: 'row',
      alignItems: 'center',
    },


    vehicleIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },


    vehicleTextArea: {
      flex: 1,
    },


    vehicleName: {
      fontFamily:
        'InterSemiBold',
      fontSize: 11,
      color:
        colors.text,
    },


    vehicleNumber: {
      fontFamily:
        'InterRegular',
      fontSize: 10,
      color:
        colors.textMuted,
      marginTop: 2,
    },


    vehicleMeta: {
      fontFamily:
        'InterRegular',
      fontSize: 8,
      color:
        colors.textSecondary,
      marginTop: 4,
    },


    // =====================================================
    // LOCATION
    // =====================================================

    locationCard: {
      backgroundColor:
        colors.white,
      borderRadius:
        spacing.radiusMedium,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
    },


    locationIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },


    locationContent: {
      flex: 1,
    },


    locationLabel: {
      fontFamily:
        'InterSemiBold',
      fontSize: 8,
      letterSpacing: 0.8,
      color:
        colors.textMuted,
      marginBottom: 3,
    },


    locationText: {
      fontFamily:
        'InterMedium',
      fontSize: 11,
      lineHeight: 17,
      color:
        colors.text,
    },


    mapText: {
      fontFamily:
        'InterSemiBold',
      fontSize: 9,
      color:
        colors.accent,
      marginTop: 4,
    },


    // =====================================================
    // DESCRIPTION
    // =====================================================

    descriptionCard: {
      backgroundColor:
        colors.white,
      borderRadius:
        spacing.radiusMedium,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
      padding: 14,
      flexDirection: 'row',
    },


    descriptionIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },


    descriptionContent: {
      flex: 1,
    },


    descriptionLabel: {
      fontFamily:
        'InterSemiBold',
      fontSize: 8,
      letterSpacing: 0.7,
      color:
        colors.textMuted,
      marginBottom: 4,
    },


    descriptionText: {
      fontFamily:
        'InterRegular',
      fontSize: 11,
      lineHeight: 17,
      color:
        colors.text,
    },


    // =====================================================
    // INFO
    // =====================================================

    infoCard: {
      backgroundColor:
        colors.white,
      borderRadius:
        spacing.radiusMedium,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
      padding: 14,
      marginTop: 14,
      flexDirection: 'row',
    },


    infoItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
    },


    infoIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor:
        colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },


    infoTextArea: {
      flex: 1,
      minWidth: 0,
    },


    infoLabel: {
      fontFamily:
        'InterSemiBold',
      fontSize: 8,
      letterSpacing: 0.7,
      color:
        colors.textMuted,
      marginBottom: 3,
    },


    infoValue: {
      fontFamily:
        'InterMedium',
      fontSize: 9,
      color:
        colors.text,
    },


    // =====================================================
    // DEBUG
    // =====================================================

    debugCard: {
      marginTop: 15,
      padding: 12,
      borderRadius: 12,
      backgroundColor:
        colors.background,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
    },


    debugLabel: {
      fontFamily:
        'InterSemiBold',
      fontSize: 8,
      color:
        colors.textMuted,
      letterSpacing: 0.7,
    },


    debugValue: {
      fontFamily:
        'InterRegular',
      fontSize: 8,
      color:
        colors.textSecondary,
      marginTop: 4,
    },


    // =====================================================
    // BOTTOM BAR
    // =====================================================

    bottomBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 16,
      backgroundColor:
        colors.white,
      borderTopWidth: 1,
      borderTopColor:
        colors.borderLight,
    },


    acceptButton: {
      height: 52,
      borderRadius: 15,
      backgroundColor:
        colors.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },


    acceptButtonDisabled: {
      opacity: 0.65,
    },


    acceptButtonText: {
      fontFamily:
        'InterBold',
      fontSize: 11,
      color:
        colors.white,
      letterSpacing: 0.4,
    },


    // =====================================================
    // LOADING
    // =====================================================

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 35,
      backgroundColor:
        colors.background,
    },


    loadingText: {
      fontFamily:
        'InterSemiBold',
      fontSize: 13,
      color:
        colors.text,
      marginTop: 15,
    },


    loadingSubtext: {
      fontFamily:
        'InterRegular',
      fontSize: 10,
      color:
        colors.textMuted,
      marginTop: 5,
      textAlign: 'center',
    },


    // =====================================================
    // EMPTY
    // =====================================================

    emptyTitle: {
      fontFamily:
        'InterExtraBold',
      fontSize: 18,
      color:
        colors.text,
      textAlign: 'center',
      marginTop: 15,
    },


    emptyText: {
      fontFamily:
        'InterRegular',
      fontSize: 11,
      lineHeight: 17,
      color:
        colors.textSecondary,
      textAlign: 'center',
      maxWidth: 290,
      marginTop: 7,
    },


    requestIdText: {
      fontFamily:
        'InterRegular',
      fontSize: 8,
      color:
        colors.textMuted,
      textAlign: 'center',
      marginTop: 10,
    },


    backHomeButton: {
      height: 42,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor:
        colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 18,
    },


    backHomeText: {
      fontFamily:
        'InterBold',
      fontSize: 10,
      color:
        colors.white,
      letterSpacing: 0.4,
    },

  });