import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../typography/AppText';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useTheme, THEME_MODES } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 330);

export const SidebarDrawer = ({
  visible = false,
  onClose,
  activeTab = 'dashboard',
  onSelectTab,
  onOpenWorkflow,
}) => {
  const insets = useSafeAreaInsets();
  const { user, role, logout } = useAuth();
  const { isDark, colors, themeMode, setThemeMode } = useTheme();

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsRendered(false);
      });
    }
  }, [visible]);

  const handleTabClick = (tabId) => {
    if (onClose) onClose();
    if (onSelectTab && tabId) {
      setTimeout(() => onSelectTab(tabId), 100);
    }
  };

  const handleWorkflowClick = (workflowName) => {
    if (onClose) onClose();
    if (onOpenWorkflow && workflowName) {
      setTimeout(() => onOpenWorkflow(workflowName), 150);
    }
  };

  const handleLogout = () => {
    if (onClose) onClose();
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
    }, 150);
  };

  const roleColor = role && COLORS.roles[role] ? COLORS.roles[role].primary : '#7C3AED';

  const teacherNavItems = [
    { id: 'dashboard', label: 'Home Dashboard', icon: '🏠', type: 'tab' },
    { id: 'attendance', label: 'Student Attendance', icon: '📋', type: 'workflow' },
    { id: 'schedule', label: 'Class Timetable', icon: '📅', type: 'tab' },
    { id: 'marks', label: 'Marks Entry', icon: '📊', type: 'workflow' },
    { id: 'students', label: 'Assigned Students', icon: '👥', type: 'workflow' },
    { id: 'homework', label: 'Homework & Tasks', icon: '✏️', type: 'workflow' },
    { id: 'chat', label: 'Parent Messages', icon: '💬', type: 'workflow' },
    { id: 'notices', label: 'Notifications', icon: '🔔', type: 'tab' },
    { id: 'profile', label: 'Faculty Account', icon: '👤', type: 'tab' },
  ];

  if (!isRendered && !visible) {
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
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(15, 23, 42, 0.45)',
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
            <View style={[styles.brandIconBox, { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.2)' : '#F5F3FF' }]}>
              <AppText style={styles.brandEmoji}>🎓</AppText>
            </View>
            <View>
              <AppText variant="h3" style={[styles.brandTitle, { color: colors.text.primary }]}>
                PupilScholar
              </AppText>
              <AppText variant="caption" style={{ color: colors.text.muted, fontSize: 11 }}>
                Teacher SIS Console
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
          onPress={() => handleTabClick('profile')}
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
            name={user?.name || 'Faculty Member'}
            size="md"
            role="teacher"
            showOnline
          />
          <View style={styles.userCardInfo}>
            <View style={styles.userBadgeRow}>
              <Badge label="FACULTY" variant="teacher" size="sm" />
              <AppText variant="caption" style={{ color: colors.text.muted, fontSize: 11 }}>
                {user?.employeeId || 'EMP-104'}
              </AppText>
            </View>
            <AppText variant="bodyBold" style={[styles.userName, { color: colors.text.primary }]} numberOfLines={1}>
              {user?.name || 'Faculty Member'}
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary, fontSize: 11 }} numberOfLines={1}>
              {user?.email || 'teacher@school.com'}
            </AppText>
          </View>
        </TouchableOpacity>

        {/* Navigation Menu List */}
        <ScrollView
          style={styles.menuContainer}
          contentContainerStyle={styles.menuContent}
          showsVerticalScrollIndicator={false}
        >
          <AppText variant="caption" style={[styles.menuHeaderLabel, { color: colors.text.muted }]}>
            ACADEMIC MODULES
          </AppText>

          {teacherNavItems.map((item) => {
            const isActive = item.type === 'tab' && activeTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  if (item.type === 'tab') {
                    handleTabClick(item.id);
                  } else {
                    handleWorkflowClick(item.id);
                  }
                }}
                activeOpacity={0.7}
                style={[
                  styles.menuItem,
                  isActive && [
                    styles.menuItemActive,
                    {
                      backgroundColor: isDark ? 'rgba(124, 58, 237, 0.15)' : '#F5F3FF',
                      borderColor: '#7C3AED',
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
                {item.type === 'workflow' && (
                  <AppText style={{ fontSize: 12, color: colors.text.muted }}>→</AppText>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Footer: Quick Theme Mode Switcher + Log Out */}
        <View
          style={[
            styles.footerSection,
            { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
          ]}
        >
          <View style={styles.themeToggleRow}>
            <AppText variant="caption" style={{ color: colors.text.muted, fontSize: 11, fontWeight: '700' }}>
              APPEARANCE:
            </AppText>
            <View style={styles.themeButtons}>
              <TouchableOpacity
                onPress={() => setThemeMode(THEME_MODES.DARK)}
                style={[
                  styles.themeMiniBtn,
                  themeMode === THEME_MODES.DARK && { backgroundColor: '#7C3AED' },
                ]}
              >
                <AppText style={styles.themeMiniIcon}>🌙</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setThemeMode(THEME_MODES.LIGHT)}
                style={[
                  styles.themeMiniBtn,
                  themeMode === THEME_MODES.LIGHT && { backgroundColor: '#7C3AED' },
                ]}
              >
                <AppText style={styles.themeMiniIcon}>☀️</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setThemeMode(THEME_MODES.SYSTEM)}
                style={[
                  styles.themeMiniBtn,
                  themeMode === THEME_MODES.SYSTEM && { backgroundColor: '#7C3AED' },
                ]}
              >
                <AppText style={styles.themeMiniIcon}>📱</AppText>
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
    marginBottom: SPACING.md,
    gap: 10,
  },
  userCardInfo: {
    flex: 1,
  },
  userBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
  },
  menuContainer: {
    flex: 1,
  },
  menuContent: {
    paddingBottom: 16,
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
