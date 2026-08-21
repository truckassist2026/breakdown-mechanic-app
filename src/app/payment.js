import { useEffect, useState } from 'react';

import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert } from 'react-native';

import colors from '../constants/colors';
import { apiRequest } from '../services/api';
import { getMechanicRequestById, getServicePayment } from '../services/mechanicApi';
import spacing from '../constants/spacing';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const requestId = Array.isArray(params.requestId) ? params.requestId[0] : params.requestId;

  const [selected, setSelected] = useState('cash');
  const [amountInput, setAmountInput] = useState('');
  const [notes, setNotes] = useState('');
  const [request, setRequest] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const loadData = async (showLoader = false) => {
    if (!requestId) { setError('Request ID is missing.'); setLoading(false); return; }
    try {
      if (showLoader) setLoading(true);
      const requestResponse = await getMechanicRequestById(String(requestId));

      let paymentResponse = null;

      try {
        paymentResponse = await getServicePayment(String(requestId));
      } catch (paymentError) {
        // A payment does not exist until the mechanic generates the bill.
        // Backend correctly returns 404 in this state; do not treat it as
        // a screen-level error.
        if (paymentError?.status === 404) {
          console.log(
            '[MECHANIC PAYMENT] No payment exists yet - bill not generated.'
          );
          paymentResponse = null;
        } else {
          throw paymentError;
        }
      }
      setRequest(requestResponse);
      setPayment(paymentResponse);
      if (paymentResponse?.amount != null) setAmountInput(String(paymentResponse.amount));
      if (paymentResponse?.notes != null) setNotes(String(paymentResponse.notes));
      setError('');
      console.log('[MECHANIC PAYMENT] Request:', requestResponse);
      console.log('[MECHANIC PAYMENT] Payment:', paymentResponse);
    } catch (err) {
      console.error('[MECHANIC PAYMENT] Load failed:', err);
      setError(err?.data?.message || err?.message || 'Unable to load service payment.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    let mounted = true;
    const initial = async () => { if (mounted) await loadData(true); };
    initial();
    const interval = setInterval(() => { if (mounted) loadData(false); }, 3000);
    return () => { mounted = false; clearInterval(interval); };
  }, [requestId]);

  const status = String(payment?.status || '').toUpperCase();
  const requestStatus = String(request?.status || '').toUpperCase();

  const isPending = status === 'PENDING';
  const isPaid = status === 'PAID';
  const isPaymentCancelled = status === 'CANCELLED' || status === 'FAILED';

  // No payment record is the expected state before the mechanic generates
  // the bill.
  const canGenerateBill =
    requestStatus === 'IN_PROGRESS' &&
    !payment &&
    !generating;

  const amount = Number(payment?.amount ?? amountInput ?? 0);
  const category = String(request?.category || 'OTHER').toUpperCase();
  const serviceName = category === 'TYRE' ? 'Tyre service' : category === 'BATTERY' ? 'Battery inspection' : category === 'FUEL' ? 'Fuel assistance' : category === 'BREAKDOWN' ? 'Breakdown assistance' : 'Roadside assistance';
  const vehicle = request?.vehicle;

  const handleGenerateBill = async () => {
    if (!requestId || generating) return;

    if (payment?.status === 'PENDING' || payment?.status === 'PAID') {
      return;
    }

    if (requestStatus !== 'IN_PROGRESS') {
      Alert.alert(
        'Service not ready',
        `The service request is currently ${requestStatus || 'UNKNOWN'}. A bill can be generated only after the service is in progress.`
      );
      await loadData(false);
      return;
    }

    const numericAmount = Number(amountInput);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter a service amount greater than zero.');
      return;
    }
    try {
      setGenerating(true);
      const response = await apiRequest(`/api/v1/payments/requests/${encodeURIComponent(String(requestId))}/initiate`, {
        method: 'POST',
        body: { amount: numericAmount, notes: notes || null },
      });
      console.log('[MECHANIC PAYMENT] Bill generated:', response);
      setPayment(response);
      await loadData(false);
    } catch (err) {
      console.error('[MECHANIC PAYMENT] Generate bill failed:', err);
      Alert.alert('Unable to generate bill', err?.data?.message || err?.message || 'Unable to generate the service bill.');
    } finally { setGenerating(false); }
  };

  const handleDone = () => {
    router.replace('/requests');
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ marginTop: 12, fontFamily: 'InterMedium', fontSize: 11, color: colors.textMuted }}>Loading service payment...</Text>
      </View>
    );
  }

  if (error && !request) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.accent} />
        <Text style={{ marginTop: 12, fontFamily: 'InterBold', fontSize: 16, color: colors.text }}>Unable to load payment</Text>
        <Text style={{ marginTop: 7, fontFamily: 'InterRegular', fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity style={{ marginTop: 20, backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 13 }} onPress={() => loadData(true)}>
          <Text style={{ fontFamily: 'InterBold', fontSize: 10, color: colors.white }}>RETRY</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        <View style={styles.header}>

          <View style={styles.headerIcon}>
            <Ionicons
              name={
                isPaid
                  ? 'checkmark-circle'
                  : isPending
                    ? 'time-outline'
                    : 'receipt-outline'
              }
              size={27}
              color={isPaid ? colors.success : colors.accent}
            />
          </View>

          <Text style={styles.title}>
            {isPaid
              ? 'Payment Received'
              : isPending
                ? 'Waiting for Payment'
                : 'Service Payment'}
          </Text>

          <Text style={styles.subtitle}>
            {isPaid
              ? 'The driver has completed the payment.'
              : isPending
                ? 'The bill has been generated. Waiting for the driver to complete payment.'
                : 'Enter the final service amount and generate the bill.'}
          </Text>

        </View>


        <View style={styles.amountCard}>

          <Text style={styles.amountLabel}>
            Total service amount
          </Text>

          <Text style={styles.amount}>
            ₹{amount.toFixed(0)}
          </Text>

          <View
            style={[
              styles.amountStatus,
              isPaid && styles.amountStatusPaid,
              isPending && styles.amountStatusPending,
            ]}
          >
            <View
              style={[
                styles.amountDot,
                isPaid && styles.amountDotPaid,
              ]}
            />

            <Text
              style={[
                styles.amountStatusText,
                isPaid && styles.amountStatusTextPaid,
              ]}
            >
              {isPaid ? 'PAYMENT RECEIVED' : isPending ? 'PAYMENT DUE' : 'BILL NOT GENERATED'}
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
          onPress={() => !isPending && !isPaid && setSelected('cash')}
          activeOpacity={0.85}
          disabled={generating || isPending || isPaid}
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
          onPress={() => !isPending && !isPaid && setSelected('upi')}
          activeOpacity={0.85}
          disabled={generating || isPending || isPaid}
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


        {canGenerateBill && (
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>SERVICE AMOUNT</Text>
            <TextInput
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="decimal-pad"
              placeholder="Enter final amount"
              placeholderTextColor={colors.textMuted}
              style={styles.amountInput}
            />
            <Text style={[styles.inputLabel, { marginTop: 12 }]}>SERVICE NOTES</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add service details or parts replaced..."
              placeholderTextColor={colors.textMuted}
              multiline
              style={styles.notesInput}
            />
          </View>
        )}

        <View style={styles.summaryCard}>

          <View style={styles.summaryRow}>

            <Text style={styles.summaryLabel}>
              Service charge
            </Text>

            <Text style={styles.summaryValue}>
              ₹{amount.toFixed(0)}
            </Text>

          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>

            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.totalValue}>
              ₹{amount.toFixed(0)}
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
            {isPaid
              ? `₹${amount.toFixed(2)} received via ${String(payment?.paymentMethod || '').toUpperCase()}.`
              : isPending
                ? 'The screen updates automatically when the driver completes payment.'
                : 'No payment record exists yet. Generate the service bill to create the driver payment request.'}
          </Text>

        </View>

      </ScrollView>


      <View style={styles.bottomBar}>

        <TouchableOpacity
          style={[
            styles.button,
            (generating || isPending) && styles.buttonDisabled,
          ]}
          onPress={isPaid ? handleDone : handleGenerateBill}
          activeOpacity={0.85}
          disabled={generating || isPending}
        >
          <Text style={styles.buttonText}>
            {isPaid
              ? 'PAYMENT RECEIVED'
              : generating
                ? 'GENERATING BILL...'
                : isPending
                  ? 'WAITING FOR PAYMENT'
                  : 'GENERATE BILL'}
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
  inputCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMedium,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    marginTop: 10,
  },
  inputLabel: {
    fontFamily: 'InterBold',
    fontSize: 9,
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginBottom: 7,
  },
  amountInput: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontFamily: 'InterSemiBold',
    fontSize: 14,
    color: colors.text,
  },
  notesInput: {
    minHeight: 70,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 10,
    fontFamily: 'InterRegular',
    fontSize: 11,
    color: colors.text,
    textAlignVertical: 'top',
  },
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

  amountStatusPending: {
    backgroundColor: colors.warningLight,
  },

  amountStatusPaid: {
    backgroundColor: colors.successLight,
  },

  amountDotPaid: {
    backgroundColor: colors.success,
  },

  amountStatusTextPaid: {
    color: colors.success,
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

  buttonDisabled: {
    opacity: 0.55,
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