import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../typography/AppText';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useTheme, THEME_MODES } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 320);

export const SidebarDrawer = ({
  visible = false,
  onClose,
  activeTab = 'dashboard',
  onSelectTab,
}) => {
  const insets = useSafeAreaInsets();
  const { user, role, logout } = useAuth();
  const { isDark, colors, themeMode, setThemeMode } = useTheme();

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleMenuClick = (tabId) => {
    onClose && onClose();
    if (onSelectTab && tabId) {
      setTimeout(() => onSelectTab(tabId), 150);
    }
  };

  const handleInfoAction = (title, message) => {
    onClose && onClose();
    setTimeout(() => {
      Alert.alert(title, message);
    }, 200);
  };

  const handleLogout = () => {
    onClose && onClose();
    setTimeout(() => {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out of PupilScholar?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: () => logout(),
          },
        ]
      );
    }, 200);
  };

  const roleColor = role && COLORS.roles[role] ? COLORS.roles[role].primary : '#2563EB';

  const menuItems = [
    { id: 'dashboard', label: 'Home Dashboard', icon: '🏠', isTab: true },
    {
      id: 'schedule',
      label: role === 'teacher' ? 'Class Schedule' : role === 'student' ? 'My Timetable' : 'Children Profiles',
      icon: role === 'teacher' ? '📅' : role === 'student' ? '🗓️' : '👨‍👩‍👧',
      isTab: true,
    },
    { id: 'notices', label: 'School Notices', icon: '🔔', isTab: true },
    { id: 'profile', label: 'Account & Settings', icon: '👤', isTab: true },
    {
      id: 'messages',
      label: 'Campus Messages',
      icon: '💬',
      badge: '2 New',
      onPress: () => handleInfoAction('Campus Messages', 'Direct messages with faculty and administration are synced.'),
    },
    {
      id: 'library',
      label: 'Digital Library',
      icon: '📚',
      onPress: () => handleInfoAction('Digital Library', 'Accessing 12,000+ textbooks, journals, and exam archives.'),
    },
    {
      id: 'support',
      label: 'Help & Helpdesk',
      icon: '❓',
      onPress: () => handleInfoAction('Help & Support', 'PupilScholar 24/7 IT Helpdesk: support@pupilscholar.edu'),
    },
  ];

  if (!visible && slideAnim._value === -SIDEBAR_WIDTH) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Semi-transparent Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(15, 23, 42, 0.45)',
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Sliding Sidebar Container */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: SIDEBAR_WIDTH,
            transform: [{ translateX: slideAnim }],
            backgroundColor: isDark ? '#0D1326' : '#FFFFFF',
            borderRightColor: colors.cardBorder,
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        {/* Drawer Header: Brand + Close button */}
        <View style={styles.drawerHeader}>
          <View style={styles.brandRow}>
            <View style={[styles.brandIconBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF' }]}>
              <AppText style={styles.brandEmoji}>🎓</AppText>
            </View>
            <View>
              <AppText variant="h3" style={[styles.brandTitle, { color: colors.text.primary }]}>
                PupilScholar
              </AppText>
              <AppText variant="caption" style={{ color: colors.text.muted, fontSize: 11 }}>
                Unified School Portal
              </AppText>
            </View>
          </View>

          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' }]}
            activeOpacity={0.7}
          >
            <AppText style={[styles.closeIcon, { color: colors.text.secondary }]}>✕</AppText>
          </TouchableOpacity>
        </View>

        {/* User Profile Mini Banner */}
        <TouchableOpacity
          onPress={() => handleMenuClick('profile')}
          activeOpacity={0.8}
          style={[
            styles.userCard,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Avatar
            source={user?.avatar}
            name={user?.name || 'User'}
            size="md"
            role={role}
            showOnline
          />
          <View style={styles.userCardInfo}>
            <View style={styles.userBadgeRow}>
              <Badge label={(role || 'Member').toUpperCase()} variant={role || 'neutral'} size="sm" />
            </View>
            <AppText variant="bodyBold" style={[styles.userName, { color: colors.text.primary }]} numberOfLines={1}>
              {user?.name || 'User Profile'}
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary, fontSize: 11 }} numberOfLines={1}>
              {user?.email || 'user@school.com'}
            </AppText>
          </View>
        </TouchableOpacity>

        {/* Navigation Menu List */}
        <View style={styles.menuContainer}>
          <AppText variant="caption" style={[styles.menuHeaderLabel, { color: colors.text.muted }]}>
            MAIN NAVIGATION
          </AppText>

          {menuItems.map((item) => {
            const isActive = item.isTab && activeTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => (item.isTab ? handleMenuClick(item.id) : item.onPress && item.onPress())}
                activeOpacity={0.7}
                style={[
                  styles.menuItem,
                  isActive && [
                    styles.menuItemActive,
                    {
                      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                      borderColor: '#3B82F6',
                    },
                  ],
                ]}
              >
                <AppText style={[styles.menuIcon, isActive && { transform: [{ scale: 1.1 }] }]}>
                  {item.icon}
                </AppText>
                <AppText
                  variant="body"
                  style={[
                    styles.menuLabel,
                    {
                      color: isActive ? roleColor : colors.text.primary,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {item.label}
                </AppText>

                {item.badge ? (
                  <View style={styles.itemBadgePill}>
                    <AppText style={styles.itemBadgeText}>{item.badge}</AppText>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer: Quick Theme Mode Switcher + Log Out */}
        <View
          style={[
            styles.footerSection,
            { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
          ]}
        >
          <View style={styles.themeToggleRow}>
            <AppText variant="caption" style={{ color: colors.text.muted, fontSize: 11, fontWeight: '600' }}>
              THEME:
            </AppText>
            <View style={styles.themeButtons}>
              <TouchableOpacity
                onPress={() => setThemeMode(THEME_MODES.DARK)}
                style={[
                  styles.themeMiniBtn,
                  themeMode === THEME_MODES.DARK && { backgroundColor: '#3B82F6' },
                ]}
              >
                <AppText style={styles.themeMiniIcon}>🌙</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setThemeMode(THEME_MODES.LIGHT)}
                style={[
                  styles.themeMiniBtn,
                  themeMode === THEME_MODES.LIGHT && { backgroundColor: '#3B82F6' },
                ]}
              >
                <AppText style={styles.themeMiniIcon}>☀️</AppText>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            style={[styles.sidebarLogoutBtn, { borderColor: 'rgba(239, 68, 68, 0.4)' }]}
          >
            <AppText style={styles.logoutIcon}>🚪</AppText>
            <AppText variant="bodyBold" style={styles.logoutText}>
              Sign Out
            </AppText>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 9999,
    borderRightWidth: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 10, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 25,
      },
      android: {
        elevation: 20,
      },
      default: {
        boxShadow: '10px 0 30px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandEmoji: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: '700',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    gap: 10,
  },
  userCardInfo: {
    flex: 1,
  },
  userBadgeRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
  },
  menuContainer: {
    flex: 1,
  },
  menuHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  menuItemActive: {
    borderWidth: 1,
  },
  menuIcon: {
    fontSize: 17,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    flex: 1,
  },
  itemBadgePill: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemBadgeText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
  },
  footerSection: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  themeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  themeMiniBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeMiniIcon: {
    fontSize: 14,
  },
  sidebarLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    gap: 6,
  },
  logoutIcon: {
    fontSize: 15,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 13,
  },
});

export default SidebarDrawer;
