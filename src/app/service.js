import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

import {
  getMechanicRequestById,
  updateMechanicRequestStatus,
} from '../services/mechanicApi';

export default function ServiceScreen() {

  const router = useRouter();

  const params = useLocalSearchParams();

  const requestId =
    Array.isArray(params.requestId)
      ? params.requestId[0]
      : params.requestId;

  const [
    request,
    setRequest,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updating,
    setUpdating,
  ] = useState(false);

  const [
    notes,
    setNotes,
  ] = useState('');

  const loadRequest =
    useCallback(
      async (
        showLoader = false
      ) => {

        if (!requestId) {
          setLoading(false);
          return;
        }

        try {

          if (showLoader) {
            setLoading(true);
          }

          const response =
            await getMechanicRequestById(
              requestId
            );

          console.log(
            '[MECHANIC SERVICE] Backend status:',
            response?.status
          );

          setRequest(response);

        } catch (err) {

          console.error(
            '[MECHANIC SERVICE] Load failed:',
            err
          );

        } finally {

          setLoading(false);

        }
      },
      [requestId]
    );

  useEffect(() => {

    loadRequest(true);

    const interval =
      setInterval(
        () => loadRequest(false),
        2000
      );

    return () => {
      clearInterval(interval);
    };

  }, [loadRequest]);

  const status =
    String(
      request?.status || ''
    )
      .trim()
      .toUpperCase();

  const mechanic =
    request?.mechanic ||
    null;

  const driver =
    request?.driver ||
    null;

  const vehicle =
    request?.vehicle ||
    null;

  const category =
    String(
      request?.category ||
      'OTHER'
    ).toUpperCase();

  const serviceName =
    category === 'BATTERY'
      ? 'Battery inspection'
      : category === 'TYRE'
        ? 'Tyre service'
        : category === 'FUEL'
          ? 'Fuel assistance'
          : category === 'BREAKDOWN'
            ? 'Vehicle breakdown service'
            : 'Roadside assistance';

  const serviceDescription =
    request?.description ||
    'Working on the vehicle.';

  const vehicleName =
    [
      vehicle?.manufacturer,
      vehicle?.model,
    ]
      .filter(Boolean)
      .join(' ') ||
    'Vehicle';

  const vehicleNumber =
    vehicle?.registrationNumber ||
    'Vehicle number unavailable';

  const mechanicName =
    mechanic?.name ||
    'Mechanic';

  const driverName =
    driver?.name ||
    'Driver';

  const driverPhone =
    driver?.phone ||
    '';

  const rating =
    mechanic?.rating !== null &&
    mechanic?.rating !== undefined
      ? Number(mechanic.rating).toFixed(1)
      : '--';

  const jobs =
    mechanic?.totalJobs ?? 0;

  const updateStatus =
    async (
      targetStatus
    ) => {

      if (
        !requestId ||
        updating
      ) {
        return false;
      }

      try {

        setUpdating(true);

        console.log(
          '[MECHANIC SERVICE] Updating:',
          {
            requestId,
            current: status,
            target: targetStatus,
          }
        );

        const response =
          await updateMechanicRequestStatus(
            requestId,
            targetStatus
          );

        console.log(
          '[MECHANIC SERVICE] Status response:',
          response
        );

        await loadRequest(false);

        return true;

      } catch (err) {

        console.error(
          '[MECHANIC SERVICE] Status update failed:',
          err
        );

        Alert.alert(
          'Unable to Update',
          err?.message ||
          `Unable to update status to ${targetStatus}.`
        );

        return false;

      } finally {

        setUpdating(false);

      }
    };

  const handleStartService =
    async () => {

      if (status !== 'ARRIVED') {
        return;
      }

      await updateStatus(
        'IN_PROGRESS'
      );
    };

  const handleCompleteService =
    async () => {

      if (status !== 'IN_PROGRESS') {
        return;
      }

      const success =
        await updateStatus(
          'PAYMENT_PENDING'
        );

      if (success) {

        router.replace({
          pathname:
            '/payment',
          params: {
            requestId:
              String(requestId || ''),
          },
        });

      }
    };

  const handleCallDriver =
    async () => {

      if (!driverPhone) {
        return;
      }

      try {
        await Linking.openURL(
          `tel:${driverPhone}`
        );
      } catch (err) {
        console.error(
          '[MECHANIC SERVICE] Call failed:',
          err
        );
      }
    };

  if (loading && !request) {

    return (
      <View style={styles.center}>

        <ActivityIndicator
          size="large"
          color={colors.accent}
        />

        <Text style={styles.loadingText}>
          Loading service...
        </Text>

      </View>
    );
  }

  if (!request) {

    return (
      <View style={styles.center}>

        <Ionicons
          name="alert-circle-outline"
          size={38}
          color={colors.accent}
        />

        <Text style={styles.errorTitle}>
          Service request not found
        </Text>

        <TouchableOpacity
          style={styles.backButtonLarge}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            GO BACK
          </Text>
        </TouchableOpacity>

      </View>
    );
  }

  const isArrived =
    status === 'ARRIVED';

  const isInProgress =
    status === 'IN_PROGRESS';

  const isPaymentPending =
    status === 'PAYMENT_PENDING';

  const accepted =
    [
      'ASSIGNED',
      'MECHANIC_EN_ROUTE',
      'ARRIVED',
      'IN_PROGRESS',
      'PAYMENT_PENDING',
    ].includes(status);

  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={colors.text}
          />
        </TouchableOpacity>

        <View style={styles.headerInfo}>

          <Text style={styles.headerTitle}>
            {isInProgress
              ? 'Service in Progress'
              : isPaymentPending
                ? 'Service Completed'
                : 'Mechanic Service'}
          </Text>

          <Text style={styles.headerSubtitle}>
            {vehicleNumber}
          </Text>

        </View>

        <View style={styles.statusBadge}>

          <View style={styles.statusDot} />

          <Text style={styles.statusText}>
            {status || 'ACTIVE'}
          </Text>

        </View>

      </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        <View style={styles.hero}>

          <View style={styles.heroIcon}>

            <Ionicons
              name={
                isInProgress
                  ? 'construct'
                  : isPaymentPending
                    ? 'checkmark'
                    : 'build-outline'
              }
              size={34}
              color={colors.white}
            />

          </View>

          <Text style={styles.heroTitle}>
            {isInProgress
              ? 'Service in progress'
              : isPaymentPending
                ? 'Service completed'
                : 'Ready to service'}
          </Text>

          <Text style={styles.heroText}>
            {isInProgress
              ? `${mechanicName} is working on ${driverName}'s vehicle.`
              : isPaymentPending
                ? 'Waiting for the driver to complete payment.'
                : 'Confirm the service before starting work.'}
          </Text>

        </View>


        <View style={styles.driverCard}>

          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={27}
              color={colors.accent}
            />
          </View>

          <View style={styles.driverInfo}>

            <Text style={styles.driverName}>
              {driverName}
            </Text>

            <Text style={styles.driverSubtitle}>
              {vehicleName} • {vehicleNumber}
            </Text>

            <View style={styles.ratingRow}>

              <Ionicons
                name="star"
                size={13}
                color={colors.warning}
              />

              <Text style={styles.rating}>
                {rating}
              </Text>

              <Text style={styles.jobs}>
                • {jobs} jobs
              </Text>

            </View>

          </View>

          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCallDriver}
            disabled={!driverPhone}
          >
            <Ionicons
              name="call"
              size={18}
              color={colors.white}
            />
          </TouchableOpacity>

        </View>


        <Text style={styles.sectionLabel}>
          CURRENT SERVICE
        </Text>

        <View style={styles.serviceCard}>

          <View style={styles.serviceIcon}>

            <Ionicons
              name={
                category === 'BATTERY'
                  ? 'battery-half-outline'
                  : category === 'TYRE'
                    ? 'disc-outline'
                    : category === 'FUEL'
                      ? 'flame-outline'
                      : 'construct-outline'
              }
              size={24}
              color={colors.serviceBattery}
            />

          </View>

          <View style={styles.serviceInfo}>

            <Text style={styles.serviceTitle}>
              {serviceName}
            </Text>

            <Text style={styles.serviceDescription}>
              {serviceDescription}
            </Text>

            <View style={styles.statusChip}>

              <View style={styles.statusChipDot} />

              <Text style={styles.statusChipText}>
                {isInProgress
                  ? 'IN PROGRESS'
                  : isPaymentPending
                    ? 'PAYMENT PENDING'
                    : 'MECHANIC ARRIVED'}
              </Text>

            </View>

          </View>

        </View>


        <Text style={styles.sectionLabel}>
          VEHICLE DETAILS
        </Text>

        <View style={styles.vehicleCard}>

          <Ionicons
            name="car-outline"
            size={26}
            color={colors.accent}
          />

          <View style={styles.vehicleInfo}>

            <Text style={styles.vehicleNumber}>
              {vehicleNumber}
            </Text>

            <Text style={styles.vehicleModel}>
              {vehicleName}
            </Text>

          </View>

        </View>


        <Text style={styles.sectionLabel}>
          SERVICE CHECKLIST
        </Text>

        <View style={styles.checklistCard}>

          <ChecklistRow
            checked={isInProgress || isPaymentPending}
            title="Battery issue resolved"
            subtitle="Confirm the vehicle starts normally"
          />

          <View style={styles.divider} />

          <ChecklistRow
            checked={isPaymentPending}
            title="Vehicle condition checked"
            subtitle="Confirm the vehicle is safe to drive"
          />

        </View>


        <Text style={styles.sectionLabel}>
          SERVICE NOTES
        </Text>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Add service notes..."
          placeholderTextColor={colors.textMuted}
          style={styles.notes}
        />


        <View style={styles.liveCard}>

          <Ionicons
            name="sync-outline"
            size={20}
            color={colors.accent}
          />

          <View style={styles.liveInfo}>

            <Text style={styles.liveTitle}>
              Live backend status
            </Text>

            <Text style={styles.liveText}>
              {status}. The driver app reads the same
              backend status automatically.
            </Text>

          </View>

        </View>

      </ScrollView>


      <View style={styles.bottomBar}>

        {isArrived && (

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartService}
            disabled={updating}
            activeOpacity={0.85}
          >

            {updating ? (
              <ActivityIndicator
                size="small"
                color={colors.white}
              />
            ) : (
              <Ionicons
                name="construct-outline"
                size={20}
                color={colors.white}
              />
            )}

            <Text style={styles.primaryText}>
              {updating
                ? 'STARTING...'
                : 'START SERVICE'}
            </Text>

          </TouchableOpacity>

        )}

        {isInProgress && (

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCompleteService}
            disabled={updating}
            activeOpacity={0.85}
          >

            {updating ? (
              <ActivityIndicator
                size="small"
                color={colors.white}
              />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={colors.white}
              />
            )}

            <Text style={styles.primaryText}>
              {updating
                ? 'COMPLETING...'
                : 'COMPLETE SERVICE'}
            </Text>

          </TouchableOpacity>

        )}

        {isPaymentPending && (

          <View style={styles.pendingBar}>

            <Ionicons
              name="card-outline"
              size={21}
              color={colors.accent}
            />

            <Text style={styles.pendingText}>
              Waiting for driver payment
            </Text>

          </View>

        )}

        {!accepted && (

          <View style={styles.pendingBar}>

            <Ionicons
              name="information-circle-outline"
              size={21}
              color={colors.accent}
            />

            <Text style={styles.pendingText}>
              Waiting for request assignment
            </Text>

          </View>

        )}

      </View>

    </View>
  );
}

