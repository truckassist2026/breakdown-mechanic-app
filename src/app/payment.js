import { useState } from 'react';

import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import colors from '../constants/colors';
import spacing from '../constants/spacing';

export default function PaymentScreen() {
  const router = useRouter();

  const { requestId } = useLocalSearchParams();

  const [selected, setSelected] = useState('cash');

  const handleContinue = () => {
    router.push({
      pathname: '/rating',
      params: {
        requestId: requestId || 'REQ001',
        paymentMode: selected,
      },
    });
  };

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        <View style={styles.header}>

          <View style={styles.headerIcon}>
            <Ionicons
              name="checkmark-circle"
              size={27}
              color={colors.success}
            />
          </View>

          <Text style={styles.title}>
            Service completed
          </Text>

          <Text style={styles.subtitle}>
            Great job! Now collect the service payment.
          </Text>

        </View>


        <View style={styles.amountCard}>

          <Text style={styles.amountLabel}>
            Total service amount
          </Text>

          <Text style={styles.amount}>
            ₹450
          </Text>

          <View style={styles.amountStatus}>

            <View style={styles.amountDot} />

            <Text style={styles.amountStatusText}>
              PAYMENT DUE
            </Text>

          </View>

        </View>


        <Text style={styles.sectionTitle}>
          Payment method
        </Text>


        <TouchableOpacity
          style={[
            styles.methodCard,
            selected === 'cash' &&
              styles.methodSelected,
          ]}
          onPress={() => setSelected('cash')}
          activeOpacity={0.85}
        >

          <View style={styles.methodIconCash}>
            <Ionicons
              name="cash-outline"
              size={23}
              color={colors.success}
            />
          </View>

          <View style={styles.methodContent}>

            <Text style={styles.methodTitle}>
              Cash
            </Text>

            <Text style={styles.methodSubtitle}>
              Driver pays directly
            </Text>

          </View>

          <View
            style={[
              styles.radio,
              selected === 'cash' &&
                styles.radioSelected,
            ]}
          >

            {selected === 'cash' && (
              <View style={styles.radioInner} />
            )}

          </View>

        </TouchableOpacity>


        <TouchableOpacity
          style={[
            styles.methodCard,
            selected === 'upi' &&
              styles.methodSelected,
          ]}
          onPress={() => setSelected('upi')}
          activeOpacity={0.85}
        >

          <View style={styles.methodIconUpi}>
            <Ionicons
              name="phone-portrait-outline"
              size={23}
              color={colors.accent}
            />
          </View>

          <View style={styles.methodContent}>

            <Text style={styles.methodTitle}>
              UPI
            </Text>

            <Text style={styles.methodSubtitle}>
              Driver pays using UPI
            </Text>

          </View>

          <View
            style={[
              styles.radio,
              selected === 'upi' &&
                styles.radioSelected,
            ]}
          >

            {selected === 'upi' && (
              <View style={styles.radioInner} />
            )}

          </View>

        </TouchableOpacity>


        <View style={styles.summaryCard}>

          <View style={styles.summaryRow}>

            <Text style={styles.summaryLabel}>
              Service charge
            </Text>

            <Text style={styles.summaryValue}>
              ₹450
            </Text>

          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>

            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.totalValue}>
              ₹450
            </Text>

          </View>

        </View>


        <View style={styles.noticeCard}>

          <Ionicons
            name="information-circle-outline"
            size={19}
            color={colors.accent}
          />

          <Text style={styles.noticeText}>
            Confirm that payment has been received
            before completing the job.
          </Text>

        </View>

      </ScrollView>


      <View style={styles.bottomBar}>

        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
          activeOpacity={0.85}
        >

          <Text style={styles.buttonText}>
            PAYMENT RECEIVED
          </Text>

          <View style={styles.arrowBox}>

            <Ionicons
              name="arrow-forward"
              size={19}
              color={colors.white}
            />

          </View>

        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 24,
    paddingBottom: 110,
  },

  header: {
    alignItems: 'center',
  },

  headerIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  title: {
    fontFamily: 'InterBold',
    fontSize: 24,
    color: colors.text,
  },

  subtitle: {
    fontFamily: 'InterRegular',
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 5,
    textAlign: 'center',
  },

  amountCard: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusLarge,
    padding: 20,
    alignItems: 'center',
    marginTop: 24,
  },

  amountLabel: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: '#CBD5E1',
  },

  amount: {
    fontFamily: 'InterBold',
    fontSize: 34,
    color: colors.white,
    marginTop: 4,
  },

  amountStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 10,
  },

  amountDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
    marginRight: 5,
  },

  amountStatusText: {
    fontFamily: 'InterBold',
    fontSize: 7,
    color: '#B45309',
  },

  sectionTitle: {
    fontFamily: 'InterBold',
    fontSize: 15,
    color: colors.text,
    marginTop: 23,
    marginBottom: 10,
  },

  methodCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMedium,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  methodSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },

  methodIconCash: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  methodIconUpi: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  methodContent: {
    flex: 1,
  },

  methodTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 12,
    color: colors.text,
  },

  methodSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioSelected: {
    borderColor: colors.accent,
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },

  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMedium,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    marginTop: 10,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLabel: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
  },

  summaryValue: {
    fontFamily: 'InterSemiBold',
    fontSize: 11,
    color: colors.text,
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },

  totalLabel: {
    fontFamily: 'InterSemiBold',
    fontSize: 12,
    color: colors.text,
  },

  totalValue: {
    fontFamily: 'InterBold',
    fontSize: 17,
    color: colors.text,
  },

  noticeCard: {
    marginTop: 17,
    backgroundColor: colors.infoLight,
    borderRadius: spacing.radiusMedium,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  noticeText: {
    flex: 1,
    fontFamily: 'InterRegular',
    fontSize: 9,
    lineHeight: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: 11,
  },

  button: {
    height: 54,
    borderRadius: 15,
    backgroundColor: colors.accent,
    paddingLeft: 18,
    paddingRight: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  buttonText: {
    flex: 1,
    fontFamily: 'InterBold',
    fontSize: 11,
    color: colors.white,
  },

  arrowBox: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: colors.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});