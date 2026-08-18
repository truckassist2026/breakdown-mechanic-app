import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  usePathname,
  useRouter,
} from 'expo-router';

import colors from '../constants/colors';

const tabs = [
  {
    label: 'Home',
    route: '/',
    icon: 'home-outline',
    activeIcon: 'home',
  },

  {
    label: 'Requests',
    route: '/requests',
    icon: 'clipboard-outline',
    activeIcon: 'clipboard',
  },

  {
    label: 'Earnings',
    route: '/earnings',
    icon: 'wallet-outline',
    activeIcon: 'wallet',
  },

  {
    label: 'Profile',
    route: '/profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
];

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route) => {
    if (route === '/') {
      return pathname === '/';
    }

    return pathname === route;
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.navigation}>
        {tabs.map((tab) => {
          const active =
            isActive(tab.route);

          return (
            <TouchableOpacity
              key={tab.route}
              style={styles.tab}
              onPress={() =>
                router.replace(
                  tab.route
                )
              }
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.iconContainer,

                  active &&
                    styles.iconContainerActive,
                ]}
              >
                <Ionicons
                  name={
                    active
                      ? tab.activeIcon
                      : tab.icon
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
                  styles.label,

                  active &&
                    styles.labelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      colors.white,
    borderTopWidth: 1,
    borderTopColor:
      colors.borderLight,
    paddingBottom: 8,
    paddingTop: 7,
  },

  navigation: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-around',
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  iconContainer: {
    width: 38,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainerActive: {
    backgroundColor:
      colors.accentLight,
  },

  label: {
    fontFamily: 'InterMedium',
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 2,
  },

  labelActive: {
    fontFamily: 'InterBold',
    color: colors.accent,
  },
});