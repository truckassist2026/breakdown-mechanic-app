import {
  useEffect,
  useRef,
  useState,
} from 'react';

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

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import colors from '../constants/colors';
import spacing from '../constants/spacing';

import {
  useAuth,
} from '../context/AuthContext';


// =========================================================
// API CONFIG
// =========================================================

const API_BASE_URL =
  'http://192.168.1.15:8080';


// =========================================================
// API HELPER
// =========================================================

async function apiRequest(
  endpoint,
  options = {}
) {

  const {
    method = 'GET',
    body,
  } = options;


  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method,

        headers: {
          Accept:
            'application/json',

          'Content-Type':
            'application/json',
        },

        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      }
    );


  const contentType =
    response.headers.get(
      'content-type'
    ) || '';


  let data = null;


  if (
    contentType.includes(
      'application/json'
    )
  ) {

    data =
      await response.json();

  } else {

    const text =
      await response.text();

    data =
      text || null;
  }


  if (!response.ok) {

    const message =
      data?.message ||
      data?.error ||
      data ||
      `Request failed with status ${response.status}`;


    const error =
      new Error(
        message
      );


    error.status =
      response.status;


    error.data =
      data;


    throw error;
  }


  return data;
}


// =========================================================
// SEND MECHANIC OTP
// =========================================================

async function sendMechanicOtp(
  phone
) {

  return apiRequest(
    '/api/v1/auth/mechanic/send-otp',
    {
      method: 'POST',

      body: {
        phone,
      },
    }
  );
}


// =========================================================
// VERIFY MECHANIC OTP
// =========================================================

async function verifyMechanicOtp(
  phone,
  otp
) {

  return apiRequest(
    '/api/v1/auth/mechanic/verify-otp',
    {
      method: 'POST',

      body: {
        phone,
        otp,
      },
    }
  );
}


// =========================================================
// OTP SCREEN
// =========================================================

