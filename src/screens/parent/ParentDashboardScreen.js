import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ScreenWrapper,
  Header,
  AppText,
  Button,
  Badge,
  Avatar,
  GlassTaskbar,
  NoticesTabContent,
  SidebarDrawer,
  NotificationsModal,
} from '../../components';
import { ProfileScreen } from '../shared/ProfileScreen';
import { ParentChildrenTab } from './ParentChildrenTab';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { MOCK_PARENT_DATA, MOCK_ROLE_NOTIFICATIONS } from '../../data/mockSchoolData';
import { SPACING, RADIUS } from '../../constants/spacing';

export const ParentDashboardScreen = () => {
  const { user } = useAuth();
  const { isDark, colors } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedChildId, setSelectedChildId] = useState('child_01');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_ROLE_NOTIFICATIONS.parent);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggleNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearReadNotifications = () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
  };

  const childrenList = user?.children || [
    {
      id: 'child_01',
      name: 'Alex Rivera',
      grade: 'Grade 10 - Section A',
      initials: 'AR',
    },
    {
      id: 'child_02',
      name: 'Emma Rivera',
      grade: 'Grade 6 - Section B',
      initials: 'ER',
    },
  ];

  const currentChild =
    MOCK_PARENT_DATA.childrenDetails[selectedChildId] ||
    MOCK_PARENT_DATA.childrenDetails.child_01;

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'schedule':
        return { title: 'Children & Wards', subtitle: 'Academic Profiles & Student Welfare' };
      case 'notices':
        return { title: 'Notifications', subtitle: 'Circulars & Parent Updates' };
      case 'profile':
        return { title: 'Guardian Profile', subtitle: user?.email || 'David Rivera' };
      default:
        return { title: 'Parent Portal', subtitle: 'Family & Student Welfare' };
    }
  };

  const headerInfo = getHeaderInfo();

  const handleAction = (title) => {
    Alert.alert(title, `Opening ${title} for parent portal.`);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Background Gradient */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={colors.gradientColors}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        {isDark && (
          <>
            <View style={styles.glowTop} />
            <View style={styles.glowBottom} />
          </>
        )}
      </View>

      <ScreenWrapper
        scrollable={activeTab !== 'profile'}
        backgroundColor="transparent"
        statusBarStyle={colors.statusBarStyle}
        contentContainerStyle={styles.scrollContent}
        header={
          <Header
            title={headerInfo.title}
            subtitle={headerInfo.subtitle}
            role="parent"
            user={user}
            onProfilePress={() => setActiveTab('profile')}
            showBack={activeTab !== 'dashboard'}
            onBack={() => setActiveTab('dashboard')}
            showMenu={activeTab === 'dashboard'}
            onMenuPress={() => setIsSidebarOpen(true)}
            onNotificationPress={() => setIsNotificationsOpen(true)}
            unreadNotificationsCount={unreadCount}
          />
        }
      >
        {activeTab === 'profile' ? (
          <ProfileScreen onBack={() => setActiveTab('dashboard')} />
        ) : activeTab === 'schedule' ? (
          <ParentChildrenTab
            selectedChildId={selectedChildId}
            onSelectChild={setSelectedChildId}
          />
        ) : activeTab === 'notices' ? (
          <NoticesTabContent role="parent" />
        ) : (
          <View style={styles.container}>
            {/* Parent Welcome Glass Banner */}
            <View
              style={[
                styles.profileBanner,
                { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
              ]}
            >
              <View style={styles.profileRow}>
                <Avatar
                  source={user?.avatar}
                  name={user?.name || 'David Rivera'}
                  size="lg"
                  role="parent"
                  showOnline
                />
                <View style={styles.profileTextCol}>
                  <View style={styles.badgeRow}>
                    <Badge label="Guardian" variant="parent" size="sm" />
                    <AppText variant="caption" style={{ color: colors.text.muted }}>
                      2 Children Enrolled
                    </AppText>
                  </View>
                  <AppText variant="h2" style={[styles.userName, { color: colors.text.primary }]} numberOfLines={1}>
                    {user?.name || 'David Rivera'}
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.text.secondary }}>
                    Verified Parent Account • Session Secure
                  </AppText>
                </View>
              </View>
            </View>

            {/* Child Selector Tabs */}
            <View style={styles.childSelectorSection}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <AppText variant="caption" style={[styles.selectLabel, { color: colors.text.muted, marginBottom: 0 }]}>
                  SELECT STUDENT:
                </AppText>
                <TouchableOpacity onPress={() => setActiveTab('schedule')} activeOpacity={0.7}>
                  <AppText variant="caption" style={{ color: '#059669', fontWeight: '700' }}>
                    Full Profile & Wards →
                  </AppText>
                </TouchableOpacity>
              </View>
              <View style={styles.childTabsRow}>
                {childrenList.map((child) => {
                  const isSelected = selectedChildId === child.id;
                  return (
                    <TouchableOpacity
                      key={child.id}
                      onPress={() => setSelectedChildId(child.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.childTabBtn,
                        { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                        isSelected && styles.childTabBtnActive,
                      ]}
                    >
                      <Avatar
                        source={child.avatar}
                        name={child.name}
                        size="sm"
                        role={isSelected ? 'parent' : null}
                      />
                      <View style={styles.childTabInfo}>
                        <AppText
                          variant="bodyBold"
                          style={[
                            styles.childName,
                            { color: isSelected ? '#F59E0B' : colors.text.primary },
                          ]}
                          numberOfLines={1}
                        >
                          {child.name}
                        </AppText>
                        <AppText variant="caption" style={{ color: colors.text.secondary }}>
                          {child.grade}
                        </AppText>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Live Safety & Attendance Status Card */}
            <View style={[styles.statusLiveCard, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4' }]}>
              <View style={styles.liveHeader}>
                <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
                  Live Campus Status — {currentChild.name}
                </AppText>
                <Badge label="IN SCHOOL" variant="success" size="sm" showDot />
              </View>

              <View style={styles.liveDetailsRow}>
                <View style={styles.liveItem}>
                  <AppText style={styles.liveIcon}>🏫</AppText>
                  <View>
                    <AppText variant="caption" style={{ color: colors.text.muted }}>
                      Morning Arrival
                    </AppText>
                    <AppText variant="bodyBold" style={{ color: '#10B981' }}>
                      {currentChild.attendance.today}
                    </AppText>
                  </View>
                </View>

                <View style={[styles.liveDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#BBF7D0' }]} />

                <View style={styles.liveItem}>
                  <AppText style={styles.liveIcon}>🚌</AppText>
                  <View>
                    <AppText variant="caption" style={{ color: colors.text.muted }}>
                      Bus Transit
                    </AppText>
                    <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
                      {currentChild.attendance.busStatus}
                    </AppText>
                  </View>
                </View>
              </View>
            </View>

            {/* Child Summary Stats Grid */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Academic & Fee Summary
              </AppText>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>📊</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#F59E0B' }]} numberOfLines={1}>
                      {currentChild.attendance.percentage}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Attendance Rate
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    Above 90% benchmark
                  </AppText>
                </View>

                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>🏆</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#3B82F6' }]} numberOfLines={1}>
                      {currentChild.academicProgress.rank.replace(' in Class', '')}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Class Rank
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    {currentChild.academicProgress.overallGrade}
                  </AppText>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>💳</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#10B981' }]} numberOfLines={1}>
                      {currentChild.feeStatus.amountDue}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Fee Balance
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    {currentChild.feeStatus.status}
                  </AppText>
                </View>

                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(124, 58, 237, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>🤝</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#8B5CF6' }]} numberOfLines={1}>
                      Dec 05
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Parent Meeting
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    Bookings Open
                  </AppText>
                </View>
              </View>
            </View>

            {/* Teacher's Feedback */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Teacher's Observation
              </AppText>
              <Badge label={currentChild.recentTeacherNote.date} variant="neutral" size="sm" />
            </View>

            <View style={[styles.glassCard, styles.noteCardBorder, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.teacherNoteHeader}>
                <AppText style={styles.teacherNoteIcon}>💬</AppText>
                <View style={styles.teacherNoteTitleCol}>
                  <AppText variant="bodyBold" style={{ color: colors.text.primary, marginBottom: 2 }}>
                    {currentChild.recentTeacherNote.teacher}
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.text.secondary }}>
                    {currentChild.recentTeacherNote.message}
                  </AppText>
                </View>
              </View>
            </View>

            {/* Tuition Fees Card */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Tuition & Fees
              </AppText>
            </View>

            <View style={[styles.glassCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.feeRow}>
                <View style={styles.feeInfoCol}>
                  <AppText variant="bodyBold" style={{ color: colors.text.primary, marginBottom: 2 }}>
                    {currentChild.name} • Term 2 Tuition
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.text.secondary }}>
                    Status:{' '}
                    <AppText
                      variant="caption"
                      style={{
                        color: currentChild.feeStatus.status === 'Paid' ? '#10B981' : '#F59E0B',
                        fontWeight: '700',
                      }}
                    >
                      {currentChild.feeStatus.status} ({currentChild.feeStatus.amountDue})
                    </AppText>
                  </AppText>
                  {currentChild.feeStatus.dueDate && (
                    <AppText variant="caption" style={{ color: '#EF4444', marginTop: 2 }}>
                      Deadline: {currentChild.feeStatus.dueDate}
                    </AppText>
                  )}
                </View>
                <Button
                  title={currentChild.feeStatus.status === 'Paid' ? 'Receipt' : 'Pay Now'}
                  size="sm"
                  variant={currentChild.feeStatus.status === 'Paid' ? 'outline' : 'primary'}
                  role="parent"
                  fullWidth={false}
                  onPress={() => handleAction(`Fee Action for ${currentChild.name}`)}
                />
              </View>
            </View>

            {/* School Circulars */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Official School Circulars
              </AppText>
              <TouchableOpacity onPress={() => setActiveTab('notices')} activeOpacity={0.7}>
                <AppText variant="caption" style={{ color: '#059669', fontWeight: '700' }}>
                  See All Notifications →
                </AppText>
              </TouchableOpacity>
            </View>

            {MOCK_PARENT_DATA.schoolNotices.map((notice) => (
              <View
                key={notice.id}
                style={[
                  styles.glassCard,
                  { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                ]}
              >
                <View style={styles.noticeHeader}>
                  <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
                    {notice.title}
                  </AppText>
                  <Badge label={notice.date} variant="parent" size="sm" />
                </View>
                <AppText variant="caption" style={{ color: colors.text.secondary }}>
                  {notice.snippet}
                </AppText>
              </View>
            ))}
          </View>
        )}
      </ScreenWrapper>

      {/* Floating iOS Glass Taskbar */}
      <GlassTaskbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        role="parent"
      />

      {/* Interactive Sidebar Drawer */}
      <SidebarDrawer
        visible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Notifications Modal Sheet */}
      <NotificationsModal
        visible={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onToggleRead={handleToggleNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearRead={handleClearReadNotifications}
        role="parent"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  glowTop: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -50,
    left: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  container: {
    padding: SPACING.lg,
  },
  profileBanner: {
    borderRadius: 22,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileTextCol: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  userName: {
    fontWeight: '800',
    fontSize: 20,
  },
  childSelectorSection: {
    marginBottom: SPACING.lg,
  },
  selectLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  childTabsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  childTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    borderWidth: 1.2,
  },
  childTabBtnActive: {
    borderColor: '#F59E0B',
  },
  childTabInfo: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  childName: {},
  statusLiveCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  liveDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  liveIcon: {
    fontSize: 22,
    marginRight: SPACING.sm,
  },
  liveDivider: {
    width: 1,
    height: 36,
    marginHorizontal: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontWeight: '800',
    fontSize: 17,
  },
  statsGrid: {
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  glassStatCard: {
    flex: 1,
    minHeight: 114,
    borderRadius: 18,
    borderWidth: 1,
    padding: 13,
    justifyContent: 'space-between',
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  statEmoji: {
    fontSize: 17,
  },
  statNumber: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    flexShrink: 1,
    textAlign: 'right',
  },
  statLabel: {
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 18,
  },
  statSubtext: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  glassCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  noteCardBorder: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  teacherNoteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  teacherNoteIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  teacherNoteTitleCol: {
    flex: 1,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeInfoCol: {
    flex: 1,
    marginRight: SPACING.md,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});

export default ParentDashboardScreen;
