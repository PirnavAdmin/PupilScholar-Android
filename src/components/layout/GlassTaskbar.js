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
 * iOS-Style Glass Finish Taskbar - Adaptive Dark & Light Modes
 */
export const GlassTaskbar = ({
  activeTab = 'dashboard',
  onTabChange,
  role = 'teacher',
}) => {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  const roleColor = role && COLORS.roles[role] ? COLORS.roles[role].primary : '#2563EB';

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    {
      id: 'schedule',
      label: role === 'teacher' ? 'Classes' : role === 'student' ? 'Timetable' : 'Children',
      icon: role === 'teacher' ? '📅' : role === 'student' ? '🗓️' : '👨‍👩‍👧',
    },
    { id: 'notices', label: 'Notices', icon: '🔔' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { bottom: Math.max(insets.bottom, 12) + 4 },
      ]}
    >
      <View
        style={[
          styles.floatingContainer,
          {
            borderColor: colors.taskbar.border,
            backgroundColor: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.7)',
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
                  <AppText style={[styles.tabIcon, isActive && { transform: [{ scale: 1.1 }] }]}>
                    {tab.icon}
                  </AppText>
                  <AppText
                    variant="caption"
                    style={[
                      styles.tabLabel,
                      { color: isActive ? roleColor : colors.text.secondary },
                      isActive && { fontWeight: '800' },
                    ]}
                  >
                    {tab.label}
                  </AppText>
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
    left: 16,
    right: 16,
    zIndex: 999,
    alignItems: 'center',
  },
  floatingContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1.2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
      default: {
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
      },
    }),
  },
  blurView: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
  },
  glassTintOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 20,
  },
  activeTabItem: {},
  tabIcon: {
    fontSize: 18,
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default GlassTaskbar;
