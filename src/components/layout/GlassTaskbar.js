import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../typography/AppText';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

/**
 * iOS-Style Glass Taskbar - 5 Clean Adaptive Options
 */
export const GlassTaskbar = ({
  activeTab = 'dashboard',
  onTabChange,
  role = 'teacher',
}) => {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  const roleColor = role && COLORS.roles[role] ? COLORS.roles[role].primary : '#7C3AED';

  // 5 Balanced Tab Items for Teacher / Student / Parent
  const tabs = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: '🏠',
    },
    {
      id: 'schedule',
      label: role === 'teacher' ? 'Timetable' : role === 'student' ? 'Classes' : 'Children',
      icon: '📅',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: '📋',
    },
    {
      id: 'notices',
      label: 'Notifications',
      icon: '🔔',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
    },
  ];

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { bottom: Math.max(insets.bottom, 10) + 4 },
      ]}
    >
      <View
        style={[
          styles.floatingContainer,
          {
            borderColor: colors.taskbar.border,
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.82)',
          },
        ]}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? (isDark ? 75 : 85) : 95}
          tint={colors.taskbar.blurTint}
          style={styles.blurView}
        >
          {/* Glass Tint Layer */}
          <View
            style={[
              styles.glassTintOverlay,
              { backgroundColor: colors.taskbar.overlay },
            ]}
          />

          <View style={styles.tabBarContent}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => onTabChange && onTabChange(tab.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.tabItem,
                    isActive && [
                      styles.activeTabItem,
                      { backgroundColor: colors.taskbar.activeTabBg },
                    ],
                  ]}
                >
                  <AppText style={[styles.tabIcon, isActive && styles.activeTabIcon]}>
                    {tab.icon}
                  </AppText>
                  <AppText
                    variant="caption"
                    style={[
                      styles.tabLabel,
                      { color: isActive ? roleColor : colors.text.secondary },
                      isActive && styles.activeTabLabel,
                    ]}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </AppText>
                  {isActive && (
                    <View style={[styles.activeIndicatorDot, { backgroundColor: roleColor }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 999,
    alignItems: 'center',
  },
  floatingContainer: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1.2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 18,
      },
      android: {
        elevation: 10,
      },
      default: {
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  blurView: {
    width: '100%',
    borderRadius: 26,
    overflow: 'hidden',
  },
  glassTintOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 2,
    borderRadius: 16,
    minHeight: 48,
  },
  activeTabItem: {},
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  activeTabIcon: {
    transform: [{ scale: 1.15 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  activeTabLabel: {
    fontWeight: '800',
  },
  activeIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});

export default GlassTaskbar;
