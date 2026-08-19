import {
  Stack,
  usePathname,
  useRouter,
} from 'expo-router';

import {
  useEffect,
} from 'react';

import {
  ActivityIndicator,
  View,
} from 'react-native';

import {
  StatusBar,
} from 'expo-status-bar';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';

import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  AuthProvider,
  useAuth,
} from '../context/AuthContext';

import colors from '../constants/colors';


// =========================================================
// ROOT LAYOUT
// =========================================================

export default function RootLayout() {

  const [
    fontsLoaded,
  ] = useFonts({

    InterRegular:
      Inter_400Regular,

    InterMedium:
      Inter_500Medium,

    InterSemiBold:
      Inter_600SemiBold,

    InterBold:
      Inter_700Bold,
  });


  if (!fontsLoaded) {

    return (
      <View
        style={
          styles.loadingContainer
        }
      >

        <ActivityIndicator
          size="small"
          color={
            colors.accent
          }
        />

      </View>
    );
  }


  return (
    <SafeAreaProvider>

      <AuthProvider>

        <StatusBar
          style="dark"
          translucent={false}
        />

        <RootNavigator />

      </AuthProvider>

    </SafeAreaProvider>
  );
}


// =========================================================
// ROUTER / AUTH PROTECTION
// =========================================================

function RootNavigator() {

  const router =
    useRouter();

  const pathname =
    usePathname();

  const {
    loading,
    isAuthenticated,
  } =
    useAuth();


  // =======================================================
  // AUTH ROUTING
  // =======================================================

  useEffect(() => {

    if (loading) {
      return;
    }


    const isLogin =
      pathname === '/login';

    const isOtp =
      pathname === '/otp';


    const isPublic =
      isLogin ||
      isOtp;


    console.log(
      '[Mechanic Router]',
      {
        pathname,
        isAuthenticated,
        isPublic,
      }
    );


    // =====================================================
    // NOT AUTHENTICATED
    // =====================================================

    if (
      !isAuthenticated &&
      !isPublic
    ) {

      router.replace(
        '/login'
      );

      return;
    }


    // =====================================================
    // AUTHENTICATED
    // =====================================================

    if (
      isAuthenticated &&
      isPublic
    ) {

      router.replace(
        '/'
      );

    }

  }, [
    loading,
    isAuthenticated,
    pathname,
  ]);


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
          size="small"
          color={
            colors.accent
          }
        />

      </View>
    );
  }


  // =======================================================
  // ROOT STACK
  // =======================================================

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          colors.background,
      }}
      edges={[
        'top',
        'bottom',
      ]}
    >

      <Stack
        screenOptions={{
          headerShown: false,

          animation:
            'slide_from_right',

          contentStyle: {
            backgroundColor:
              colors.background,
          },
        }}
      />

    </SafeAreaView>
  );
}


// =========================================================
// STYLES
// =========================================================

const styles = {

  loadingContainer: {

    flex: 1,

    backgroundColor:
      colors.background,

    alignItems:
      'center',

    justifyContent:
      'center',
  },

};