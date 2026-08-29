import "../../web.css";

import { Stack, usePathname, useRouter } from "expo-router";

import { useEffect, useState } from "react";

import { ActivityIndicator, View } from "react-native";

import { StatusBar } from "expo-status-bar";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "../context/AuthContext";

import * as SplashScreen from "expo-splash-screen";

import colors from "../constants/colors";

import LaunchScreen from "../components/LaunchScreen";

// =========================================================
// KEEP NATIVE SPLASH WHILE APP STARTS
// =========================================================

SplashScreen.preventAutoHideAsync();

// =========================================================
// ROOT LAYOUT
// =========================================================

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    InterRegular: Inter_400Regular,

    InterMedium: Inter_500Medium,

    InterSemiBold: Inter_600SemiBold,

    InterBold: Inter_700Bold,
  });

  // =======================================================
  // HIDE NATIVE SPLASH AFTER FONTS LOAD
  // =======================================================

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // =======================================================
  // WAIT FOR FONTS
  // =======================================================

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// =========================================================
// APP CONTENT
// =========================================================

function AppContent() {
  const [launchFinished, setLaunchFinished] = useState(false);

  // =======================================================
  // FULL SCREEN LAUNCH SCREEN
  // =======================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setLaunchFinished(true);
    }, 1800);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // =======================================================
  // SHOW MECHANIC LAUNCH SCREEN
  // =======================================================

  if (!launchFinished) {
    return (
      <View style={styles.launchContainer}>
        <LaunchScreen />
      </View>
    );
  }

  // =======================================================
  // NORMAL APPLICATION
  // =======================================================

  return (
    <>
      <StatusBar style="dark" translucent={false} />

      <RootNavigator />
    </>
  );
}

// =========================================================
// ROUTER / AUTH PROTECTION
// =========================================================

function RootNavigator() {
  const router = useRouter();

  const pathname = usePathname();

  const { loading, isAuthenticated } = useAuth();

  // =======================================================
  // AUTH ROUTING
  // =======================================================

  useEffect(() => {
    if (loading) {
      return;
    }

    const isLogin = pathname === "/login";

    const isOtp = pathname === "/otp";

    const isPublic = isLogin || isOtp;

    console.log("[Mechanic Router]", {
      pathname,
      isAuthenticated,
      isPublic,
    });

    // =====================================================
    // NOT AUTHENTICATED
    // =====================================================

    if (!isAuthenticated && !isPublic) {
      router.replace("/login");

      return;
    }

    // =====================================================
    // AUTHENTICATED
    // =====================================================

    if (isAuthenticated && isPublic) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, pathname]);

  // =======================================================
  // AUTH LOADING
  // =======================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.accent} />
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
        backgroundColor: colors.background,
      }}
      edges={["top", "bottom"]}
    >
      <Stack
        screenOptions={{
          headerShown: false,

          animation: "slide_from_right",

          contentStyle: {
            backgroundColor: colors.background,
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
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  launchContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: colors.background,
    zIndex: 9999,
    elevation: 9999,
  },
};