function ChecklistRow({
  checked,
  title,
  subtitle,
}) {

  return (
    <View style={styles.checkRow}>

      <View
        style={[
          styles.checkBox,
          checked &&
            styles.checkBoxChecked,
        ]}
      >

        {checked && (
          <Ionicons
            name="checkmark"
            size={14}
            color={colors.white}
          />
        )}

      </View>

      <View style={styles.checkInfo}>

        <Text style={styles.checkTitle}>
          {title}
        </Text>

        <Text style={styles.checkSubtitle}>
          {subtitle}
        </Text>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  loadingText: {
    marginTop: 12,
    fontFamily: 'InterMedium',
    fontSize: 11,
    color: colors.textMuted,
  },

  errorTitle: {
    marginTop: 12,
    fontFamily: 'InterBold',
    fontSize: 17,
    color: colors.text,
  },

  backButtonLarge: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: colors.accent,
  },

  backButtonText: {
    fontFamily: 'InterBold',
    fontSize: 10,
    color: colors.white,
  },

  header: {
    minHeight: 76,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerBack: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    fontFamily: 'InterBold',
    fontSize: 17,
    color: colors.text,
  },

  headerSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
  },

  statusBadge: {
    backgroundColor: colors.accentLight,
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },

  statusText: {
    fontFamily: 'InterBold',
    fontSize: 8,
    color: colors.accent,
  },

  content: {
    padding: 20,
    paddingBottom: 130,
  },

  hero: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 22,
  },

  heroIcon: {
    width: 78,
    height: 78,
    borderRadius: 27,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroTitle: {
    fontFamily: 'InterBold',
    fontSize: 24,
    color: colors.text,
    marginTop: 15,
  },

  heroText: {
    fontFamily: 'InterRegular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  driverCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  driverInfo: {
    flex: 1,
  },

  driverName: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: colors.text,
  },

  driverSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },

  rating: {
    fontFamily: 'InterBold',
    fontSize: 10,
    color: colors.text,
  },

  jobs: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
  },

  callButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionLabel: {
    fontFamily: 'InterBold',
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginTop: 22,
    marginBottom: 9,
  },

  serviceCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
  },

  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  serviceInfo: {
    flex: 1,
  },

  serviceTitle: {
    fontFamily: 'InterBold',
    fontSize: 13,
    color: colors.text,
  },

  serviceDescription: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
    marginTop: 3,
  },

  statusChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },

  statusChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },

  statusChipText: {
    fontFamily: 'InterBold',
    fontSize: 8,
    color: colors.accent,
  },

  vehicleCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },

  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },

  vehicleNumber: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: colors.text,
  },

  vehicleModel: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 3,
  },

  checklistCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  checkBox: {
    width: 27,
    height: 27,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  checkBoxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },

  checkInfo: {
    flex: 1,
  },

  checkTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 11,
    color: colors.text,
  },

  checkSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },

  notes: {
    minHeight: 110,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 13,
    textAlignVertical: 'top',
    fontFamily: 'InterRegular',
    fontSize: 11,
    color: colors.text,
  },

  liveCard: {
    marginTop: 16,
    backgroundColor: colors.infoLight,
    borderRadius: 15,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  liveInfo: {
    flex: 1,
  },

  liveTitle: {
    fontFamily: 'InterBold',
    fontSize: 11,
    color: colors.text,
  },

  liveText: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    lineHeight: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },

  bottomBar: {
    padding: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  primaryButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  primaryText: {
    fontFamily: 'InterBold',
    fontSize: 11,
    color: colors.white,
  },

  pendingBar: {
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: colors.infoLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  pendingText: {
    fontFamily: 'InterSemiBold',
    fontSize: 11,
    color: colors.textSecondary,
  },
});
