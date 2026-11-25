import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { AppText } from '../typography/AppText';
import { Input } from './Input';
import { Button } from './Button';
import { AlertBanner } from '../feedback/AlertBanner';
import { useTheme } from '../../context/ThemeContext';
import { sendOtpApi, resetPasswordWithOtpApi } from '../../api/authApi';
import { SPACING, RADIUS } from '../../constants/spacing';

/**
 * ForgotPasswordModal
 * Two-step dialog for password recovery via SMS.Api OTP verification
 */
export const ForgotPasswordModal = ({ visible, onClose }) => {
  const { isDark, colors } = useTheme();
  const [step, setStep] = useState('request_otp'); // 'request_otp' | 'verify_reset' | 'completed'
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoMessage, setInfoMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSendOtp = async () => {
    Keyboard.dismiss();
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanInput = recoveryEmail.trim();
    if (!cleanInput) {
      setErrorMessage('Please enter your registered School Email or Mobile Number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendOtpApi(cleanInput);
      setIsSubmitting(false);
      setInfoMessage(`Verification code sent to ${cleanInput}. Please enter the OTP below.`);
      setStep('verify_reset');
    } catch (err) {
      setIsSubmitting(false);
      // Even if API is in test mode, allow transitioning to step 2 for user convenience
      setInfoMessage(`If an account matches "${cleanInput}", an OTP code has been dispatched.`);
      setStep('verify_reset');
    }
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    setErrorMessage(null);

    if (!otpCode.trim()) {
      setErrorMessage('Please enter the verification OTP code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordWithOtpApi(recoveryEmail.trim(), otpCode.trim(), newPassword);
      setIsSubmitting(false);
      setStep('completed');
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to reset password. Please check OTP code.');
    }
  };

  const handleClose = () => {
    setRecoveryEmail('');
    setOtpCode('');
    setNewPassword('');
    setInfoMessage(null);
    setErrorMessage(null);
    setStep('request_otp');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.dialogContainer,
            {
              backgroundColor: isDark ? '#111827' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleCol}>
              <AppText variant="h3" style={{ color: colors.text.primary, fontWeight: '800' }}>
                {step === 'completed' ? 'Password Updated' : 'Reset Password'}
              </AppText>
              <AppText variant="caption" style={{ color: colors.text.secondary, marginTop: 2 }}>
                PupilScholar Security Portal
              </AppText>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={15} style={styles.closeBtn}>
              <AppText style={{ color: colors.text.muted, fontSize: 20 }}>✕</AppText>
            </TouchableOpacity>
          </View>

          {/* Feedback Banners */}
          {errorMessage && (
            <AlertBanner
              type="danger"
              message={errorMessage}
              onDismiss={() => setErrorMessage(null)}
              style={styles.bannerSpacing}
            />
          )}

          {infoMessage && step !== 'completed' && (
            <AlertBanner
              type="info"
              message={infoMessage}
              onDismiss={() => setInfoMessage(null)}
              style={styles.bannerSpacing}
            />
          )}

          {step === 'completed' ? (
            <View style={styles.successBox}>
              <AlertBanner
                type="success"
                title="Success"
                message="Your password has been securely reset. You can now log in with your new password."
                style={styles.bannerSpacing}
              />
              <Button
                title="Back to Sign In"
                onPress={handleClose}
                variant="primary"
                size="md"
                style={{ marginTop: SPACING.md }}
              />
            </View>
          ) : step === 'verify_reset' ? (
            <View>
              <Input
                label="Enter Verification OTP"
                placeholder="e.g. 123456"
                value={otpCode}
                onChangeText={(text) => {
                  setOtpCode(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                keyboardType="number-pad"
                leftIcon={<AppText style={{ fontSize: 16 }}>🔢</AppText>}
                required
              />

              <Input
                label="New Password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                isPassword
                leftIcon={<AppText style={{ fontSize: 16 }}>🔒</AppText>}
                required
              />

              <Button
                title="Set New Password"
                onPress={handleResetPassword}
                loading={isSubmitting}
                variant="primary"
                size="lg"
                style={{ marginTop: SPACING.sm }}
              />

              <TouchableOpacity
                onPress={() => setStep('request_otp')}
                style={{ marginTop: 12, alignItems: 'center' }}
              >
                <AppText variant="caption" style={{ color: '#3B82F6', fontWeight: '600' }}>
                  ← Change Email or Mobile
                </AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <AppText
                variant="caption"
                style={{ color: colors.text.secondary, marginBottom: SPACING.md }}
              >
                Enter your registered school email address or mobile number below. We will send a secure one-time OTP code.
              </AppText>

              <Input
                label="Registered Email or Mobile"
                placeholder="e.g. teacher@school.com"
                value={recoveryEmail}
                onChangeText={(text) => {
                  setRecoveryEmail(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                keyboardType="default"
                leftIcon={<AppText style={{ fontSize: 16 }}>✉️</AppText>}
                required
              />

              <Button
                title="Send Verification Code"
                onPress={handleSendOtp}
                loading={isSubmitting}
                variant="primary"
                size="lg"
                style={{ marginTop: SPACING.sm }}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: SPACING.xl,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleCol: {
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  bannerSpacing: {
    marginBottom: SPACING.md,
  },
  successBox: {
    width: '100%',
  },
});

export default ForgotPasswordModal;
