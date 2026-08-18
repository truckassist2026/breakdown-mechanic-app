import { useState } from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import colors from '../constants/colors';
import spacing from '../constants/spacing';

const API_BASE_URL = 'http://192.168.1.15:8080';

async function sendMechanicOtp(phone) {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/mechanic/send-otp`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    throw new Error(data?.message || data?.error || data || `Unable to send OTP. Server returned ${response.status}.`);
  }
  return data;
}

export default function LoginScreen() {
  const router = useRouter();

  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validMobile = mobile.length === 10;

  const handleContinue = async () => {
    if (!validMobile || loading) return;
    try {
      setLoading(true);
      setError('');
      await sendMechanicOtp(mobile);
      router.push({
      pathname: '/otp',
      params: { mobile },
      });
    } catch (error) {
      console.error('[Mechanic Auth] Send OTP failed:', error);
      setError(error?.message || 'Unable to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.brandRow}>

          <View style={styles.brandIcon}>
            <Ionicons
              name="construct-outline"
              size={25}
              color={colors.white}
            />
          </View>

          <View>
            <Text style={styles.brandTitle}>
              RoadAssist
            </Text>

            <Text style={styles.brandSubtitle}>
              Mechanic Partner
            </Text>
          </View>

        </View>

        <View style={styles.intro}>

          <Text style={styles.title}>
            Welcome back
          </Text>

          <Text style={styles.description}>
            Sign in to manage service requests
            and help drivers on the road.
          </Text>

        </View>

        <View style={styles.card}>

          <View style={styles.cardIcon}>
            <Ionicons
              name="construct"
              size={23}
              color={colors.accent}
            />
          </View>

          <Text style={styles.cardTitle}>
            Mechanic sign in
          </Text>

          <Text style={styles.cardSubtitle}>
            Enter your registered mobile number.
          </Text>

          <Text style={styles.label}>
            Mobile number
          </Text>

          <View
            style={[
              styles.inputContainer,
              mobile.length > 0 &&
                styles.inputActive,
            ]}
          >

            <View style={styles.countryCode}>
              <Text style={styles.countryText}>
                +91
              </Text>
            </View>

            <View style={styles.divider} />

            <TextInput
              style={styles.input}
              value={mobile}
              onChangeText={(value) => {
                setMobile(
                  value
                    .replace(/[^0-9]/g, '')
                    .slice(0, 10)
                );
              }}
              placeholder="Enter mobile number"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
              maxLength={10}
            />

            {mobile.length === 10 && (
              <Ionicons
                name="checkmark-circle"
                size={21}
                color={colors.success}
                style={styles.validIcon}
              />
            )}

          </View>

          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.button,
              (!validMobile || loading) && styles.buttonDisabled,
            ]}
            disabled={!validMobile || loading}
            onPress={handleContinue}
            activeOpacity={0.85}
          >

            <Text
              style={[
                styles.buttonText,
                (!validMobile || loading) && styles.buttonTextDisabled,
              ]}
            >
              {loading ? 'SENDING OTP...' : 'CONTINUE'}
            </Text>

            <View
              style={[
                styles.arrowBox,
                (!validMobile || loading) && styles.arrowBoxDisabled,
              ]}
            >
              <Ionicons
                name={loading ? 'hourglass-outline' : 'arrow-forward'}
                size={19}
                color={
                  validMobile && !loading
                    ? colors.white
                    : colors.textLight
                }
              />
            </View>

          </TouchableOpacity>

          <View style={styles.infoRow}>

            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color={colors.textMuted}
            />

            <Text style={styles.infoText}>
              We'll verify your mobile number with
              a one-time code.
            </Text>

          </View>

        </View>

        <View style={styles.partnerCard}>

          <View style={styles.partnerIcon}>
            <Ionicons
              name="people-outline"
              size={20}
              color={colors.accent}
            />
          </View>

          <View style={styles.partnerContent}>

            <Text style={styles.partnerTitle}>
              Mechanic Partner
            </Text>

            <Text style={styles.partnerText}>
              Accept nearby requests, assist drivers
              and grow your earnings.
            </Text>

          </View>

        </View>

        <Text style={styles.footer}>
          RoadAssist • Mechanic Partner
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 24,
    paddingBottom: 30,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  brandTitle: {
    fontFamily: 'InterBold',
    fontSize: 18,
    color: colors.text,
  },

  brandSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },

  intro: {
    marginTop: 34,
    marginBottom: 22,
  },

  title: {
    fontFamily: 'InterBold',
    fontSize: 28,
    lineHeight: 34,
    color: colors.text,
    letterSpacing: -0.6,
  },

  description: {
    fontFamily: 'InterRegular',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 7,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.cardPadding,

    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 3,
  },

  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  cardTitle: {
    fontFamily: 'InterBold',
    fontSize: 18,
    color: colors.text,
  },

  cardSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 22,
  },

  label: {
    fontFamily: 'InterSemiBold',
    fontSize: 12,
    color: colors.text,
    marginBottom: 8,
  },

  inputContainer: {
    height: 54,
    borderRadius: spacing.radiusMedium,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputActive: {
    borderColor: colors.accent,
    backgroundColor: colors.white,
  },

  countryCode: {
    paddingLeft: 15,
    paddingRight: 12,
  },

  countryText: {
    fontFamily: 'InterSemiBold',
    fontSize: 13,
    color: colors.textSecondary,
  },

  divider: {
    height: 22,
    width: 1,
    backgroundColor: colors.border,
  },

  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontFamily: 'InterRegular',
    fontSize: 14,
    color: colors.text,
  },

  validIcon: {
    marginRight: 13,
  },

  button: {
    height: spacing.buttonHeight,
    borderRadius: 15,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 7,
    marginTop: 19,
  },

  buttonDisabled: {
    backgroundColor: colors.borderLight,
  },

  buttonText: {
    flex: 1,
    fontFamily: 'InterBold',
    fontSize: 13,
    color: colors.white,
  },

  buttonTextDisabled: {
    color: colors.textLight,
  },

  arrowBox: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: colors.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowBoxDisabled: {
    backgroundColor: colors.border,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  infoText: {
    flex: 1,
    fontFamily: 'InterRegular',
    fontSize: 10,
    lineHeight: 14,
    color: colors.textMuted,
    marginLeft: 8,
  },

  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 2 },

  errorText: { flex: 1, fontFamily: 'InterRegular', fontSize: 10, lineHeight: 14, color: colors.danger, marginLeft: 6 },

  partnerCard: {
    marginTop: 17,
    backgroundColor: colors.accentLight,
    borderRadius: spacing.radiusMedium,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  partnerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  partnerContent: {
    flex: 1,
  },

  partnerTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 11,
    color: colors.text,
  },

  partnerText: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    lineHeight: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },

  footer: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 21,
  },
});