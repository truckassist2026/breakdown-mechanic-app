import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useEffect,
  useState,
} from 'react';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useRouter,
} from 'expo-router';

import {
  useAuth,
} from '../context/AuthContext';

import colors from '../constants/colors';
import spacing from '../constants/spacing';


// =========================================================
// HELPERS
// =========================================================

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
}


function getDisplayName(user) {
  if (!user) {
    return 'Mechanic';
  }

  return (
    user.name ||
    user.fullName ||
    user.mechanicName ||
    user.workshopName ||
    'Mechanic'
  );
}


// =========================================================
// DASHBOARD
// =========================================================

export default function IndexScreen() {
  const router = useRouter();

  const {
    loading,
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  // =======================================================
  // AUTH PROTECTION
  // =======================================================

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [
    loading,
    isAuthenticated,
  ]);


  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = async () => {
    setRefreshing(true);

    // Backend dashboard APIs will be connected here.
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };


  // =======================================================
  // LOGOUT
  // =======================================================

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };


  // =======================================================
  // LOADING
  // =======================================================

  if (loading || !isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="small"
          color={colors.accent}
        />
      </View>
    );
  }


  const greeting = getGreeting();
  const displayName = getDisplayName(user);


  return (
    <View style={styles.container}>

      {/* =================================================
          HEADER
          ================================================= */}

      <View style={styles.header}>

        <View style={styles.headerLeft}>

          <View style={styles.brandIcon}>
            <Ionicons
              name="construct"
              size={20}
              color={colors.white}
            />
          </View>

          <View>
            <Text style={styles.brandName}>
              Truck Assist
            </Text>

            <Text style={styles.brandSubtitle}>
              Mechanic Partner
            </Text>
          </View>

        </View>


        <Pressable
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color={colors.text}
          />
        </Pressable>

      </View>


      {/* =================================================
          CONTENT
          ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >

        {/* ===============================================
            WELCOME
            =============================================== */}

        <View style={styles.welcomeSection}>

          <View style={styles.welcomeTextContainer}>

            <Text style={styles.greeting}>
              {greeting}
            </Text>

            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {displayName}
            </Text>

            <Text style={styles.welcomeDescription}>
              Ready to help drivers get back on the road?
            </Text>

          </View>


          <View style={styles.statusBadge}>

            <View style={styles.statusDot} />

            <Text style={styles.statusText}>
              Available
            </Text>

          </View>

        </View>


        {/* ===============================================
            TODAY
            =============================================== */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              Today's Overview
            </Text>

            <Text style={styles.sectionSubtitle}>
              {new Date().toLocaleDateString(
                'en-IN',
                {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                }
              )}
            </Text>
          </View>

        </View>


        {/* ===============================================
            KPI GRID
            =============================================== */}

        <View style={styles.kpiGrid}>

          <DashboardCard
            icon="notifications-outline"
            title="New Requests"
            value="0"
            subtitle="Waiting for you"
            iconBackground={colors.accentLight}
            iconColor={colors.accent}
            onPress={() => router.push('/requests')}
          />

          <DashboardCard
            icon="construct-outline"
            title="Active Jobs"
            value="0"
            subtitle="Currently servicing"
            iconBackground={colors.warningLight}
            iconColor={colors.warning}
            onPress={() => router.push('/active')}
          />

          <DashboardCard
            icon="checkmark-circle-outline"
            title="Completed"
            value="0"
            subtitle="Today's jobs"
            iconBackground={colors.successLight}
            iconColor={colors.success}
            onPress={() => router.push('/history')}
          />

          <DashboardCard
            icon="wallet-outline"
            title="Earnings"
            value="₹0"
            subtitle="Today's earnings"
            iconBackground={colors.infoLight}
            iconColor={colors.info}
            onPress={() => router.push('/earnings')}
          />

        </View>


        {/* ===============================================
            ACTIVE SERVICE
            =============================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Active Service
          </Text>
        </View>


        <Pressable
          style={styles.emptyCard}
          onPress={() => router.push('/active')}
        >

          <View style={styles.emptyIcon}>
            <Ionicons
              name="car-outline"
              size={26}
              color={colors.textMuted}
            />
          </View>


          <View style={styles.emptyContent}>

            <Text style={styles.emptyTitle}>
              No active service
            </Text>

            <Text style={styles.emptyDescription}>
              Accepted service requests will appear here.
            </Text>

          </View>


          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textLight}
          />

        </Pressable>


        {/* ===============================================
            QUICK ACTIONS
            =============================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>
        </View>


        <View style={styles.quickActions}>

          <QuickAction
            icon="list-outline"
            title="Requests"
            subtitle="View requests"
            onPress={() => router.push('/requests')}
          />

          <QuickAction
            icon="time-outline"
            title="History"
            subtitle="Past services"
            onPress={() => router.push('/history')}
          />

          <QuickAction
            icon="wallet-outline"
            title="Earnings"
            subtitle="View earnings"
            onPress={() => router.push('/earnings')}
          />

          <QuickAction
            icon="person-outline"
            title="Profile"
            subtitle="Workshop profile"
            onPress={() => router.push('/profile')}
          />

        </View>


        {/* ===============================================
            PARTNER CARD
            =============================================== */}

        <View style={styles.partnerCard}>

          <View style={styles.partnerIcon}>
            <Ionicons
              name="shield-checkmark"
              size={22}
              color={colors.accent}
            />
          </View>


          <View style={styles.partnerContent}>

            <Text style={styles.partnerTitle}>
              Truck Assist Partner
            </Text>

            <Text style={styles.partnerText}>
              Provide reliable roadside assistance and keep
              drivers moving.
            </Text>

          </View>

        </View>


        {/* ===============================================
            LOGOUT
            =============================================== */}

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >

          <Ionicons
            name="log-out-outline"
            size={19}
            color={colors.danger}
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>

        </Pressable>


        <Text style={styles.version}>
          Truck Assist • Mechanic Partner
        </Text>

      </ScrollView>


      {/* =================================================
          BOTTOM NAVIGATION
          ================================================= */}

      <View style={styles.bottomNavigation}>

        <BottomNavItem
          icon="home"
          outlineIcon="home-outline"
          label="Home"
          active
          onPress={() => router.replace('/')}
        />

        <BottomNavItem
          icon="list"
          outlineIcon="list-outline"
          label="Requests"
          onPress={() => router.push('/requests')}
        />

        <BottomNavItem
          icon="construct"
          outlineIcon="construct-outline"
          label="Active"
          onPress={() => router.push('/active')}
        />

        <BottomNavItem
          icon="wallet"
          outlineIcon="wallet-outline"
          label="Earnings"
          onPress={() => router.push('/earnings')}
        />

        <BottomNavItem
          icon="person"
          outlineIcon="person-outline"
          label="Profile"
          onPress={() => router.push('/profile')}
        />

      </View>

    </View>
  );
}


