import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
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
  StudentAttendanceModal,
  HomeworkModal,
  MarksEntryModal,
  ParentCommunicationModal,
} from '../../components';
import { ProfileScreen } from '../shared/ProfileScreen';
import { TeacherClassesTab } from './TeacherClassesTab';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  getTeacherDashboard,
  getTeacherAttendanceToday,
  teacherCheckIn,
  teacherCheckOut,
  getTeacherTimetable,
  getUpcomingExamsList,
  getTeacherAssignments,
} from '../../api/teacherApi';
import { MOCK_ROLE_NOTIFICATIONS } from '../../data/mockSchoolData';
import { SPACING, RADIUS } from '../../constants/spacing';

export const TeacherDashboardScreen = () => {
  const { user } = useAuth();
  const { isDark, colors } = useTheme();

  // 5 Active Tabs: 'dashboard' | 'schedule' | 'attendance' | 'notices' | 'profile'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_ROLE_NOTIFICATIONS.teacher);

  // Workflow Modals
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedExamForMarks, setSelectedExamForMarks] = useState('');

  // 100% Dynamic Dashboard States (No hardcoded 142 / 4 / 94.2%)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    todayClassesCount: 0,
    totalStudents: 0,
    attendanceMarkedToday: false,
    upcomingExamsCount: 0,
    unreadAnnouncements: 0,
    avgAttendance: '--',
  });

  const [selfAttendance, setSelfAttendance] = useState({
    isCheckedIn: false,
    isCheckedOut: false,
    inTime: null,
    outTime: null,
    status: 'NOT_CHECKED_IN',
  });
  const [isPunching, setIsPunching] = useState(false);

  const [todayClasses, setTodayClasses] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);

  // Fetch all teacher dashboard data dynamically
  const loadDashboardData = useCallback(async () => {
    try {
      const [dashRes, attRes, timeRes, examRes, assignRes] = await Promise.all([
        getTeacherDashboard(),
        getTeacherAttendanceToday(),
        getTeacherTimetable(user?.staffId || user?.userId || user?.id || 5, '', user),
        getUpcomingExamsList(),
        getTeacherAssignments('2026-2027'),
      ]);

      let finalClassesToday = 0;
      let finalTotalStudents = 0;
      let finalAttendance = '--';

      // 1. Dynamic Classes Today
      if (dashRes?.data?.todayClassesCount !== null && dashRes?.data?.todayClassesCount !== undefined) {
        finalClassesToday = dashRes.data.todayClassesCount;
      } else if (timeRes?.data && Array.isArray(timeRes.data)) {
        finalClassesToday = timeRes.data.length;
      }

      // 2. Dynamic Total Students
      if (dashRes?.data?.totalStudents !== null && dashRes?.data?.totalStudents !== undefined) {
        finalTotalStudents = dashRes.data.totalStudents;
      } else if (timeRes?.data && Array.isArray(timeRes.data)) {
        const sumStudents = timeRes.data.reduce((acc, curr) => acc + (Number(curr.students) || 0), 0);
        finalTotalStudents = sumStudents;
      }

      // 3. Dynamic Attendance Status
      if (dashRes?.data?.avgAttendance) {
        finalAttendance = dashRes.data.avgAttendance;
      } else if (attRes?.data?.isCheckedOut) {
        finalAttendance = 'Completed';
      } else if (attRes?.data?.isCheckedIn) {
        finalAttendance = 'Present';
      } else {
        finalAttendance = 'Not Marked';
      }

      setDashboardStats({
        todayClassesCount: finalClassesToday,
        totalStudents: finalTotalStudents,
        attendanceMarkedToday: Boolean(dashRes?.data?.attendanceMarkedToday || attRes?.data?.isCheckedIn || attRes?.data?.isCheckedOut),
        upcomingExamsCount: examRes?.data?.length || dashRes?.data?.upcomingExamsCount || 0,
        unreadAnnouncements: dashRes?.data?.unreadAnnouncements || 0,
        avgAttendance: finalAttendance,
      });

      if (attRes?.data) {
        setSelfAttendance(attRes.data);
      }

      if (timeRes?.data) {
        const list = Array.isArray(timeRes.data) ? timeRes.data.slice(0, 4) : [];
        setTodayClasses(list);
      }

      if (examRes?.data) {
        const exams = Array.isArray(examRes.data) ? examRes.data : [];
        setUpcomingExams(exams);
      }
    } catch {
      // Handled silently
    }
  }, [user?.staffId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  }, [loadDashboardData]);

  // Self-Attendance Punch In / Out Handler
  const handleToggleSelfAttendance = useCallback(async () => {
    if (selfAttendance.isCheckedOut || selfAttendance.status === 'CHECKED_OUT') {
      Alert.alert(
        'Shift Completed',
        `Attendance for today has already been finalized (In: ${selfAttendance.inTime} • Out: ${selfAttendance.outTime}). No further punches needed.`
      );
      return;
    }

    setIsPunching(true);
    try {
      if (!selfAttendance.isCheckedIn) {
        const res = await teacherCheckIn('Mobile App Check-in');
        if (res?.data) {
          setSelfAttendance(res.data);
          Alert.alert('Checked In', `Attendance recorded at ${res.data.inTime || 'now'}. Have a productive day!`);
        }
      } else {
        const res = await teacherCheckOut('Mobile App Check-out');
        if (res?.data) {
          setSelfAttendance(res.data);
          Alert.alert('Checked Out', `Shift finalized for today at ${res.data.outTime || 'now'}. Great job!`);
        }
      }
    } catch {
      Alert.alert('Attendance', 'Punch request failed. Please check network connection.');
    } finally {
      setIsPunching(false);
    }
  }, [selfAttendance]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const handleToggleNotificationRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  }, []);

  const handleMarkAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleClearReadNotifications = useCallback(() => {
    setNotifications((prev) => prev.filter((n) => !n.read));
  }, []);

  const handleOpenMarksForExam = useCallback((examTitle) => {
    setSelectedExamForMarks(examTitle || '');
    setIsMarksModalOpen(true);
  }, []);

  // Header configuration based on 5 tabs
  const headerInfo = useMemo(() => {
    switch (activeTab) {
      case 'schedule':
        return { title: 'Class Timetable', subtitle: 'Dynamic Weekly & Daily Schedule' };
      case 'attendance':
        return { title: 'Student Attendance', subtitle: 'Live Student SIS Attendance' };
      case 'notices':
        return { title: 'Notifications', subtitle: 'School Bulletins & Updates' };
      case 'profile':
        return { title: 'Faculty Profile', subtitle: user?.email || 'Faculty Account' };
      default:
        return {
          title: user?.name || user?.fullName || 'Faculty Member',
          subtitle: user?.designation || (user?.branch ? `Faculty • ${user.branch}` : 'Senior Faculty'),
        };
    }
  }, [activeTab, user?.name, user?.fullName, user?.designation, user?.branch, user?.email]);

  // Sidebar workflow routing
  const handleSidebarWorkflow = useCallback((workflowName) => {
    switch (workflowName) {
      case 'attendance':
      case 'students':
        setIsAttendanceModalOpen(true);
        break;
      case 'marks':
        setIsMarksModalOpen(true);
        break;
      case 'homework':
        setIsHomeworkModalOpen(true);
        break;
      case 'chat':
        setIsChatModalOpen(true);
        break;
      default:
        break;
    }
  }, []);

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
        scrollable={activeTab !== 'profile' && activeTab !== 'attendance'}
        backgroundColor="transparent"
        statusBarStyle={colors.statusBarStyle}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          activeTab === 'dashboard' ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#7C3AED"
              colors={['#7C3AED']}
            />
          ) : undefined
        }
        header={
          <Header
            title={headerInfo.title}
            subtitle={headerInfo.subtitle}
            role="teacher"
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
          <TeacherClassesTab onOpenRollCall={() => setIsAttendanceModalOpen(true)} />
        ) : activeTab === 'attendance' ? (
          /* Tab 3: Dedicated Student Attendance View */
          <View style={{ flex: 1, paddingBottom: 110 }}>
            <TeacherClassesTab onOpenRollCall={() => setIsAttendanceModalOpen(true)} />
          </View>
        ) : activeTab === 'notices' ? (
          <NoticesTabContent role="teacher" />
        ) : (
          /* Tab 1: Home Dashboard */
          <View style={styles.container}>
            {/* Dedicated Check-In / Check-Out Container */}
            <View
              style={[
                styles.checkInOutContainer,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View style={styles.checkInOutTopRow}>
                <View
                  style={[
                    styles.checkInOutIconBox,
                    {
                      backgroundColor: selfAttendance.isCheckedOut
                        ? 'rgba(59, 130, 246, 0.15)'
                        : selfAttendance.isCheckedIn
                        ? 'rgba(16, 185, 129, 0.15)'
                        : isDark
                        ? 'rgba(124, 58, 237, 0.18)'
                        : '#F5F3FF',
                      borderColor: selfAttendance.isCheckedOut
                        ? '#3B82F6'
                        : selfAttendance.isCheckedIn
                        ? '#10B981'
                        : isDark
                        ? 'rgba(124, 58, 237, 0.4)'
                        : '#DDD6FE',
                    },
                  ]}
                >
                  <AppText style={{ fontSize: 22 }}>
                    {selfAttendance.isCheckedOut ? '🏁' : selfAttendance.isCheckedIn ? '⏱️' : '📍'}
                  </AppText>
                </View>

                <View style={styles.checkInOutInfoCol}>
                  <View style={styles.checkInOutStatusHeader}>
                    <View
                      style={[
                        styles.punchStatusDot,
                        {
                          backgroundColor: selfAttendance.isCheckedOut
                            ? '#3B82F6'
                            : selfAttendance.isCheckedIn
                            ? '#10B981'
                            : '#F59E0B',
                        },
                      ]}
                    />
                    <AppText variant="bodyBold" style={{ color: colors.text.primary, fontSize: 16 }}>
                      {selfAttendance.isCheckedOut
                        ? 'Shift Completed Today'
                        : selfAttendance.isCheckedIn
                        ? 'Checked In (Active)'
                        : 'Attendance Check-In'}
                    </AppText>
                    <Badge
                      label={
                        selfAttendance.isCheckedOut
                          ? 'COMPLETED'
                          : selfAttendance.isCheckedIn
                          ? 'CHECKED IN'
                          : 'NOT CHECKED IN'
                      }
                      variant={
                        selfAttendance.isCheckedOut
                          ? 'neutral'
                          : selfAttendance.isCheckedIn
                          ? 'success'
                          : 'warning'
                      }
                      size="sm"
                    />
                  </View>

                  <AppText variant="caption" style={{ color: colors.text.secondary, marginTop: 4 }}>
                    {selfAttendance.isCheckedOut
                      ? `In: ${selfAttendance.inTime || '08:15 AM'} • Out: ${selfAttendance.outTime || '04:30 PM'}`
                      : selfAttendance.isCheckedIn
                      ? `Clocked in at ${selfAttendance.inTime || '08:15 AM'} • Ready to punch out`
                      : 'Faculty Biometric & Mobile Attendance Punch'}
                  </AppText>
                </View>
              </View>

              {/* Action Button Row */}
              <View style={styles.checkInOutActionRow}>
                {selfAttendance.isCheckedOut ? (
                  <View
                    style={[
                      styles.checkInOutDoneBadge,
                      {
                        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#EFF6FF',
                        borderColor: isDark ? 'rgba(59, 130, 246, 0.4)' : '#BFDBFE',
                      },
                    ]}
                  >
                    <AppText style={styles.checkInOutDoneText}>
                      ✓ Daily Attendance Logged (In: {selfAttendance.inTime} • Out: {selfAttendance.outTime})
                    </AppText>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleToggleSelfAttendance}
                    disabled={isPunching}
                    activeOpacity={0.8}
                    style={[
                      styles.checkInOutBtn,
                      {
                        backgroundColor: selfAttendance.isCheckedIn ? '#EF4444' : '#7C3AED',
                        borderColor: selfAttendance.isCheckedIn ? '#EF4444' : '#7C3AED',
                      },
                    ]}
                  >
                    {isPunching ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <AppText style={styles.checkInOutBtnEmoji}>
                          {selfAttendance.isCheckedIn ? '🚪' : '⚡'}
                        </AppText>
                        <AppText style={styles.checkInOutBtnText}>
                          {selfAttendance.isCheckedIn ? 'Check Out (Punch Out)' : 'Check In (Punch In)'}
                        </AppText>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Key Metrics / KPI Grid */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Today's Overview
              </AppText>
              <AppText variant="caption" style={{ color: colors.text.muted }}>
                Dynamic SIS Analytics
              </AppText>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                {/* Metric 1: Total Students (Dynamic) */}
                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(124, 58, 237, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>👥</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#8B5CF6' }]} numberOfLines={1}>
                      {dashboardStats.totalStudents}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Total Students
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    Enrolled across classes
                  </AppText>
                </View>

                {/* Metric 2: Classes Today (Dynamic) */}
                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>📅</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#3B82F6' }]} numberOfLines={1}>
                      {dashboardStats.todayClassesCount}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Classes Today
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    Assigned periods
                  </AppText>
                </View>
              </View>

              <View style={styles.statsRow}>
                {/* Metric 3: Upcoming Exams */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsMarksModalOpen(true)}
                  style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}
                >
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>🎯</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#F59E0B' }]} numberOfLines={1}>
                      {dashboardStats.upcomingExamsCount}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Upcoming Exams
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    Examination schedule
                  </AppText>
                </TouchableOpacity>

                {/* Metric 4: Class Attendance Status (Dynamic) */}
                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>📈</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#10B981' }]} numberOfLines={1}>
                      {dashboardStats.avgAttendance}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Attendance
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    Class attendance status
                  </AppText>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Quick Actions
              </AppText>
            </View>

            <View style={styles.quickActionsRow}>
              {/* Action 1: Student Attendance */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setIsAttendanceModalOpen(true)}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(124, 58, 237, 0.15)', borderColor: colors.cardBorder }]}>
                  <AppText style={styles.actionEmoji}>📋</AppText>
                </View>
                <AppText variant="caption" style={[styles.actionLabel, { color: colors.text.secondary }]}>
                  Attendance
                </AppText>
              </TouchableOpacity>

              {/* Action 2: Homework & Assignments */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setIsHomeworkModalOpen(true)}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: colors.cardBorder }]}>
                  <AppText style={styles.actionEmoji}>✏️</AppText>
                </View>
                <AppText variant="caption" style={[styles.actionLabel, { color: colors.text.secondary }]}>
                  Homework
                </AppText>
              </TouchableOpacity>

              {/* Action 3: Grade Book / Marks Entry */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setIsMarksModalOpen(true)}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: colors.cardBorder }]}>
                  <AppText style={styles.actionEmoji}>📊</AppText>
                </View>
                <AppText variant="caption" style={[styles.actionLabel, { color: colors.text.secondary }]}>
                  Grade Book
                </AppText>
              </TouchableOpacity>

              {/* Action 4: Parent Communication */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setIsChatModalOpen(true)}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: colors.cardBorder }]}>
                  <AppText style={styles.actionEmoji}>💬</AppText>
                </View>
                <AppText variant="caption" style={[styles.actionLabel, { color: colors.text.secondary }]}>
                  Chat / Parents
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Today's Schedule */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Teaching Schedule
              </AppText>
              <TouchableOpacity onPress={() => setActiveTab('schedule')} activeOpacity={0.7}>
                <Badge label="Full Timetable →" variant="teacher" size="sm" />
              </TouchableOpacity>
            </View>

            <View style={styles.classList}>
              {todayClasses.length === 0 ? (
                <View
                  style={[
                    styles.glassCard,
                    { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, alignItems: 'center', padding: 20 },
                  ]}
                >
                  <AppText variant="caption" style={{ color: colors.text.muted }}>
                    No lectures scheduled for today.
                  </AppText>
                </View>
              ) : (
                todayClasses.map((item) => {
                  const isCompleted = item.status === 'completed';
                  const isInProgress = item.status === 'in_progress';

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={() => setIsAttendanceModalOpen(true)}
                      style={[
                        styles.glassCard,
                        {
                          backgroundColor: colors.cardBg,
                          borderColor: colors.cardBorder,
                        },
                        isInProgress && styles.liveCardBorder,
                      ]}
                    >
                      <View style={styles.classCardHeader}>
                        <View style={styles.classInfo}>
                          <View style={styles.subjectRow}>
                            <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
                              {item.subject}
                            </AppText>
                            {isInProgress && (
                              <Badge label="LIVE" variant="danger" size="sm" showDot />
                            )}
                            {isCompleted && (
                              <Badge label="Done" variant="success" size="sm" />
                            )}
                          </View>
                          <AppText variant="caption" style={{ color: colors.text.secondary, marginBottom: 2 }}>
                            {item.grade} • {item.students || 0} Students
                          </AppText>
                          <AppText variant="caption" style={{ color: colors.text.muted }}>
                            📍 {item.room}
                          </AppText>
                        </View>

                        <View style={[styles.timeBadge, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' }]}>
                          <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '700' }}>
                            {item.time}
                          </AppText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {/* Upcoming Examinations & Schedules */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Upcoming Examinations & Assessments
              </AppText>
              <TouchableOpacity onPress={() => setIsMarksModalOpen(true)} activeOpacity={0.7}>
                <AppText variant="caption" style={{ color: '#8B5CF6', fontWeight: '700' }}>
                  Grade Book →
                </AppText>
              </TouchableOpacity>
            </View>

            <View style={styles.examList}>
              {upcomingExams.map((exam) => (
                <View
                  key={exam.id}
                  style={[
                    styles.glassCard,
                    { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                  ]}
                >
                  <View style={styles.examRow}>
                    <View style={styles.examIconBox}>
                      <AppText style={{ fontSize: 20 }}>📝</AppText>
                    </View>
                    <View style={styles.examTextCol}>
                      <AppText variant="bodyBold" style={{ color: colors.text.primary, marginBottom: 2 }}>
                        {exam.title}
                      </AppText>
                      <AppText variant="caption" style={{ color: colors.text.secondary }}>
                        {exam.className} • {exam.subject}
                      </AppText>
                      <AppText variant="caption" style={{ color: '#F59E0B', marginTop: 2, fontWeight: '600' }}>
                        📅 {exam.date} • {exam.time} • {exam.room}
                      </AppText>
                    </View>
                    <Button
                      title="Enter Marks"
                      size="sm"
                      variant="primary"
                      role="teacher"
                      fullWidth={false}
                      onPress={() => handleOpenMarksForExam(exam.title)}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScreenWrapper>

      {/* Floating 5-Option Glass Taskbar */}
      <GlassTaskbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'attendance') {
            setIsAttendanceModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        role="teacher"
      />

      {/* Interactive Sidebar Drawer */}
      <SidebarDrawer
        visible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'attendance') {
            setIsAttendanceModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenWorkflow={handleSidebarWorkflow}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        visible={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onToggleRead={handleToggleNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearRead={handleClearReadNotifications}
        role="teacher"
      />

      {/* Dynamic Workflow Modals */}
      <StudentAttendanceModal
        visible={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        onAttendanceSaved={loadDashboardData}
      />

      <HomeworkModal
        visible={isHomeworkModalOpen}
        onClose={() => setIsHomeworkModalOpen(false)}
        onHomeworkChanged={loadDashboardData}
      />

      <MarksEntryModal
        visible={isMarksModalOpen}
        initialExam={selectedExamForMarks}
        onClose={() => {
          setIsMarksModalOpen(false);
          setSelectedExamForMarks('');
        }}
        onMarksSaved={loadDashboardData}
      />

      <ParentCommunicationModal
        visible={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
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
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
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
  checkInOutContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  checkInOutTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  checkInOutIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkInOutInfoCol: {
    flex: 1,
  },
  checkInOutStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  checkInOutActionRow: {
    marginTop: 4,
  },
  checkInOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  checkInOutBtnEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  checkInOutBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  checkInOutDoneBadge: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInOutDoneText: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 12,
  },
  profileBanner: {
    borderRadius: 22,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
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
  punchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  punchInfoCol: {
    flex: 1,
  },
  punchStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  punchStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  punchBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 84,
  },
  punchBtnText: {
    fontSize: 12,
    fontWeight: '800',
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
  classList: {
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
    borderColor: '#8B5CF6',
    borderWidth: 1.5,
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  classInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  timeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  examList: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  examRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  examIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  examTextCol: {
    flex: 1,
    marginRight: SPACING.sm,
  },
});

export default TeacherDashboardScreen;
