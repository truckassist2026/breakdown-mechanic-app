import { useState } from 'react';

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

import colors from '../constants/colors';
import spacing from '../constants/spacing';

export default function RatingScreen() {
  const router = useRouter();

  const { requestId } = useLocalSearchParams();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitRating = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        <View style={styles.successIcon}>

          <Ionicons
            name="checkmark"
            size={35}
            color={colors.white}
          />

        </View>

        <Text style={styles.title}>
          Job completed!
        </Text>

        <Text style={styles.subtitle}>
          Thank you for helping Rajesh get back
          on the road.
        </Text>


        <View style={styles.earningCard}>

          <Text style={styles.earningLabel}>
            Your earning
          </Text>

          <Text style={styles.earning}>
            ₹450
          </Text>

          <View style={styles.completedBadge}>

            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.success}
            />

            <Text style={styles.completedText}>
              PAYMENT RECEIVED
            </Text>

          </View>

        </View>


        <View style={styles.ratingCard}>

          <Text style={styles.ratingTitle}>
            Rate your experience
          </Text>

          <Text style={styles.ratingSubtitle}>
            How was your service experience?
          </Text>


          <View style={styles.stars}>

            {Array.from({ length: 5 }).map(
              (_, index) => {

                const value = index + 1;

                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setRating(value)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={
                        value <= rating
                          ? 'star'
                          : 'star-outline'
                      }
                      size={38}
                      color={
                        value <= rating
                          ? colors.warning
                          : colors.textLight
                      }
                    />
                  </TouchableOpacity>
                );
              }
            )}

          </View>

          <Text style={styles.ratingValue}>
            {rating === 0
              ? 'Select a rating'
              : `${rating} out of 5`}
          </Text>


          <TextInput
            style={styles.comment}
            value={comment}
            onChangeText={setComment}
            placeholder="Add a note about this job..."
            placeholderTextColor={colors.textLight}
            multiline
            textAlignVertical="top"
          />

        </View>

      </ScrollView>


      <View style={styles.bottomBar}>

        <TouchableOpacity
          style={[
            styles.button,
            rating === 0 &&
              styles.buttonDisabled,
          ]}
          disabled={rating === 0}
          onPress={submitRating}
          activeOpacity={0.85}
        >

          <Text
            style={[
              styles.buttonText,
              rating === 0 &&
                styles.buttonTextDisabled,
            ]}
          >
            SUBMIT & FINISH
          </Text>

          <View
            style={[
              styles.arrowBox,
              rating === 0 &&
                styles.arrowDisabled,
            ]}
          >

            <Ionicons
              name="checkmark"
              size={19}
              color={
                rating > 0
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
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 40,
    paddingBottom: 110,
  },

  successIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontFamily: 'InterBold',
    fontSize: 25,
    color: colors.text,
    marginTop: 18,
  },

  subtitle: {
    fontFamily: 'InterRegular',
    fontSize: 11,
    lineHeight: 17,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 5,
    maxWidth: 310,
  },

  earningCard: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusLarge,
    alignItems: 'center',
    padding: 20,
    marginTop: 24,
  },

  earningLabel: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: '#CBD5E1',
  },

  earning: {
    fontFamily: 'InterBold',
    fontSize: 32,
    color: colors.white,
    marginTop: 3,
  },

  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 9,
  },

  completedText: {
    fontFamily: 'InterBold',
    fontSize: 7,
    color: colors.successDark,
    marginLeft: 4,
  },

  ratingCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 18,
    marginTop: 15,
  },

  ratingTitle: {
    fontFamily: 'InterBold',
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },

  ratingSubtitle: {
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },

  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    marginTop: 18,
  },

  ratingValue: {
    fontFamily: 'InterSemiBold',
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },

  comment: {
    minHeight: 85,
    backgroundColor: colors.background,
    borderRadius: spacing.radiusMedium,
    marginTop: 17,
    padding: 12,
    fontFamily: 'InterRegular',
    fontSize: 10,
    color: colors.text,
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
    backgroundColor: colors.borderLight,
  },

  buttonText: {
    flex: 1,
    fontFamily: 'InterBold',
    fontSize: 11,
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

  arrowDisabled: {
    backgroundColor: colors.border,
  },
});