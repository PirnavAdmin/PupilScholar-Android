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
import { StudentTimetableTab } from './StudentTimetableTab';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { MOCK_STUDENT_DATA, MOCK_ROLE_NOTIFICATIONS } from '../../data/mockSchoolData';
import { SPACING, RADIUS } from '../../constants/spacing';

export const StudentDashboardScreen = () => {
  const { user } = useAuth();
  const { isDark, colors } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_ROLE_NOTIFICATIONS.student);

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
  const { stats, todayTimetable, assignments, recentGrades } = MOCK_STUDENT_DATA;

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'schedule':
        return { title: 'My Timetable', subtitle: 'Daily Schedule & Period Routine' };
      case 'notices':
        return { title: 'Notifications', subtitle: 'School Updates & Announcements' };
      case 'profile':
        return { title: 'Student Profile', subtitle: user?.email || 'Grade 10-A' };
      default:
        return { title: 'Student Portal', subtitle: 'Learning & Progress Hub' };
    }
  };

  const headerInfo = getHeaderInfo();

  const handleAction = (title) => {
    Alert.alert(title, `Opening ${title} for student view.`);
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
            role="student"
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
          <StudentTimetableTab />
        ) : activeTab === 'notices' ? (
          <NoticesTabContent role="student" />
        ) : (
          <View style={styles.container}>
            {/* Student Welcome Glass Banner */}
            <View
              style={[
                styles.profileBanner,
                { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
              ]}
            >
              <View style={styles.profileRow}>
                <Avatar
                  source={user?.avatar}
                  name={user?.name || 'Alex Rivera'}
                  size="lg"
                  role="student"
                  showOnline
                />
                <View style={styles.profileTextCol}>
                  <View style={styles.badgeRow}>
                    <Badge label="Grade 10-A" variant="student" size="sm" />
                    <AppText variant="caption" style={{ color: colors.text.muted }}>
                      Roll #14
                    </AppText>
                  </View>
                  <AppText variant="h2" style={[styles.userName, { color: colors.text.primary }]} numberOfLines={1}>
                    {user?.name || 'Alex Rivera'}
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.text.secondary }}>
                    ID: {user?.studentId || 'STU-2024-8831'} • Term 1
                  </AppText>
                </View>
              </View>
            </View>

            {/* Academic KPIs */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Academic Performance
              </AppText>
              <AppText variant="caption" style={{ color: colors.text.muted }}>
                Term 1 2026-27
              </AppText>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>📅</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#10B981' }]} numberOfLines={1}>
                      {stats.attendance}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Attendance
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    48 of 51 days present
                  </AppText>
                </View>

                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>🎯</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#3B82F6' }]} numberOfLines={1}>
                      {stats.currentGPA}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Cumulative GPA
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    Rank: 4th in Class
                  </AppText>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>⏳</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#F59E0B' }]} numberOfLines={1}>
                      {stats.pendingTasks}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Tasks Due
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    1 urgent due tomorrow
                  </AppText>
                </View>

                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(124, 58, 237, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>🏅</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#8B5CF6' }]} numberOfLines={1}>
                      {stats.creditsEarned}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Honor Credits
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    On track for honors
                  </AppText>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Student Tools
              </AppText>
            </View>

            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleAction('My Schedule')}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: colors.cardBorder }]}>
                  <AppText style={styles.actionEmoji}>🗓️</AppText>
                </View>
                <AppText variant="caption" style={[styles.actionLabel, { color: colors.text.secondary }]}>
                  Timetable
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleAction('Submit Homework')}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: colors.cardBorder }]}>
                  <AppText style={styles.actionEmoji}>📚</AppText>
                </View>
                <AppText variant="caption" style={[styles.actionLabel, { color: colors.text.secondary }]}>
                  Homework
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleAction('Report Card')}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: colors.cardBorder }]}>
                  <AppText style={styles.actionEmoji}>📜</AppText>
                </View>
                <AppText variant="caption" style={[styles.actionLabel, { color: colors.text.secondary }]}>
                  Grades
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleAction('Digital Library')}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(236, 72, 153, 0.15)', borderColor: colors.cardBorder }]}>
                  <AppText style={styles.actionEmoji}>📖</AppText>
                </View>
                <AppText variant="caption" style={[styles.actionLabel, { color: colors.text.secondary }]}>
                  Library
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Today's Timetable */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Today's Classes
              </AppText>
              <TouchableOpacity onPress={() => setActiveTab('schedule')} activeOpacity={0.7}>
                <Badge label="Full Timetable →" variant="student" size="sm" />
              </TouchableOpacity>
            </View>

            <View style={styles.timetableList}>
              {todayTimetable.map((period) => (
                <View
                  key={period.id}
                  style={[
                    styles.glassCard,
                    { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                    period.active && styles.liveCardBorder,
                  ]}
                >
                  <View style={styles.periodRow}>
                    <View style={styles.periodLeft}>
                      <View style={styles.periodTitleRow}>
                        <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
                          {period.subject}
                        </AppText>
                        {period.active && (
                          <Badge label="NOW" variant="success" size="sm" showDot />
                        )}
                      </View>
                      <AppText variant="caption" style={{ color: colors.text.secondary }}>
                        Faculty: {period.teacher}
                      </AppText>
                      <AppText variant="caption" style={{ color: colors.text.muted }}>
                        📍 {period.room}
                      </AppText>
                    </View>
                    <View style={[styles.timeTag, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' }]}>
                      <AppText variant="caption" style={{ color: '#10B981', fontWeight: '700' }}>
                        {period.time}
                      </AppText>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Assignments & Tasks */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Assignments & Tasks
              </AppText>
              <Badge label="3 Pending" variant="student" size="sm" />
            </View>

            <View style={styles.assignmentsList}>
              {assignments.map((item) => {
                const isSubmitted = item.status === 'submitted';
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.glassCard,
                      { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                    ]}
                  >
                    <View style={styles.assignmentRow}>
                      <View style={styles.assignmentInfo}>
                        <AppText variant="bodyBold" style={{ color: colors.text.primary, marginBottom: 2 }}>
                          {item.title}
                        </AppText>
                        <AppText variant="caption" style={{ color: colors.text.secondary }}>
                          Subject: {item.subject}
                        </AppText>
                        <AppText
                          variant="caption"
                          style={{ color: item.urgent ? '#EF4444' : colors.text.muted, marginTop: 2 }}
                        >
                          {item.urgent ? '⚠️ ' : '📅 '} {item.dueDate}
                        </AppText>
                        {item.grade ? (
                          <AppText variant="caption" style={{ color: '#10B981', fontWeight: '700', marginTop: 2 }}>
                            Score: {item.grade}
                          </AppText>
                        ) : null}
                      </View>
                      <Button
                        title={isSubmitted ? 'View' : 'Submit'}
                        size="sm"
                        variant={isSubmitted ? 'outline' : 'primary'}
                        role="student"
                        fullWidth={false}
                        onPress={() => handleAction(`Assignment: ${item.title}`)}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Recent Grades Overview */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Recent Examination Scores
              </AppText>
            </View>

            <View style={[styles.glassCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              {recentGrades.map((g, idx) => (
                <View
                  key={g.id}
                  style={[
                    styles.gradeTableRow,
                    idx < recentGrades.length - 1 && [styles.gradeRowBorder, { borderBottomColor: colors.cardBorder }],
                  ]}
                >
                  <AppText variant="body" style={{ color: colors.text.primary, flex: 1 }}>
                    {g.subject}
                  </AppText>
                  <View style={styles.scorePill}>
                    <AppText variant="bodyBold" style={{ color: '#2563EB' }}>
                      {g.score}
                    </AppText>
                    <Badge
                      label={g.grade}
                      variant={g.grade.startsWith('A') ? 'success' : 'info'}
                      size="sm"
                      style={{ marginLeft: 6 }}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* School Notices Snippet */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                School Notifications
              </AppText>
              <TouchableOpacity onPress={() => setActiveTab('notices')} activeOpacity={0.7}>
                <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '700' }}>
                  See All →
                </AppText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setActiveTab('notices')}
              activeOpacity={0.8}
              style={[
                styles.glassCard,
                { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
              ]}
            >
              <View style={styles.periodRow}>
                <View style={styles.periodLeft}>
                  <Badge label="Official Circular" variant="neutral" size="sm" style={{ alignSelf: 'flex-start', marginBottom: 4 }} />
                  <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
                    Winter Vacation & Examination Schedule
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.text.secondary, marginTop: 2 }}>
                    Standardized final assessments start Dec 8th. Tap to read complete guidelines.
                  </AppText>
                </View>
                <AppText style={{ fontSize: 18, color: '#2563EB' }}>→</AppText>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScreenWrapper>

      {/* Floating iOS Glass Taskbar */}
      <GlassTaskbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        role="student"
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
        role="student"
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
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
    borderLeftColor: '#10B981',
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
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
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    borderWidth: 1,
  },
  actionEmoji: {
    fontSize: 22,
  },
  actionLabel: {
    fontWeight: '600',
    fontSize: 11,
  },
  timetableList: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  glassCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  liveCardBorder: {
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodLeft: {
    flex: 1,
  },
  periodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 2,
  },
  timeTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  assignmentsList: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assignmentInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  gradeTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
  },
  gradeRowBorder: {
    borderBottomWidth: 1,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default StudentDashboardScreen;
