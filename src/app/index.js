import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
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

import {
  getMechanicRequests,
  getMyMechanicProfile,
  updateMechanicAvailability,
  updateMechanicLocation,
} from '../services/mechanicApi';

import {
  getCurrentMechanicLocation,
  requestMechanicLocationPermission,
} from '../utils/mechanicLocation';

import * as Location from 'expo-location';

export default function MechanicHome() {
  const router = useRouter();

  // =======================================================
  // STATE
  // =======================================================

  const [
    isOnline,
    setIsOnline,
  ] = useState(false);

  const [
    mechanic,
    setMechanic,
  ] = useState(null);

  const [
    requests,
    setRequests,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    availabilityLoading,
    setAvailabilityLoading,
  ] = useState(false);

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  const locationWatcher =
    useRef(null);

  const mountedRef =
    useRef(true);

  // =======================================================
  // CLEANUP
  // =======================================================

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      stopLocationTracking();
    };
  }, []);

  // =======================================================
  // LOAD PROFILE
  // =======================================================

  const loadProfile =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          console.log(
            '[Mechanic Home] Loading profile...'
          );

          const response =
            await getMyMechanicProfile();

          console.log(
            '[Mechanic Home] Profile:',
            response
          );

          if (!mountedRef.current) {
            return;
          }

          setMechanic(
            response
          );

          setIsOnline(
            Boolean(
              response?.available
            )
          );
        } catch (err) {
          console.error(
            '[Mechanic Home] Profile error:',
            err
          );

          if (
            mountedRef.current
          ) {
            setError(
              err?.message ||
                'Unable to load mechanic profile.'
            );
          }
        } finally {
          if (
            mountedRef.current
          ) {
            setLoading(false);
          }
        }
      },
      []
    );

  // =======================================================
  // LOAD REQUESTS
  // =======================================================

  const loadRequests =
    useCallback(
      async () => {
        try {
          const response =
            await getMechanicRequests();

          console.log(
            '[Mechanic Home] Requests:',
            response
          );

          if (!mountedRef.current) {
            return;
          }

          const list =
            Array.isArray(response)
              ? response
              : Array.isArray(
                  response?.data
                )
                ? response.data
                : Array.isArray(
                    response?.content
                  )
                  ? response.content
                  : [];

          setRequests(
            list
          );
        } catch (err) {
          console.error(
            '[Mechanic Home] Request loading error:',
            err
          );

          if (
            mountedRef.current
          ) {
            setRequests([]);
          }
        }
      },
      []
    );

  // =======================================================
  // START LOCATION TRACKING
  // =======================================================

  const startLocationTracking =
    useCallback(
      async () => {
        try {
          console.log(
            '[Mechanic Location] Starting location tracking...'
          );

          // -------------------------------------------------
          // Permission
          // -------------------------------------------------

          await requestMechanicLocationPermission();

          // -------------------------------------------------
          // Current location
          // -------------------------------------------------

          const current =
            await getCurrentMechanicLocation();

          console.log(
            '[Mechanic Location] Initial location:',
            current
          );

          // -------------------------------------------------
          // Send initial location
          // -------------------------------------------------

          await updateMechanicLocation(
            current.latitude,
            current.longitude
          );

          // -------------------------------------------------
          // Stop existing watcher
          // -------------------------------------------------

          if (
            locationWatcher.current
          ) {
            locationWatcher.current.remove();

            locationWatcher.current =
              null;
          }

          // -------------------------------------------------
          // Start GPS watcher
          // -------------------------------------------------

          locationWatcher.current =
            await Location.watchPositionAsync(
              {
                accuracy:
                  Location.Accuracy.High,

                timeInterval:
                  30000,

                distanceInterval:
                  100,
              },

              async (
                location
              ) => {
                try {
                  const latitude =
                    location?.coords?.latitude;

                  const longitude =
                    location?.coords?.longitude;

                  if (
                    latitude === undefined ||
                    latitude === null ||
                    longitude === undefined ||
                    longitude === null
                  ) {
                    return;
                  }

                  console.log(
                    '[Mechanic Location] GPS update:',
                    {
                      latitude,
                      longitude,
                    }
                  );

                  await updateMechanicLocation(
                    latitude,
                    longitude
                  );

                  if (
                    mountedRef.current
                  ) {
                    setMechanic(
                      previous => ({
                        ...previous,
                        latitude,
                        longitude,
                        lastLocationAt:
                          new Date().toISOString(),
                      })
                    );
                  }
                } catch (err) {
                  console.error(
                    '[Mechanic Location] Update failed:',
                    err
                  );
                }
              }
            );

          console.log(
            '[Mechanic Location] Location tracking started.'
          );

        } catch (err) {
          console.error(
            '[Mechanic Location] Unable to start:',
            err
          );

          throw err;
        }
      },
      []
    );

  // =======================================================
  // STOP LOCATION TRACKING
  // =======================================================

  const stopLocationTracking =
    useCallback(
      () => {
        if (
          locationWatcher.current
        ) {
          console.log(
            '[Mechanic Location] Stopping location tracking...'
          );

          locationWatcher.current.remove();

          locationWatcher.current =
            null;
        }
      },
      []
    );

  // =======================================================
  // GO ONLINE
  // =======================================================

  const goOnline =
    useCallback(
      async () => {
        if (
          availabilityLoading
        ) {
          return;
        }

        try {
          setAvailabilityLoading(
            true
          );

          setError(null);

          console.log(
            '[Mechanic Availability] Going online...'
          );

          // -------------------------------------------------
          // 1. Get GPS permission
          // -------------------------------------------------

          await requestMechanicLocationPermission();

          // -------------------------------------------------
          // 2. Get current location
          // -------------------------------------------------

          const location =
            await getCurrentMechanicLocation();

          // -------------------------------------------------
          // 3. Save location FIRST
          //
          // Backend requires location before availability=true
          // -------------------------------------------------

          const locationResponse =
            await updateMechanicLocation(
              location.latitude,
              location.longitude
            );

          console.log(
            '[Mechanic Availability] Location saved:',
            locationResponse
          );

          // -------------------------------------------------
          // 4. Mark mechanic available
          // -------------------------------------------------

          const availabilityResponse =
            await updateMechanicAvailability(
              true
            );

          console.log(
            '[Mechanic Availability] Online:',
            availabilityResponse
          );

          if (
            !mountedRef.current
          ) {
            return;
          }

          setMechanic(
            availabilityResponse
          );

          setIsOnline(true);

          // -------------------------------------------------
          // 5. Start continuous tracking
          // -------------------------------------------------

          await startLocationTracking();

          // -------------------------------------------------
          // 6. Load available requests
          // -------------------------------------------------

          await loadRequests();

        } catch (err) {
          console.error(
            '[Mechanic Availability] Go online failed:',
            err
          );

          stopLocationTracking();

          if (
            mountedRef.current
          ) {
            setIsOnline(false);

            setError(
              err?.message ||
                'Unable to go online. Please enable location permission and try again.'
            );

            Alert.alert(
              'Unable to Go Online',
              err?.message ||
                'Please enable location permission and try again.'
            );
          }
        } finally {
          if (
            mountedRef.current
          ) {
            setAvailabilityLoading(
              false
            );
          }
        }
      },
      [
        availabilityLoading,
        loadRequests,
        startLocationTracking,
        stopLocationTracking,
      ]
    );

  // =======================================================
  // GO OFFLINE
  // =======================================================

  const goOffline =
    useCallback(
      async () => {
        if (
          availabilityLoading
        ) {
          return;
        }

        try {
          setAvailabilityLoading(
            true
          );

          console.log(
            '[Mechanic Availability] Going offline...'
          );

          // -------------------------------------------------
          // Stop GPS first
          // -------------------------------------------------

          stopLocationTracking();

          // -------------------------------------------------
          // Update backend
          // -------------------------------------------------

          const response =
            await updateMechanicAvailability(
              false
            );

          console.log(
            '[Mechanic Availability] Offline:',
            response
          );

          if (
            !mountedRef.current
          ) {
            return;
          }

          setMechanic(
            response
          );

          setIsOnline(false);

          setRequests([]);

        } catch (err) {
          console.error(
            '[Mechanic Availability] Go offline failed:',
            err
          );

          if (
            mountedRef.current
          ) {
            Alert.alert(
              'Unable to Go Offline',
              err?.message ||
                'Unable to update your availability.'
            );
          }
        } finally {
          if (
            mountedRef.current
          ) {
            setAvailabilityLoading(
              false
            );
          }
        }
      },
      [
        availabilityLoading,
        stopLocationTracking,
      ]
    );

  // =======================================================
  // TOGGLE ONLINE / OFFLINE
  // =======================================================

  const handleAvailability =
    useCallback(
      async () => {
        if (isOnline) {
          await goOffline();
        } else {
          await goOnline();
        }
      },
      [
        isOnline,
        goOffline,
        goOnline,
      ]
    );

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadProfile();
  }, [
    loadProfile,
  ]);

  // =======================================================
  // START TRACKING IF PROFILE IS ALREADY ONLINE
  // =======================================================

  useEffect(() => {
    if (
      loading ||
      !mechanic
    ) {
      return;
    }

    if (
      mechanic.available
    ) {
      startLocationTracking()
        .then(() => {
          loadRequests();
        })
        .catch(
          error => {
            console.error(
              '[Mechanic Location] Existing online session failed:',
              error
            );
          }
        );
    } else {
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [
    loading,
    mechanic?.id,
  ]);

  // =======================================================
  // REQUEST POLLING
  // =======================================================

  useEffect(() => {
    if (
      !isOnline
    ) {
      return;
    }

    loadRequests();

    const timer =
      setInterval(
        () => {
          loadRequests();
        },
        15000
      );

    return () => {
      clearInterval(
        timer
      );
    };
  }, [
    isOnline,
    loadRequests,
  ]);

  // =======================================================
  // OPEN REQUEST
  // =======================================================

  const openRequest =
    request => {
      router.push({
        pathname:
          '/request-details',

        params: {
          requestId:
            request.id,
        },
      });
    };

  // =======================================================
  // PERFORMANCE VALUES
  // =======================================================

  const totalJobs =
    mechanic?.totalJobs ??
    0;

  const rating =
    mechanic?.rating !== null &&
    mechanic?.rating !== undefined
      ? Number(mechanic.rating).toFixed(1)
      : '0.0';

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
          Loading your profile...
        </Text>
      </View>
    );
  }

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
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.brandRow
            }
          >
            <View
              style={
                styles.logoBox
              }
            >
              <Ionicons
                name="construct-outline"
                size={23}
                color={
                  colors.white
                }
              />
            </View>

            <View>
              <Text
                style={
                  styles.brandName
                }
              >
                Truck Assist
              </Text>

              <Text
                style={
                  styles.brandSubtitle
                }
              >
                Mechanic Partner
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={
              styles.notificationButton
            }
            activeOpacity={
              0.8
            }
          >
            <Ionicons
              name="notifications-outline"
              size={21}
              color={
                colors.text
              }
            />

            <View
              style={
                styles.notificationDot
              }
            />
          </TouchableOpacity>
        </View>

        {/* ================================================= */}
        {/* WELCOME */}
        {/* ================================================= */}

        <View
          style={
            styles.welcomeSection
          }
        >
          <Text
            style={
              styles.welcomeSmall
            }
          >
            Good morning
          </Text>

          <Text
            style={
              styles.welcomeTitle
            }
          >
            Ready to help drivers?
          </Text>

          <Text
            style={
              styles.welcomeDescription
            }
          >
            Accept nearby service requests and help
            drivers get back on the road.
          </Text>
        </View>

        {/* ================================================= */}
        {/* AVAILABILITY */}
        {/* ================================================= */}

        <View
          style={
            styles.availabilityCard
          }
        >
          <View
            style={[
              styles.availabilityIcon,
              !isOnline &&
                styles.offlineIcon,
            ]}
          >
            <Ionicons
              name={
                isOnline
                  ? 'radio-outline'
                  : 'pause-outline'
              }
              size={22}
              color={
                isOnline
                  ? colors.success
                  : colors.textMuted
              }
            />
          </View>

          <View
            style={
              styles.availabilityContent
            }
          >
            <Text
              style={
                styles.availabilityTitle
              }
            >
              {isOnline
                ? 'You are online'
                : 'You are offline'}
            </Text>

            <Text
              style={
                styles.availabilitySubtitle
              }
            >
              {isOnline
                ? 'Your live location is being shared for service matching'
                : 'Go online to share your location and receive requests'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.toggle,
              isOnline &&
                styles.toggleActive,
            ]}
            onPress={
              handleAvailability
            }
            disabled={
              availabilityLoading
            }
            activeOpacity={
              0.8
            }
          >
            {availabilityLoading ? (
              <ActivityIndicator
                size="small"
                color={
                  colors.white
                }
              />
            ) : (
              <View
                style={[
                  styles.toggleCircle,
                  isOnline &&
                    styles.toggleCircleActive,
                ]}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* ================================================= */}
        {/* LOCATION STATUS */}
        {/* ================================================= */}

        {isOnline && (
          <View
            style={
              styles.locationStatus
            }
          >
            <Ionicons
              name="location"
              size={15}
              color={
                colors.success
              }
            />

            <Text
              style={
                styles.locationStatusText
              }
            >
              Live location active
            </Text>

            <View
              style={
                styles.locationDot
              }
            />
          </View>
        )}

        {/* ================================================= */}
        {/* REQUEST HEADER */}
        {/* ================================================= */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              New requests
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Nearby drivers need your help
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push(
                '/requests'
              )
            }
            activeOpacity={
              0.7
            }
          >
            <Text
              style={
                styles.viewAll
              }
            >
              View all
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================================================= */}
        {/* REQUESTS */}
        {/* ================================================= */}

        {!isOnline ? (
          <View
            style={
              styles.offlineCard
            }
          >
            <View
              style={
                styles.offlineCardIcon
              }
            >
              <Ionicons
                name="moon-outline"
                size={24}
                color={
                  colors.textMuted
                }
              />
            </View>

            <Text
              style={
                styles.offlineTitle
              }
            >
              You're currently offline
            </Text>

            <Text
              style={
                styles.offlineText
              }
            >
              Go online to share your live location
              and receive nearby service requests.
            </Text>

            <TouchableOpacity
              style={
                styles.goOnlineButton
              }
              onPress={
                goOnline
              }
              activeOpacity={
                0.85
            }
            >
              <Text
                style={
                  styles.goOnlineText
                }
              >
                GO ONLINE
              </Text>
            </TouchableOpacity>
          </View>
        ) : requests.length === 0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="search-outline"
                size={25}
                color={
                  colors.accent
                }
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Looking for requests
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              We'll show nearby driver requests here
              when they become available.
            </Text>
          </View>
        ) : (
          requests.map(
            request => (
              <RequestCard
                key={
                  request.id
                }
                request={
                  request
                }
                onPress={() =>
                  openRequest(
                    request
                  )
                }
              />
            )
          )
        )}

        {/* ================================================= */}
        {/* QUICK ACTIONS */}
        {/* ================================================= */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Quick actions
        </Text>

        <View
          style={
            styles.quickRow
          }
        >
          <QuickAction
            icon="time-outline"
            title="Job history"
            subtitle="View past jobs"
            onPress={() =>
              router.push(
                '/history'
              )
            }
          />

          <QuickAction
            icon="wallet-outline"
            title="My earnings"
            subtitle="Track your income"
            onPress={() =>
              router.push(
                '/earnings'
              )
            }
          />

          <QuickAction
            icon="person-outline"
            title="Profile"
            subtitle="Manage your profile"
            onPress={() =>
              router.push(
                '/profile'
              )
            }
          />
        </View>

        {/* ================================================= */}
        {/* PERFORMANCE */}
        {/* ================================================= */}

        <View
          style={
            styles.performanceCard
          }
        >

          <View
            style={
              styles.performanceHeader
            }
          >

            <View>
              <Text
                style={
                  styles.performanceTitle
                }
              >
                Your Performance
              </Text>

              <Text
                style={
                  styles.performanceSubtitle
                }
              >
                Your service activity at a glance
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.statsButton
              }
              activeOpacity={0.8}
              onPress={() =>
                router.push('/earnings')
              }
            >
              <Ionicons
                name="bar-chart-outline"
                size={16}
                color={colors.white}
              />

              <Text
                style={
                  styles.statsButtonText
                }
              >
                Stats
              </Text>
            </TouchableOpacity>

          </View>

          <View
            style={
              styles.performanceDivider
            }
          />

          <View
            style={
              styles.performanceMetrics
            }
          >

            {/* RATING */}

            <View
              style={
                styles.performanceMetric
              }
            >

              <View
                style={[
                  styles.performanceMetricIcon,
                  styles.ratingIcon,
                ]}
              >
                <Ionicons
                  name="star"
                  size={18}
                  color={colors.accent}
                />
              </View>

              <View>
                <Text
                  style={
                    styles.performanceMetricValue
                  }
                >
                  {rating}
                </Text>

                <Text
                  style={
                    styles.performanceMetricLabel
                  }
                >
                  Rating
                </Text>
              </View>

            </View>

            {/* JOBS */}

            <View
              style={
                styles.performanceMetric
              }
            >

              <View
                style={[
                  styles.performanceMetricIcon,
                  styles.jobsIcon,
                ]}
              >
                <Ionicons
                  name="construct-outline"
                  size={18}
                  color={colors.success}
                />
              </View>

              <View>
                <Text
                  style={
                    styles.performanceMetricValue
                  }
                >
                  {totalJobs}
                </Text>

                <Text
                  style={
                    styles.performanceMetricLabel
                  }
                >
                  Jobs Completed
                </Text>
              </View>

            </View>

          </View>

        </View>

        {error && (
          <Text
            style={
              styles.errorText
            }
          >
            {error}
          </Text>
        )}
      </ScrollView>

      {/* ================================================= */}
      {/* BOTTOM NAVIGATION */}
      {/* ================================================= */}

      <BottomNavigation />
    </View>
  );
}