export default function OTPScreen() {

  const router =
    useRouter();


  const {
    mobile,
  } =
    useLocalSearchParams();


  const {
    login,
  } =
    useAuth();


  const [
    otp,
    setOtp,
  ] = useState('');


  const [
    seconds,
    setSeconds,
  ] = useState(60);


  const [
    error,
    setError,
  ] = useState('');


  const [
    verifying,
    setVerifying,
  ] = useState(false);


  const [
    resending,
    setResending,
  ] = useState(false);


  const inputRef =
    useRef(null);

  // Prevent duplicate OTP verification requests.
  // React state updates are asynchronous, so this ref
  // provides an immediate synchronous lock.
  const verifyLockRef =
    useRef(false);


  // =======================================================
  // MOBILE
  // =======================================================

  const mobileValue =
    Array.isArray(mobile)
      ? mobile[0]
      : mobile || '';


  const cleanMobile =
    String(
      mobileValue
    )
      .replace(
        /\D/g,
        ''
      );


  const maskedMobile =
    cleanMobile.length === 10
      ? `+91 ${cleanMobile.slice(
          0,
          2
        )}******${cleanMobile.slice(
          -2
        )}`
      : '+91 ******';


  // =======================================================
  // TIMER
  // =======================================================

  useEffect(() => {

    if (
      seconds <= 0
    ) {
      return;
    }


    const timer =
      setInterval(() => {

        setSeconds(
          value =>
            value > 0
              ? value - 1
              : 0
        );

      }, 1000);


    return () => {
      clearInterval(timer);
    };

  }, [seconds]);


  // =======================================================
  // VERIFY OTP
  // =======================================================

  const handleVerify =
    async () => {

      if (
        otp.length !== 6
      ) {

        setError(
          'Enter the 6-digit verification code.'
        );

        return;
      }


      if (
        verifyLockRef.current
      ) {
        console.log(
          '[Mechanic Auth] Verification already in progress'
        );

        return;
      }


      // Lock immediately before the API request.
      verifyLockRef.current = true;


      try {

        setVerifying(
          true
        );

        setError('');


        console.log(
          '[Mechanic Auth] Verifying OTP...'
        );


        // =================================================
        // CALL BACKEND
        // =================================================

        const response =
  await verifyMechanicOtp(
    cleanMobile,
    otp
  );

console.log(
  '[Mechanic Auth] RAW OTP RESPONSE:',
  JSON.stringify(
    response,
    null,
    2
  )
);


        console.log(
          '[Mechanic Auth] Verify response:',
          {
            userId:
              response?.userId,

            role:
              response?.role,

            token:
              response?.accessToken
                ? 'PRESENT'
                : 'MISSING',

            isNewUser:
              response?.newUser,
          }
        );


        // =================================================
        // TOKEN CHECK
        // =================================================

        if (
          !response?.accessToken
        ) {

          throw new Error(
            'Authentication token was not received from the server.'
          );
        }


        // =================================================
        // ROLE CHECK
        // =================================================

        if (
          response?.role &&
          String(
            response.role
          ).toUpperCase() !==
            'MECHANIC'
        ) {

          throw new Error(
            'This mobile number is not registered as a mechanic.'
          );
        }


        // =================================================
        // USER DATA
        // =================================================

        const userData = {

          id:
            response.userId,

          phone:
            cleanMobile,

          role:
            response.role,

          isNewUser:
            response.newUser,

        };


        console.log(
          '[Mechanic Auth] Saving session...'
        );


        // =================================================
        // SAVE JWT SESSION
        // =================================================

        await login(
          response.accessToken,
          userData
        );


        console.log(
          '[Mechanic Auth] Session saved successfully'
        );


        // =================================================
        // NAVIGATE HOME
        // =================================================

        router.replace('/');

      } catch (error) {

        console.error(
          '[Mechanic Auth] OTP verification failed:',
          error
        );


        const message =
          error?.data?.message ||
          error?.message ||
          'Invalid verification code. Please try again.';


        setError(
          message
        );


        setOtp('');

        // Allow another attempt after a genuine failure.
        verifyLockRef.current = false;

      } finally {

        setVerifying(
          false
        );
      }
    };


  // =======================================================
  // RESEND OTP
  // =======================================================

  const handleResend =
    async () => {

      if (
        seconds > 0 ||
        resending ||
        verifying
      ) {
        return;
      }


      try {

        setResending(
          true
        );

        setError('');

        setOtp('');


        console.log(
          '[Mechanic Auth] Requesting new OTP...'
        );


        await sendMechanicOtp(
          cleanMobile
        );


        console.log(
          '[Mechanic Auth] New OTP sent'
        );


        setSeconds(
          60
        );


        setTimeout(() => {

          inputRef.current?.focus();

        }, 100);

      } catch (error) {

        console.error(
          '[Mechanic Auth] Resend OTP failed:',
          error
        );


        setError(
          error?.data?.message ||
          error?.message ||
          'Unable to resend OTP. Please try again.'
        );

      } finally {

        setResending(
          false
        );
      }
    };


  // =======================================================
  // UI
  // =======================================================

  return (

    <KeyboardAvoidingView
      style={
        styles.container
      }

      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >

      <ScrollView
        contentContainerStyle={
          styles.content
        }

        showsVerticalScrollIndicator={
          false
        }

        keyboardShouldPersistTaps="handled"
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View
          style={
            styles.header
          }
        >

          <TouchableOpacity
            style={
              styles.backButton
            }

            onPress={() =>
              router.back()
            }

            activeOpacity={0.8}

            disabled={
              verifying ||
              resending
            }
          >

            <Ionicons
              name="arrow-back"
              size={21}
              color={
                colors.text
              }
            />

          </TouchableOpacity>


          <View>

            <Text
              style={
                styles.headerTitle
              }
            >
              Verification
            </Text>


            <Text
              style={
                styles.headerSubtitle
              }
            >
              Mechanic Partner
            </Text>

          </View>

        </View>


        {/* =================================================
            INTRO
        ================================================= */}

        <View
          style={
            styles.intro
          }
        >

          <View
            style={
              styles.iconBox
            }
          >

            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color={
                colors.accent
              }
            />

          </View>


          <Text
            style={
              styles.title
            }
          >
            Verify your number
          </Text>


          <Text
            style={
              styles.description
            }
          >
            Enter the 6-digit code sent to
          </Text>


          <Text
            style={
              styles.mobile
            }
          >
            {maskedMobile}
          </Text>

        </View>


        {/* =================================================
            OTP CARD
        ================================================= */}

        <View
          style={
            styles.card
          }
        >

          <Text
            style={
              styles.label
            }
          >
            Verification code
          </Text>


          <View
            style={
              styles.otpRow
            }
          >

            <TextInput
              ref={
                inputRef
              }

              value={
                otp
              }

              onChangeText={
                value => {

                  const clean =
                    value
                      .replace(
                        /[^0-9]/g,
                        ''
                      )
                      .slice(
                        0,
                        6
                      );


                  setOtp(
                    clean
                  );


                  setError('');
                }
              }

              keyboardType="number-pad"

              maxLength={6}

              autoFocus

              editable={
                !verifying
              }

              style={
                styles.hiddenInput
              }
            />


            {Array.from({
              length: 6,
            }).map(
              (_, index) => (

                <TouchableOpacity
                  key={
                    index
                  }

                  style={[
                    styles.otpBox,

                    index ===
                      otp.length &&
                      styles.otpBoxActive,

                    error &&
                      styles.otpBoxError,
                  ]}

                  onPress={() =>
                    inputRef.current?.focus()
                  }

                  activeOpacity={
                    0.8
                  }
                >

                  <Text
                    style={
                      styles.otpText
                    }
                  >
                    {
                      otp[index] ||
                      ''
                    }
                  </Text>

                </TouchableOpacity>

              )
            )}

          </View>


          {/* =================================================
              ERROR
          ================================================= */}

          {error ? (

            <View
              style={
                styles.errorRow
              }
            >

              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={
                  colors.danger
                }
              />


              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>

            </View>

          ) : null}


          {/* =================================================
              VERIFY
          ================================================= */}

          <TouchableOpacity
            style={[
              styles.button,

              (
                otp.length !== 6 ||
                verifying
              ) &&
                styles.buttonDisabled,
            ]}

            disabled={
              otp.length !== 6 ||
              verifying
            }

            onPress={
              handleVerify
            }

            activeOpacity={
              0.85
            }
          >

            <Text
              style={[
                styles.buttonText,

                (
                  otp.length !== 6 ||
                  verifying
                ) &&
                  styles.buttonTextDisabled,
              ]}
            >
              {
                verifying
                  ? 'VERIFYING...'
                  : 'VERIFY & CONTINUE'
              }
            </Text>


            {!verifying && (

              <View
                style={[
                  styles.arrowBox,

                  otp.length !== 6 &&
                    styles.arrowBoxDisabled,
                ]}
              >

                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color={
                    otp.length === 6
                      ? colors.white
                      : colors.textLight
                  }
                />

              </View>

            )}

          </TouchableOpacity>


          {/* =================================================
              RESEND
          ================================================= */}

          <View
            style={
              styles.resendRow
            }
          >

            <Text
              style={
                styles.resendLabel
              }
            >
              Didn't receive the code?
            </Text>


            {seconds > 0 ? (

              <Text
                style={
                  styles.timer
                }
              >
                Resend in {seconds}s
              </Text>

            ) : (

              <TouchableOpacity
                onPress={
                  handleResend
                }

                disabled={
                  resending ||
                  verifying
                }

                activeOpacity={
                  0.8
                }
              >

                <Text
                  style={
                    styles.resend
                  }
                >
                  {
                    resending
                      ? 'Sending...'
                      : 'Resend code'
                  }
                </Text>

              </TouchableOpacity>

            )}

          </View>

        </View>


        {/* =================================================
            SECURITY CARD
        ================================================= */}

        <View
          style={
            styles.securityCard
          }
        >

          <View
            style={
              styles.securityIcon
            }
          >

            <Ionicons
              name="lock-closed-outline"
              size={19}
              color={
                colors.success
              }
            />

          </View>


          <View
            style={
              styles.securityContent
            }
          >

            <Text
              style={
                styles.securityTitle
              }
            >
              Secure login
            </Text>


            <Text
              style={
                styles.securityText
              }
            >
              Your verification code keeps
              your mechanic account secure.
            </Text>

          </View>

        </View>


        {/* =================================================
            FOOTER
        ================================================= */}

        <Text
          style={
            styles.footer
          }
        >
          RoadAssist • Mechanic Partner
        </Text>

      </ScrollView>

    </KeyboardAvoidingView>
  );
}


