import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  Animated,
  Easing,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components/typography/AppText';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { AlertBanner } from '../../components/feedback/AlertBanner';
import { ForgotPasswordModal } from '../../components/common/ForgotPasswordModal';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  saveRememberedCredentials,
  getRememberedCredentials,
  clearRememberedCredentials,
} from '../../utils/storage';
import { SPACING, RADIUS } from '../../constants/spacing';

export const LoginScreen = () => {
  const { login, isLoading, authError, clearError } = useAuth();
  const { isDark, colors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [formError, setFormError] = useState(null);

  // Floating animation for the logo
  const floatAnim = useRef(new Animated.Value(0)).current;

  // 1. Load remembered credentials immediately on component mount
  useEffect(() => {
    const initCredentials = async () => {
      const saved = await getRememberedCredentials();
      if (saved && (saved.identifier || saved.password)) {
        setIdentifier(saved.identifier || '');
        setPassword(saved.password || '');
        setRememberMe(true);
      }
    };

    initCredentials();

    // 3D subtle float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 2. Immediate storage sync when checking/unchecking Remember Me
  const handleToggleRememberMe = async () => {
    const nextState = !rememberMe;
    setRememberMe(nextState);

    if (nextState) {
      // Immediately store current identifier and password
      await saveRememberedCredentials(identifier, password);
    } else {
      // Immediately remove from storage
      await clearRememberedCredentials();
    }
  };

  // 3. Keep storage in sync when user edits inputs if Remember Me is active
  const handleIdentifierChange = (text) => {
    setIdentifier(text);
    if (formError) setFormError(null);
    if (rememberMe) {
      saveRememberedCredentials(text, password);
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (formError) setFormError(null);
    if (rememberMe) {
      saveRememberedCredentials(identifier, text);
    }
  };

  // 4. Handle sign in
  const handleLogin = async () => {
    Keyboard.dismiss();
    setFormError(null);

    if (!identifier.trim()) {
      setFormError('Please enter your School Email or Username.');
      return;
    }

    if (!password) {
      setFormError('Please enter your Password.');
      return;
    }

    if (rememberMe) {
      await saveRememberedCredentials(identifier, password);
    } else {
      await clearRememberedCredentials();
    }

    await login(identifier, password, 'all');
  };

  const logoTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        {/* Dynamic Background Gradient (Dark / Light) */}
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <LinearGradient
            colors={colors.gradientColors}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          {isDark ? (
            <>
              <View style={styles.topAmbientGlowDark} />
              <View style={styles.bottomAmbientGlowDark} />
            </>
          ) : (
            <View style={styles.topAmbientGlowLight} />
          )}
        </View>

        {/* Top Header Bar with Theme Switcher */}
        <View
          style={[
            styles.topBar,
            { paddingTop: Math.max(insets.top, 16) + 4 },
          ]}
        >
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.7}
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.85)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
              },
            ]}
          >
            <AppText style={styles.themeToggleIcon}>{isDark ? '☀️' : '🌙'}</AppText>
            <AppText
              variant="caption"
              style={[
                styles.themeToggleText,
                { color: isDark ? '#E2E8F0' : '#334155' },
              ]}
            >
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Keyboard Avoiding Container */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View
            style={[
              styles.container,
              {
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
          >
            <View style={styles.contentColumn}>
              {/* Logo Section */}
              <View style={styles.headerSection}>
                <Animated.View
                  style={[
                    styles.emblemContainer,
                    {
                      transform: [
                        { perspective: 800 },
                        { translateY: logoTranslateY },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#3B82F6', '#1E40AF', '#6366F1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.emblemGradient}
                  >
                    <View
                      style={[
                        styles.emblemInner,
                        { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
                      ]}
                    >
                      <AppText style={styles.emblemIcon}>🎓</AppText>
                    </View>
                  </LinearGradient>
                </Animated.View>

                <AppText
                  variant="h1"
                  style={[styles.brandTitle, { color: colors.text.primary }]}
                >
                  PupilScholar
                </AppText>
                <AppText
                  variant="caption"
                  style={[styles.brandSubtitle, { color: colors.text.secondary }]}
                >
                  School Management System
                </AppText>
              </View>

              {/* Login Card */}
              <View
                style={[
                  styles.glassCard,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                {/* Error Banner */}
                {(authError || formError) && (
                  <AlertBanner
                    type="danger"
                    message={authError || formError}
                    onDismiss={() => {
                      clearError();
                      setFormError(null);
                    }}
                    style={styles.errorAlert}
                  />
                )}

                {/* Input 1: Institutional ID or Email */}
                <Input
                  label="Enter the Email or Mobile Number"
                  placeholder="e.g. teacher@school.com"
                  value={identifier}
                  onChangeText={handleIdentifierChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  leftIcon={<AppText style={styles.inputIcon}>👤</AppText>}
                  required
                />

                {/* Input 2: Password */}
                <Input
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={handlePasswordChange}
                  isPassword
                  leftIcon={<AppText style={styles.inputIcon}>🔒</AppText>}
                  required
                />

                {/* Auxiliary Row: Remember Me & Forgot Password */}
                <View style={styles.auxRow}>
                  {/* Remember Me Checkbox */}
                  <TouchableOpacity
                    onPress={handleToggleRememberMe}
                    activeOpacity={0.7}
                    style={styles.rememberMeRow}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: rememberMe
                            ? '#2563EB'
                            : isDark
                            ? 'rgba(255, 255, 255, 0.3)'
                            : '#94A3B8',
                          backgroundColor: rememberMe
                            ? '#2563EB'
                            : isDark
                            ? 'rgba(255, 255, 255, 0.05)'
                            : '#FFFFFF',
                        },
                      ]}
                    >
                      {rememberMe && <AppText style={styles.checkmarkText}>✓</AppText>}
                    </View>
                    <AppText
                      variant="caption"
                      style={[styles.rememberMeLabel, { color: colors.text.secondary }]}
                    >
                      Remember Me
                    </AppText>
                  </TouchableOpacity>

                  {/* Forgot Password Link */}
                  <TouchableOpacity
                    onPress={() => setShowForgotModal(true)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <AppText variant="caption" style={styles.forgotPasswordLink}>
                      Forgot Password?
                    </AppText>
                  </TouchableOpacity>
                </View>

                {/* Sign In CTA Button */}
                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={isLoading}
                  variant="primary"
                  size="lg"
                  style={styles.signInButton}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Forgot Password Modal Dialog */}
        <ForgotPasswordModal
          visible={showForgotModal}
          onClose={() => setShowForgotModal(false)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  topAmbientGlowDark: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(59, 130, 246, 0.16)',
  },
  bottomAmbientGlowDark: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(99, 102, 241, 0.14)',
  },
  topAmbientGlowLight: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.xl,
    zIndex: 10,
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  themeToggleIcon: {
    fontSize: 13,
    marginRight: 5,
  },
  themeToggleText: {
    fontWeight: '700',
    fontSize: 12,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  contentColumn: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emblemContainer: {
    width: 76,
    height: 76,
    borderRadius: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: SPACING.sm,
  },
  emblemGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emblemInner: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emblemIcon: {
    fontSize: 36,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  glassCard: {
    width: '100%',
    borderRadius: 24,
    padding: SPACING.xl,
    borderWidth: 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 8,
  },
  errorAlert: {
    marginBottom: SPACING.md,
  },
  inputIcon: {
    fontSize: 16,
  },
  auxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: SPACING.lg,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  rememberMeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  forgotPasswordLink: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 12,
  },
  signInButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2563EB',
  },
});

export default LoginScreen;
