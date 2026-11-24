import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { AppText } from '../typography/AppText';
import { Input } from './Input';
import { Button } from './Button';
import { AlertBanner } from '../feedback/AlertBanner';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, RADIUS } from '../../constants/spacing';

/**
 * ForgotPasswordModal
 * Clean pop-up dialog for password recovery with instant validation.
 */
export const ForgotPasswordModal = ({ visible, onClose }) => {
  const { isDark, colors } = useTheme();
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleResetSubmit = () => {
    Keyboard.dismiss();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!recoveryEmail.trim()) {
      setErrorMessage('Please enter your registered School Email or User ID.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(
        `A password reset link has been dispatched to "${recoveryEmail.trim()}". Please check your inbox and follow the instructions.`
      );
    }, 700);
  };

  const handleClose = () => {
    setRecoveryEmail('');
    setSuccessMessage(null);
    setErrorMessage(null);
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
                Reset Password
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

          {successMessage ? (
            <View style={styles.successBox}>
              <AlertBanner
                type="success"
                title="Link Dispatched"
                message={successMessage}
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
          ) : (
            <View>
              <AppText
                variant="caption"
                style={{ color: colors.text.secondary, marginBottom: SPACING.md }}
              >
                Enter your registered school email address or student/employee ID below. We will send a secure one-time reset link.
              </AppText>

              <Input
                label="Registered Email or ID"
                placeholder="e.g. teacher@school.com"
                value={recoveryEmail}
                onChangeText={(text) => {
                  setRecoveryEmail(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                leftIcon={<AppText style={{ fontSize: 16 }}>✉️</AppText>}
                required
              />

              <Button
                title="Send Reset Link"
                onPress={handleResetSubmit}
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