// =========================================================
// STYLES
// =========================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },


    content: {
      flexGrow: 1,
      paddingHorizontal:
        spacing.screenHorizontal,
      paddingTop: 20,
      paddingBottom: 30,
    },


    header: {
      minHeight: 58,
      flexDirection:
        'row',
      alignItems:
        'center',
    },


    backButton: {
      width: 43,
      height: 43,
      borderRadius: 14,
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 11,
    },


    headerTitle: {
      fontFamily:
        'InterBold',
      fontSize: 17,
      color:
        colors.text,
    },


    headerSubtitle: {
      fontFamily:
        'InterRegular',
      fontSize: 10,
      color:
        colors.textMuted,
      marginTop: 2,
    },


    intro: {
      marginTop: 30,
      marginBottom: 23,
    },


    iconBox: {
      width: 50,
      height: 50,
      borderRadius: 15,
      backgroundColor:
        colors.accentLight,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom: 14,
    },


    title: {
      fontFamily:
        'InterBold',
      fontSize: 26,
      lineHeight: 32,
      color:
        colors.text,
    },


    description: {
      fontFamily:
        'InterRegular',
      fontSize: 13,
      color:
        colors.textMuted,
      marginTop: 6,
    },


    mobile: {
      fontFamily:
        'InterSemiBold',
      fontSize: 13,
      color:
        colors.text,
      marginTop: 3,
    },


    card: {
      backgroundColor:
        colors.white,
      borderRadius:
        spacing.radiusLarge,
      borderWidth: 1,
      borderColor:
        colors.borderLight,
      padding:
        spacing.cardPadding,

      shadowColor:
        colors.shadow,

      shadowOffset: {
        width: 0,
        height: 7,
      },

      shadowOpacity: 0.06,
      shadowRadius: 15,
      elevation: 3,
    },


    label: {
      fontFamily:
        'InterSemiBold',
      fontSize: 12,
      color:
        colors.text,
      marginBottom: 10,
    },


    otpRow: {
      flexDirection:
        'row',
      justifyContent:
        'space-between',
    },


    hiddenInput: {
      position:
        'absolute',
      width: 1,
      height: 1,
      opacity: 0,
    },


    otpBox: {
      width: 43,
      height: 54,
      borderRadius:
        spacing.radiusMedium,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.background,
      alignItems:
        'center',
      justifyContent:
        'center',
    },


    otpBoxActive: {
      borderColor:
        colors.accent,
      backgroundColor:
        colors.accentLight,
    },


    otpBoxError: {
      borderColor:
        colors.danger,
    },


    otpText: {
      fontFamily:
        'InterBold',
      fontSize: 20,
      color:
        colors.text,
    },


    errorRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      marginTop: 10,
    },


    errorText: {
      flex: 1,
      fontFamily:
        'InterRegular',
      fontSize: 10,
      lineHeight: 14,
      color:
        colors.danger,
      marginLeft: 5,
    },


    button: {
      height:
        spacing.buttonHeight,
      borderRadius: 15,
      backgroundColor:
        colors.accent,
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingLeft: 18,
      paddingRight: 7,
      marginTop: 19,
    },


    buttonDisabled: {
      backgroundColor:
        colors.borderLight,
    },


    buttonText: {
      flex: 1,
      fontFamily:
        'InterBold',
      fontSize: 12,
      color:
        colors.white,
    },


    buttonTextDisabled: {
      color:
        colors.textLight,
    },


    arrowBox: {
      width: 39,
      height: 39,
      borderRadius: 11,
      backgroundColor:
        colors.accentDark,
      alignItems:
        'center',
      justifyContent:
        'center',
    },


    arrowBoxDisabled: {
      backgroundColor:
        colors.border,
    },


    resendRow: {
      flexDirection:
        'row',
      justifyContent:
        'center',
      alignItems:
        'center',
      marginTop: 18,
    },


    resendLabel: {
      fontFamily:
        'InterRegular',
      fontSize: 10,
      color:
        colors.textMuted,
    },


    timer: {
      fontFamily:
        'InterSemiBold',
      fontSize: 10,
      color:
        colors.textLight,
      marginLeft: 4,
    },


    resend: {
      fontFamily:
        'InterSemiBold',
      fontSize: 10,
      color:
        colors.accent,
      marginLeft: 4,
    },


    securityCard: {
      marginTop: 17,
      backgroundColor:
        colors.successLight,
      borderRadius:
        spacing.radiusMedium,
      padding: 13,
      flexDirection:
        'row',
      alignItems:
        'center',
    },


    securityIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        colors.white,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 10,
    },


    securityContent: {
      flex: 1,
    },


    securityTitle: {
      fontFamily:
        'InterSemiBold',
      fontSize: 11,
      color:
        colors.text,
    },


    securityText: {
      fontFamily:
        'InterRegular',
      fontSize: 10,
      lineHeight: 14,
      color:
        colors.textSecondary,
      marginTop: 2,
    },


    footer: {
      fontFamily:
        'InterRegular',
      fontSize: 10,
      color:
        colors.textLight,
      textAlign:
        'center',
      marginTop: 22,
    },

  });