// =========================================================
// REQUEST CARD
// =========================================================

function RequestCard({
  request,
  onPress,
}) {
  const category =
    String(
      request?.category ||
        'OTHER'
    ).toUpperCase();

  const categoryTitle =
    category === 'TYRE'
      ? 'Tyre'
      : category ===
          'BATTERY'
        ? 'Battery'
        : category ===
            'FUEL'
          ? 'Fuel'
          : category ===
              'ELECTRICAL'
            ? 'Electrical'
            : category ===
                'BREAKDOWN'
              ? 'Engine'
              : 'Other';

  const icon =
    category === 'BATTERY'
      ? 'battery-half-outline'
      : category === 'TYRE'
        ? 'ellipse-outline'
        : category === 'FUEL'
          ? 'flame-outline'
          : category ===
              'ELECTRICAL'
            ? 'flash-outline'
            : 'construct-outline';

  return (
    <TouchableOpacity
      style={
        styles.requestCard
      }
      onPress={
        onPress
      }
      activeOpacity={
        0.9
      }
    >
      <View
        style={
          styles.requestTop
        }
      >
        <View
          style={
            styles.requestIcon
          }
        >
          <Ionicons
            name={
              icon
            }
            size={22}
            color={
              colors.accent
            }
          />
        </View>

        <View
          style={
            styles.requestInfo
          }
        >
          <Text
            style={
              styles.requestTitle
            }
          >
            {categoryTitle} Issue
          </Text>

          <Text
            style={
              styles.requestDescription
            }
          >
            {request?.description ||
              'Driver requires roadside assistance'}
          </Text>
        </View>

        <View
          style={
            styles.newBadge
          }
        >
          <Text
            style={
              styles.newBadgeText
            }
          >
            NEW
          </Text>
        </View>
      </View>

      <View
        style={
          styles.requestDivider
        }
      />

      <View
        style={
          styles.requestDetail
        }
      >
        <Ionicons
          name="location-outline"
          size={15}
          color={
            colors.textMuted
          }
        />

        <Text
          style={
            styles.requestDetailText
          }
        >
          {request?.address ||
            'Driver location'}
        </Text>

        {request?.distanceKm !==
          undefined && (
          <Text
            style={
              styles.distance
            }
          >
            {Number(
              request.distanceKm
            ).toFixed(1)}{' '}
            km
          </Text>
        )}
      </View>

      <View
        style={
          styles.requestBottom
        }
      >
        <View>
          <Text
            style={
              styles.earningLabel
            }
          >
            Service request
          </Text>

          <Text
            style={
              styles.earningValue
            }
          >
            {categoryTitle}
          </Text>
        </View>

        <TouchableOpacity
          style={
            styles.acceptButton
          }
          onPress={
            onPress
          }
          activeOpacity={
            0.85
          }
        >
          <Text
            style={
              styles.acceptText
            }
          >
            VIEW REQUEST
          </Text>

          <Ionicons
            name="arrow-forward"
            size={15}
            color={
              colors.white
            }
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// =========================================================
// QUICK ACTION
// =========================================================

function QuickAction({
  icon,
  title,
  subtitle,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={
        styles.quickAction
      }
      onPress={
        onPress
      }
      activeOpacity={
        0.8
      }
    >
      <View
        style={
          styles.quickIcon
        }
      >
        <Ionicons
          name={
            icon
          }
          size={19}
          color={
            colors.accent
          }
        />
      </View>

      <Text
        style={
          styles.quickTitle
        }
      >
        {title}
      </Text>

      <Text
        style={
          styles.quickSubtitle
        }
      >
        {subtitle}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={15}
        color={colors.textMuted}
        style={styles.quickArrow}
      />
    </TouchableOpacity>
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

    loadingContainer: {
      flex: 1,
      backgroundColor:
        colors.background,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    loadingText: {
      fontFamily:
        'InterRegular',
      fontSize: 11,
      color:
        colors.textMuted,
      marginTop: 12,
    },

    content: {
      paddingHorizontal:
        spacing.screenHorizontal,
      paddingTop: 0,
      paddingBottom: 105,
    },

    header: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      backgroundColor:
        colors.accent,
      marginHorizontal:
        -spacing.screenHorizontal,
      paddingHorizontal:
        spacing.screenHorizontal,
      paddingTop: 20,
      paddingBottom: 12,
    },

    brandRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    logoBox: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor:
        colors.primary,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 10,
    },

    brandName: {
      fontFamily:
        'InterBold',
      fontSize: 20,
      color:
        colors.white,
    },

    brandSubtitle: {
      fontFamily:
        'InterRegular',
      fontSize: 9,
      color:
        'rgba(255,255,255,0.78)',
      marginTop: 2,
    },

    notificationButton: {
      width: 43,
      height: 43,
      borderRadius: 14,
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems:
        'center',
      justifyContent:
        'center',
      position:
        'relative',
    },

    notificationDot: {
      position:
        'absolute',
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        colors.danger,
      top: 9,
      right: 10,
      borderWidth: 1.5,
      borderColor:
        colors.white,
    },

    welcomeSection: {
      marginHorizontal:
        -spacing.screenHorizontal,
      marginTop: 0,
      paddingHorizontal:
        spacing.screenHorizontal,
      paddingTop: 16,
      paddingBottom: 25,
      backgroundColor:
        colors.accent,
      borderBottomLeftRadius:
        28,
      borderBottomRightRadius:
        28,
    },

    welcomeSmall: {
      fontFamily:
        'InterMedium',
      fontSize: 11,
      color:
        'rgba(255,255,255,0.78)',
    },

    welcomeTitle: {
      fontFamily:
        'InterBold',
      fontSize: 26,
      color:
        colors.white,
      marginTop: 5,
    },

    welcomeDescription: {
      fontFamily:
        'InterRegular',
      fontSize: 11,
      lineHeight: 17,
      color:
        'rgba(255,255,255,0.82)',
      marginTop: 5,
      maxWidth: 340,
    },

    availabilityCard: {
      marginTop: 14,
      backgroundColor:
        colors.white,
      borderRadius:
        spacing.radiusLarge,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
      padding: 14,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    availabilityIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      backgroundColor:
        colors.successLight,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 10,
    },

    offlineIcon: {
      backgroundColor:
        colors.borderLight,
    },

    availabilityContent: {
      flex: 1,
    },

    availabilityTitle: {
      fontFamily:
        'InterSemiBold',
      fontSize: 12,
      color:
        colors.text,
    },

    availabilitySubtitle: {
      fontFamily:
        'InterRegular',
      fontSize: 9,
      color:
        colors.textMuted,
      marginTop: 3,
    },

    toggle: {
      width: 48,
      height: 27,
      borderRadius: 15,
      backgroundColor:
        colors.border,
      padding: 3,
      justifyContent:
        'center',
      alignItems:
        'flex-start',
    },

    toggleActive: {
      backgroundColor:
        colors.success,
    },

    toggleCircle: {
      width: 21,
      height: 21,
      borderRadius: 11,
      backgroundColor:
        colors.white,
    },

    toggleCircleActive: {
      alignSelf:
        'flex-end',
    },

    locationStatus: {
      marginTop: 8,
      backgroundColor:
        colors.successLight,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 7,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    locationStatusText: {
      fontFamily:
        'InterMedium',
      fontSize: 9,
      color:
        colors.successDark,
      marginLeft: 5,
      flex: 1,
    },

    locationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor:
        colors.success,
    },

    sectionHeader: {
      marginTop: 22,
      marginBottom: 10,
      flexDirection:
        'row',
      alignItems:
        'flex-end',
      justifyContent:
        'space-between',
    },

    sectionTitle: {
      fontFamily:
        'InterBold',
      fontSize: 15,
      color:
        colors.text,
    },

    sectionSubtitle: {
      fontFamily:
        'InterRegular',
      fontSize: 9,
      color:
        colors.textMuted,
      marginTop: 3,
    },

    viewAll: {
      fontFamily:
        'InterSemiBold',
      fontSize: 9,
      color:
        colors.accent,
      paddingBottom: 2,
    },

    requestCard: {
      backgroundColor:
        colors.white,
      borderRadius:
        spacing.radiusLarge,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
      padding:
        spacing.cardPadding,
      marginBottom: 11,
    },

    requestTop: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    requestIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor:
        colors.accentLight,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 10,
    },

    requestInfo: {
      flex: 1,
    },

    requestTitle: {
      fontFamily:
        'InterBold',
      fontSize: 12,
      color:
        colors.text,
    },

    requestDescription: {
      fontFamily:
        'InterRegular',
      fontSize: 9,
      color:
        colors.textMuted,
      marginTop: 3,
    },

    newBadge: {
      backgroundColor:
        colors.accentLight,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 999,
    },

    newBadgeText: {
      fontFamily:
        'InterBold',
      fontSize: 7,
      color:
        colors.accent,
    },

    requestDivider: {
      height: 1,
      backgroundColor:
        colors.borderLight,
      marginVertical: 12,
    },

    requestDetail: {
      flexDirection:
        'row',
      alignItems:
        'center',
      marginBottom: 7,
    },

    requestDetailText: {
      fontFamily:
        'InterRegular',
      fontSize: 9,
      color:
        colors.textSecondary,
      marginLeft: 6,
      flex: 1,
    },

    distance: {
      fontFamily:
        'InterSemiBold',
      fontSize: 9,
      color:
        colors.text,
    },

    requestBottom: {
      borderTopWidth: 1,
      borderTopColor:
        colors.borderLight,
      paddingTop: 11,
      marginTop: 3,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    earningLabel: {
      fontFamily:
        'InterRegular',
      fontSize: 8,
      color:
        colors.textMuted,
    },

    earningValue: {
      fontFamily:
        'InterBold',
      fontSize: 16,
      color:
        colors.successDark,
      marginTop: 2,
    },

    acceptButton: {
      marginLeft:
        'auto',
      height: 38,
      borderRadius: 11,
      backgroundColor:
        colors.accent,
      paddingLeft: 11,
      paddingRight: 9,
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 6,
    },

    acceptText: {
      fontFamily:
        'InterBold',
      fontSize: 8,
      color:
        colors.white,
    },

    offlineCard: {
      backgroundColor:
        colors.white,
      borderRadius:
        spacing.radiusLarge,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
      padding: 22,
      alignItems:
        'center',
    },

    offlineCardIcon: {
      width: 50,
      height: 50,
      borderRadius: 15,
      backgroundColor:
        colors.borderLight,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    offlineTitle: {
      fontFamily:
        'InterBold',
      fontSize: 14,
      color:
        colors.text,
      marginTop: 11,
    },

    offlineText: {
      fontFamily:
        'InterRegular',
      fontSize: 9,
      lineHeight: 14,
      color:
        colors.textMuted,
      textAlign:
        'center',
      marginTop: 4,
      maxWidth: 280,
    },

    goOnlineButton: {
      height: 40,
      borderRadius: 11,
      backgroundColor:
        colors.accent,
      paddingHorizontal: 18,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginTop: 14,
    },

    goOnlineText: {
      fontFamily:
        'InterBold',
      fontSize: 9,
      color:
        colors.white,
    },

    emptyCard: {
      backgroundColor:
        colors.white,
      borderRadius:
        spacing.radiusLarge,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
      padding: 22,
      alignItems:
        'center',
    },

    emptyIcon: {
      width: 50,
      height: 50,
      borderRadius: 15,
      backgroundColor:
        colors.accentLight,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    emptyTitle: {
      fontFamily:
        'InterBold',
      fontSize: 14,
      color:
        colors.text,
      marginTop: 11,
    },

    emptyText: {
      fontFamily:
        'InterRegular',
      fontSize: 9,
      lineHeight: 14,
      color:
        colors.textMuted,
      textAlign:
        'center',
      marginTop: 4,
      maxWidth: 280,
    },

    quickRow: {
      flexDirection:
        'row',
      gap: 9,
      marginTop: 10,
    },

    quickAction: {
      flex: 1,
      backgroundColor:
        colors.white,
      borderRadius:
        spacing.radiusMedium,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
      padding: 11,
      minHeight: 82,
    },

    quickIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor:
        colors.accentLight,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    quickTitle: {
      fontFamily:
        'InterSemiBold',
      fontSize: 10,
      color:
        colors.text,
      marginTop: 8,
    },

    quickSubtitle: {
      fontFamily:
        'InterRegular',
      fontSize: 8,
      color:
        colors.textMuted,
      marginTop: 3,
      paddingRight: 12,
    },

    quickArrow: {
      position:
        'absolute',
      right: 9,
      bottom: 10,
    },

    performanceCard: {
      marginTop: 16,
      minHeight: 116,
      borderRadius: 18,
      backgroundColor: colors.accent,
      padding: 14,
    },

    performanceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    performanceTitle: {
      fontFamily:
        'InterBold',
      fontSize: 14,
      color:
        colors.white,
    },

    performanceSubtitle: {
      fontFamily:
        'InterRegular',
      fontSize: 8.5,
      color:
        'rgba(255,255,255,0.78)',
      marginTop: 3,
    },

    performanceDivider: {
      height: 1,
      backgroundColor:
        'rgba(255,255,255,0.16)',
      marginVertical: 12,
    },

    performanceMetrics: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    performanceMetric: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },

    performanceMetricIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
      backgroundColor:
        colors.white,
    },

    ratingIcon: {
      backgroundColor:
        colors.white,
    },

    jobsIcon: {
      backgroundColor:
        colors.white,
    },

    performanceMetricValue: {
      fontFamily:
        'InterBold',
      fontSize: 17,
      color:
        colors.white,
    },

    performanceMetricLabel: {
      fontFamily:
        'InterRegular',
      fontSize: 8,
      color:
        'rgba(255,255,255,0.78)',
      marginTop: 1,
    },

    statsButton: {
      height: 34,
      borderRadius: 10,
      backgroundColor:
        'rgba(255,255,255,0.14)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingHorizontal: 9,
    },

    statsButtonText: {
      fontFamily:
        'InterSemiBold',
      fontSize: 8.5,
      color:
        colors.white,
    },

    errorText: {
      fontFamily:
        'InterRegular',
      fontSize: 9,
      color:
        colors.danger,
      textAlign:
        'center',
      marginTop: 15,
      marginBottom: 10,
    },
  });