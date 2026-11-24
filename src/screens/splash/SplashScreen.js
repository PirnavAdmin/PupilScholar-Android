import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '../../components/typography/AppText';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/spacing';

const { width, height } = Dimensions.get('window');

/**
 * Animated 3D Splash Screen
 * Features 3D perspective badge rotation, pulsating neon rings,
 * floating ambient orbs, and progressive loading sequence.
 * 
 * @param {Function} onFinish - Called when splash sequence ends
 */
export const SplashScreen = ({ onFinish }) => {
  // Animation Values
  const logoScale = useRef(new Animated.Value(0.2)).current;
  const logoRotateX = useRef(new Animated.Value(45)).current;
  const logoRotateY = useRef(new Animated.Value(-45)).current;
  const logoElevation = useRef(new Animated.Value(0)).current;

  const ring1Scale = useRef(new Animated.Value(0.6)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;

  const rolePillsOpacity = useRef(new Animated.Value(0)).current;
  const rolePillsScale = useRef(new Animated.Value(0.85)).current;

  const progressBar = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  // Floating continuous loop for 3D orbs
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Start continuous floating ambient orbs
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. Main Entrance Sequence
    Animated.parallel([
      // Logo Spring in with 3D rotation resolving to 0
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotateX, {
        toValue: 0,
        duration: 1100,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(logoRotateY, {
        toValue: 0,
        duration: 1100,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      // Expanding glowing ring
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ring1Scale, {
            toValue: 1.45,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ring1Opacity, {
            toValue: 0.8,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(ring1Opacity, {
          toValue: 0.25,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 3. Staggered Title and Roles Fade In
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(rolePillsOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(rolePillsScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 4. Progress Bar Simulation (2.2 seconds total splash)
    Animated.timing(progressBar, {
      toValue: 1,
      duration: 2200,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        handleExit();
      }
    });
  }, []);

  const handleExit = () => {
    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      if (typeof onFinish === 'function') {
        onFinish();
      }
    });
  };

  // Interpolations for continuous 3D float
  const orb1Y = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });
  const orb2Y = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22],
  });
  const logoHover = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const rotateXStr = logoRotateX.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-180deg', '180deg'],
  });
  const rotateYStr = logoRotateY.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-180deg', '180deg'],
  });

  const progressWidth = progressBar.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <LinearGradient
        colors={['#070B19', '#0F172A', '#1E1B4B', '#090D1E']}
        locations={[0, 0.35, 0.75, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating 3D Background Glowing Orbs */}
      <Animated.View
        style={[
          styles.glowOrb,
          styles.orb1,
          { transform: [{ translateY: orb1Y }, { scale: 1.1 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.glowOrb,
          styles.orb2,
          { transform: [{ translateY: orb2Y }, { scale: 1.2 }] },
        ]}
      />
      <Animated.View style={[styles.glowOrb, styles.orb3]} />

      {/* Content Center */}
      <View style={styles.centerStage}>
        {/* Glowing Pulsing Ring */}
        <Animated.View
          style={[
            styles.pulsingRing,
            {
              transform: [{ scale: ring1Scale }],
              opacity: ring1Opacity,
            },
          ]}
        />

        {/* 3D Animated Emblem */}
        <Animated.View
          style={[
            styles.emblemContainer,
            {
              transform: [
                { perspective: 1000 },
                { scale: logoScale },
                { translateY: logoHover },
                { rotateX: rotateXStr },
                { rotateY: rotateYStr },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#3B82F6', '#1E40AF', '#4F46E5', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emblemGradient}
          >
            <View style={styles.emblemInnerGlow}>
              <AppText style={styles.emblemIcon}>🎓</AppText>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Animated Brand Title & Tagline */}
        <Animated.View
          style={[
            styles.titleWrapper,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <AppText variant="h1" style={styles.brandTitle}>
            PupilScholarr
          </AppText>
          <AppText variant="subtitle" style={styles.brandSubtitle}>
            School Management Ecosystem
          </AppText>
        </Animated.View>

        {/* 3D Role Tags */}
        <Animated.View
          style={[
            styles.rolesRow,
            {
              opacity: rolePillsOpacity,
              transform: [{ scale: rolePillsScale }],
            },
          ]}
        >
          <View style={[styles.roleChip, { borderColor: '#A78BFA' }]}>
            <AppText style={styles.roleChipIcon}>👩‍🏫</AppText>
            <AppText variant="caption" style={{ color: '#DDD6FE', fontWeight: '700' }}>
              Teacher
            </AppText>
          </View>
          <View style={[styles.roleChip, { borderColor: '#34D399' }]}>
            <AppText style={styles.roleChipIcon}>🎒</AppText>
            <AppText variant="caption" style={{ color: '#A7F3D0', fontWeight: '700' }}>
              Student
            </AppText>
          </View>
          <View style={[styles.roleChip, { borderColor: '#FBBF24' }]}>
            <AppText style={styles.roleChipIcon}>👨‍👩‍👧</AppText>
            <AppText variant="caption" style={{ color: '#FDE68A', fontWeight: '700' }}>
              Parent
            </AppText>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Loading Progress Bar */}
      <View style={styles.bottomSection}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>

        <View style={styles.bottomStatusRow}>
          <AppText variant="caption" style={styles.loadingText}>
            Initializing portal security...
          </AppText>

          <Pressable onPress={handleExit} hitSlop={15}>
            <AppText variant="caption" style={styles.skipButton}>
              Skip →
            </AppText>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#070B19',
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    top: height * 0.12,
    left: -40,
    width: 240,
    height: 240,
    backgroundColor: 'rgba(59, 130, 246, 0.22)',
  },
  orb2: {
    top: height * 0.38,
    right: -60,
    width: 280,
    height: 280,
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
  },
  orb3: {
    bottom: -60,
    left: width * 0.2,
    width: 260,
    height: 260,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
  },
  centerStage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pulsingRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: 'rgba(96, 165, 250, 0.6)',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 8,
  },
  emblemContainer: {
    width: 110,
    height: 110,
    borderRadius: 32,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
    marginBottom: SPACING.xl,
  },
  emblemGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emblemInnerGlow: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  emblemIcon: {
    fontSize: 52,
  },
  titleWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1.2,
  },
  roleChipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  bottomSection: {
    width: '100%',
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxl + 10,
    zIndex: 10,
  },
  progressBarTrack: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 2,
  },
  bottomStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  skipButton: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 13,
  },
});

export default SplashScreen;
