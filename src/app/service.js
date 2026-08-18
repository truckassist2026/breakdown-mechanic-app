import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import colors from '../constants/colors';
import spacing from '../constants/spacing';

export default function ServiceScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams();

  const [resolved, setResolved] = useState(false);
  const [notes, setNotes] = useState('');

  const completeService = () => {
    if (!resolved) return;

    router.push({
      pathname: '/payment',
      params: {
        requestId: requestId || 'REQ001',
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              Service
            </Text>
            <Text style={styles.headerSubtitle}>
              Battery Issue
            </Text>
          </View>

          <View style={styles.workingBadge}>
            <View style={styles.workingDot} />
            <Text style={styles.workingText}>
              WORKING
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressIcon}>
              <Ionicons
                name="construct-outline"
                size={22}
                color={colors.accent}
              />
            </View>

            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>
                Service in progress
              </Text>
              <Text style={styles.progressSubtitle}>
                Working on the vehicle
              </Text>
            </View>

            <Text style={styles.percent}>
              75%
            </Text>
          </View>

          <View style={styles.track}>
            <View style={styles.fill} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Vehicle details
        </Text>

        <View style={styles.card}>
          <View style={styles.vehicleIcon}>
            <Ionicons
              name="car-sport-outline"
              size={24}
              color={colors.accent}
            />
          </View>

          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>
              Hyundai i20
            </Text>

            <Text style={styles.vehicleNumber}>
              TN 38 AB 4521
            </Text>
          </View>

          <View style={styles.serviceBadge}>
            <Text style={styles.serviceBadgeText}>
              BATTERY
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Service checklist
        </Text>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setResolved(!resolved)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                resolved && styles.checkboxActive,
              ]}
            >
              {resolved && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={colors.white}
                />
              )}
            </View>

            <View style={styles.checkContent}>
              <Text style={styles.checkTitle}>
                Battery issue resolved
              </Text>

              <Text style={styles.checkSubtitle}>
                Confirm the vehicle starts normally
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.checkRow}>
            <View style={styles.pendingCircle}>
              <Ionicons
                name="ellipse-outline"
                size={19}
                color={colors.textLight}
              />
            </View>

            <View style={styles.checkContent}>
              <Text style={styles.checkTitleMuted}>
                Vehicle condition checked
              </Text>

              <Text style={styles.checkSubtitle}>
                Confirm the vehicle is safe to drive
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Service notes
        </Text>

        <View style={styles.notesCard}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add service notes..."
            placeholderTextColor={colors.textLight}
            multiline
            textAlignVertical="top"
            style={styles.notesInput}
          />
        </View>

        <View style={styles.driverCard}>
          <View style={styles.driverIcon}>
            <Ionicons
              name="person-outline"
              size={19}
              color={colors.accent}
            />
          </View>

          <View style={styles.driverInfo}>
            <Text style={styles.driverLabel}>
              Driver
            </Text>
            <Text style={styles.driverName}>
              Rajesh Kumar
            </Text>
          </View>

          <TouchableOpacity style={styles.callButton}>
            <Ionicons
              name="call-outline"
              size={18}
              color={colors.success}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>
            Service amount
          </Text>
          <Text style={styles.amount}>
            ₹450
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.completeButton,
            !resolved && styles.disabledButton,
          ]}
          disabled={!resolved}
          onPress={completeService}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.completeText,
              !resolved && styles.disabledText,
            ]}
          >
            COMPLETE SERVICE
          </Text>

          <View
            style={[
              styles.arrowBox,
              !resolved && styles.disabledArrow,
            ]}
          >
            <Ionicons
              name="arrow-forward"
              size={18}
              color={
                resolved
                  ? colors.white
                  : colors.textLight
              }
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
    paddingTop: 18,
    paddingBottom: 110,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
    marginLeft: 11,
  },

  headerTitle: {
    fontFamily: 'InterBold',
    fontSize: 18,
    color: colors.text,
  },

  headerSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },

  workingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: spacing.radiusRound,
  },

  workingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.warning,
    marginRight: 5,
  },

  workingText: {
    fontFamily: 'InterBold',
    fontSize: 8,
    color: '#B45309',
  },

  progressCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.cardPadding,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  progressInfo: {
    flex: 1,
  },

  progressTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 12,
    color: colors.text,
  },

  progressSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },

  percent: {
    fontFamily: 'InterBold',
    fontSize: 14,
    color: colors.accent,
  },

  track: {
    height: 7,
    backgroundColor: colors.borderLight,
    borderRadius: 99,
    overflow: 'hidden',
    marginTop: 14,
  },

  fill: {
    width: '75%',
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 99,
  },

  sectionTitle: {
    fontFamily: 'InterBold',
    fontSize: 15,
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.cardPadding,
  },

  vehicleIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  vehicleInfo: {
    flex: 1,
  },

  vehicleName: {
    fontFamily: 'InterSemiBold',
    fontSize: 12,
    color: colors.text,
  },

  vehicleNumber: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 3,
  },

  serviceBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 99,
  },

  serviceBadgeText: {
    fontFamily: 'InterBold',
    fontSize: 7,
    color: '#B45309',
  },

  checkRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  checkboxActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },

  pendingCircle: {
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  checkContent: {
    flex: 1,
  },

  checkTitle: {
    fontFamily: 'InterSemiBold',
    fontSize: 11,
    color: colors.text,
  },

  checkTitleMuted: {
    fontFamily: 'InterSemiBold',
    fontSize: 11,
    color: colors.textMuted,
  },

  checkSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },

  notesCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMedium,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 12,
  },

  notesInput: {
    minHeight: 85,
    fontFamily: 'InterRegular',
    fontSize: 11,
    lineHeight: 17,
    color: colors.text,
  },

  driverCard: {
    marginTop: 18,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMedium,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  driverIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  driverInfo: {
    flex: 1,
  },

  driverLabel: {
    fontFamily: 'InterRegular',
    fontSize: 8,
    color: colors.textMuted,
  },

  driverName: {
    fontFamily: 'InterSemiBold',
    fontSize: 11,
    color: colors.text,
    marginTop: 2,
  },

  callButton: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  amountBox: {
    width: 95,
  },

  amountLabel: {
    fontFamily: 'InterRegular',
    fontSize: 8,
    color: colors.textMuted,
  },

  amount: {
    fontFamily: 'InterBold',
    fontSize: 18,
    color: colors.text,
    marginTop: 1,
  },

  completeButton: {
    flex: 1,
    height: spacing.buttonHeight,
    borderRadius: 15,
    backgroundColor: colors.accent,
    paddingLeft: 15,
    paddingRight: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  disabledButton: {
    backgroundColor: colors.borderLight,
  },

  completeText: {
    flex: 1,
    fontFamily: 'InterBold',
    fontSize: 10,
    color: colors.white,
  },

  disabledText: {
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

  disabledArrow: {
    backgroundColor: colors.border,
  },
});