// =========================================================
// DASHBOARD CARD
// =========================================================

function DashboardCard({
  icon,
  title,
  value,
  subtitle,
  iconBackground,
  iconColor,
  onPress,
}) {
  return (
    <Pressable
      style={styles.kpiCard}
      onPress={onPress}
    >

      <View style={styles.kpiTop}>

        <View
          style={[
            styles.kpiIcon,
            {
              backgroundColor: iconBackground,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={19}
            color={iconColor}
          />
        </View>

        <Ionicons
          name="chevron-forward"
          size={16}
          color={colors.textLight}
        />

      </View>


      <Text style={styles.kpiTitle}>
        {title}
      </Text>

      <Text style={styles.kpiValue}>
        {value}
      </Text>

      <Text style={styles.kpiSubtitle}>
        {subtitle}
      </Text>

    </Pressable>
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
    <Pressable
      style={styles.quickAction}
      onPress={onPress}
    >

      <View style={styles.quickIcon}>
        <Ionicons
          name={icon}
          size={20}
          color={colors.accent}
        />
      </View>


      <View style={styles.quickContent}>

        <Text style={styles.quickTitle}>
          {title}
        </Text>

        <Text style={styles.quickSubtitle}>
          {subtitle}
        </Text>

      </View>


      <Ionicons
        name="chevron-forward"
        size={17}
        color={colors.textLight}
      />

    </Pressable>
  );
}


// =========================================================
// BOTTOM NAV ITEM
// =========================================================

function BottomNavItem({
  icon,
  outlineIcon,
  label,
  active,
  onPress,
}) {
  return (
    <Pressable
      style={styles.bottomNavItem}
      onPress={onPress}
    >

      <View
        style={[
          styles.bottomNavIcon,
          active &&
            styles.bottomNavIconActive,
        ]}
      >

        <Ionicons
          name={
            active
              ? icon
              : outlineIcon
          }
          size={21}
          color={
            active
              ? colors.accent
              : colors.textMuted
          }
        />

      </View>


      <Text
        style={[
          styles.bottomNavLabel,
          active &&
            styles.bottomNavLabelActive,
        ]}
      >
        {label}
      </Text>

    </Pressable>
  );
}


// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },


  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },


  // =======================================================
  // HEADER
  // =======================================================

  header: {
    minHeight:
      Platform.OS === 'web'
        ? 76
        : 68,

    paddingHorizontal:
      spacing.screenHorizontal,

    paddingTop:
      Platform.OS === 'web'
        ? 16
        : 10,

    paddingBottom: 10,

    backgroundColor:
      colors.white,

    borderBottomWidth: 1,

    borderBottomColor:
      colors.borderLight,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },


  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  brandIcon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor:
      colors.accent,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 10,
  },


  brandName: {
    fontFamily: 'InterBold',
    fontSize: 16,
    color: colors.primary,
  },


  brandSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },


  profileButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor:
      colors.background,

    borderWidth: 1,

    borderColor:
      colors.border,

    alignItems: 'center',

    justifyContent: 'center',
  },


  // =======================================================
  // CONTENT
  // =======================================================

  scrollContent: {
    paddingHorizontal:
      spacing.screenHorizontal,

    paddingTop: 20,

    paddingBottom: 120,
  },


  // =======================================================
  // WELCOME
  // =======================================================

  welcomeSection: {
    backgroundColor:
      colors.primary,

    borderRadius: 20,

    padding: 20,

    flexDirection: 'row',

    alignItems: 'flex-start',

    justifyContent: 'space-between',

    marginBottom: 22,

    overflow: 'hidden',
  },


  welcomeTextContainer: {
    flex: 1,
    paddingRight: 10,
  },


  greeting: {
    fontFamily: 'InterMedium',
    fontSize: 13,
    color: '#CBD5E1',
    marginBottom: 3,
  },


  name: {
    fontFamily: 'InterBold',
    fontSize: 24,
    color: colors.white,
    marginBottom: 7,
  },


  welcomeDescription: {
    fontFamily: 'InterRegular',
    fontSize: 11,
    lineHeight: 17,
    color: '#CBD5E1',
    maxWidth: 250,
  },


  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor:
      'rgba(255,255,255,0.10)',

    borderRadius: 999,

    paddingHorizontal: 10,
    paddingVertical: 7,
  },


  statusDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor:
      colors.success,

    marginRight: 6,
  },


  statusText: {
    fontFamily: 'InterSemiBold',
    fontSize: 9,
    color: colors.white,
  },


  // =======================================================
  // SECTION
  // =======================================================

  sectionHeader: {
    marginBottom: 12,
    marginTop: 2,
  },


  sectionTitle: {
    fontFamily: 'InterBold',
    fontSize: 16,
    color: colors.text,
  },


  sectionSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
  },


  // =======================================================
  // KPI
  // =======================================================

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },


  kpiCard: {
    width: '48.3%',

    backgroundColor:
      colors.white,

    borderRadius: 16,

    padding: 14,

    marginBottom: 10,

    borderWidth: 1,

    borderColor:
      colors.borderLight,

    ...Platform.select({

      web: {
        boxShadow:
          '0px 2px 8px rgba(15, 23, 42, 0.05)',
      },

      default: {
        shadowColor:
          colors.shadow,

        shadowOffset: {
          width: 0,
          height: 2,
        },

        shadowOpacity: 0.04,

        shadowRadius: 7,

        elevation: 2,
      },

    }),
  },


  kpiTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },


  kpiIcon: {
    width: 34,
    height: 34,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',
  },


  kpiTitle: {
    fontFamily: 'InterMedium',
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },


  kpiValue: {
    fontFamily: 'InterBold',
    fontSize: 22,
    color: colors.text,
    marginBottom: 2,
  },


  kpiSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textLight,
  },


  // =======================================================
  // ACTIVE SERVICE
  // =======================================================

  emptyCard: {
    backgroundColor:
      colors.white,

    borderRadius: 16,

    borderWidth: 1,

    borderColor:
      colors.border,

    padding: 16,

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 24,
  },


  emptyIcon: {
    width: 46,
    height: 46,

    borderRadius: 13,

    backgroundColor:
      colors.background,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 12,
  },


  emptyContent: {
    flex: 1,
  },


  emptyTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 13,
    color: colors.text,
    marginBottom: 3,
  },


  emptyDescription: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    lineHeight: 15,
    color: colors.textMuted,
  },


  // =======================================================
  // QUICK ACTIONS
  // =======================================================

  quickActions: {
    marginBottom: 24,
  },


  quickAction: {
    backgroundColor:
      colors.white,

    borderRadius: 14,

    borderWidth: 1,

    borderColor:
      colors.borderLight,

    minHeight: 62,

    paddingHorizontal: 13,

    marginBottom: 9,

    flexDirection: 'row',

    alignItems: 'center',
  },


  quickIcon: {
    width: 38,
    height: 38,

    borderRadius: 11,

    backgroundColor:
      colors.accentLight,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 11,
  },


  quickContent: {
    flex: 1,
  },


  quickTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 12,
    color: colors.text,
    marginBottom: 2,
  },


  quickSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
  },


  // =======================================================
  // PARTNER CARD
  // =======================================================

  partnerCard: {
    backgroundColor:
      colors.accentLight,

    borderRadius: 16,

    padding: 15,

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 20,
  },


  partnerIcon: {
    width: 42,
    height: 42,

    borderRadius: 12,

    backgroundColor:
      colors.white,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 11,
  },


  partnerContent: {
    flex: 1,
  },


  partnerTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 12,
    color: colors.primary,
    marginBottom: 3,
  },


  partnerText: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    lineHeight: 14,
    color: colors.textSecondary,
  },


  // =======================================================
  // LOGOUT
  // =======================================================

  logoutButton: {
    height: 48,

    borderRadius: 13,

    borderWidth: 1,

    borderColor:
      colors.dangerLight,

    backgroundColor:
      colors.white,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: 14,
  },


  logoutText: {
    fontFamily: 'InterSemiBold',
    fontSize: 11,
    color: colors.danger,
    marginLeft: 7,
  },


  version: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textLight,
    textAlign: 'center',
  },


  // =======================================================
  // BOTTOM NAVIGATION
  // =======================================================

  bottomNavigation: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    height: 76,

    backgroundColor:
      colors.white,

    borderTopWidth: 1,

    borderTopColor:
      colors.borderLight,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-around',

    paddingHorizontal: 6,

    paddingBottom:
      Platform.OS === 'web'
        ? 4
        : 8,

    ...Platform.select({

      web: {
        boxShadow:
          '0px -2px 10px rgba(15, 23, 42, 0.08)',
      },

      default: {
        shadowColor:
          colors.shadow,

        shadowOffset: {
          width: 0,
          height: -3,
        },

        shadowOpacity: 0.08,

        shadowRadius: 8,

        elevation: 12,
      },

    }),
  },


  bottomNavItem: {
    flex: 1,

    height: 68,

    alignItems: 'center',

    justifyContent: 'center',

    paddingTop: 4,
  },


  bottomNavIcon: {
    width: 40,
    height: 34,

    borderRadius: 12,

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: 2,
  },


  bottomNavIconActive: {
    backgroundColor:
      colors.accentLight,
  },


  bottomNavLabel: {
    fontFamily: 'InterMedium',

    fontSize: 9,

    color:
      colors.textMuted,
  },


  bottomNavLabelActive: {
    fontFamily: 'InterBold',

    color:
      colors.accent,
  },

});
