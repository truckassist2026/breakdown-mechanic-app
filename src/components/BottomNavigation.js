import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { usePathname, useRouter } from "expo-router";

import colors from "../constants/colors";

// =========================================================
// BOTTOM NAVIGATION
// Same navigation used by Home
// =========================================================

const tabs = [
  {
    label: "Home",
    route: "/",
    icon: "home-outline",
    activeIcon: "home",
  },

  {
    label: "Requests",
    route: "/requests",
    icon: "clipboard-outline",
    activeIcon: "clipboard",
  },

  {
    label: "Earnings",
    route: "/earnings",
    icon: "wallet-outline",
    activeIcon: "wallet",
  },

  {
    label: "Profile",
    route: "/profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

// =========================================================
// COMPONENT
// =========================================================

export default function BottomNavigation() {
  const router = useRouter();

  const pathname = usePathname();

  const isActive = (route) => {
    if (route === "/") {
      return pathname === "/";
    }

    return pathname === route;
  };

  return (
    <View style={styles.bottomNavigation}>
      {tabs.map((tab) => {
        const active = isActive(tab.route);

        return (
          <TouchableOpacity
            key={tab.route}
            activeOpacity={0.8}
            style={styles.bottomNavItem}
            onPress={() => router.replace(tab.route)}
          >
            <View
              style={[
                styles.bottomNavIcon,

                active && styles.bottomNavIconActive,
              ]}
            >
              <Ionicons
                name={active ? tab.activeIcon : tab.icon}
                size={21}
                color={active ? colors.accent : colors.textMuted}
              />
            </View>

            <Text
              style={[
                styles.bottomNavLabel,

                active && styles.bottomNavLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  bottomNavigation: {
    position: "absolute",

    left: 0,

    right: 0,

    bottom: 0,

    height: 76,

    backgroundColor: colors.white,

    borderTopWidth: 1,

    borderTopColor: colors.borderLight,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-around",

    paddingHorizontal: 6,

    paddingBottom: Platform.OS === "web" ? 4 : 8,

    ...Platform.select({
      web: {
        boxShadow: "0px -2px 10px rgba(15, 23, 42, 0.08)",
      },

      default: {
        shadowColor: colors.shadow,

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

    alignItems: "center",

    justifyContent: "center",

    paddingTop: 4,
  },

  bottomNavIcon: {
    width: 40,

    height: 34,

    borderRadius: 12,

    alignItems: "center",

    justifyContent: "center",
  },

  bottomNavIconActive: {
    backgroundColor: colors.accentLight,
  },

  bottomNavLabel: {
    fontFamily: "InterRegular",

    fontSize: 9,

    color: colors.textMuted,

    marginTop: 3,
  },

  bottomNavLabelActive: {
    fontFamily: "InterSemiBold",

    color: colors.accent,
  },
});
