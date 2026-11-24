import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AppText } from '../../components/typography/AppText';
import { Badge } from '../../components/common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { MOCK_STUDENT_DATA } from '../../data/mockSchoolData';
import { SPACING, RADIUS } from '../../constants/spacing';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const StudentTimetableTab = () => {
  const { isDark, colors } = useTheme();
  const [selectedDay, setSelectedDay] = useState('Tue');

  const timetableList = selectedDay === 'Tue'
    ? MOCK_STUDENT_DATA.todayTimetable
    : (MOCK_STUDENT_DATA.weeklyTimetable[selectedDay] || []).map((item, idx) => ({
        id: item.id,
        period: `Period ${idx + 1}`,
        subject: item.subject,
        teacher: item.teacher,
        room: item.room,
        time: item.time,
        status: 'upcoming',
        active: false,
      }));

  const handleJoinClass = (subject, room) => {
    Alert.alert(
      `Classroom: ${subject}`,
      `Connecting to Virtual Audio & Smart Whiteboard for ${room}...`,
      [{ text: 'Enter Room' }, { text: 'Cancel', style: 'cancel' }]
    );
  };

  const handleStudyNotes = (subject) => {
    Alert.alert(
      `Course Materials: ${subject}`,
      `1. Chapter Syllabus & Lecture Slides (PDF)\n2. Practice Worksheet & Solutions\n3. Formula Cheat Sheet`,
      [{ text: 'View Files' }, { text: 'Close', style: 'cancel' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Day Selector Pills */}
      <View style={styles.daySelectorRow}>
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              activeOpacity={0.75}
              style={[
                styles.dayPill,
                {
                  backgroundColor: isSelected
                    ? '#2563EB'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.05)',
                  borderColor: isSelected ? '#2563EB' : colors.cardBorder,
                },
              ]}
            >
              <AppText
                variant="caption"
                style={[
                  styles.dayText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text.secondary,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {day}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Timetable Overview Banner */}
      <View
        style={[
          styles.summaryBanner,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.summaryTop}>
          <View>
            <AppText variant="h3" style={[styles.summaryTitle, { color: colors.text.primary }]}>
              {selectedDay === 'Tue' ? 'Today (Tuesday)' : `${selectedDay} Timetable`}
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              {timetableList.length} Scheduled Periods • Grade 10 - Section A
            </AppText>
          </View>
          <View style={styles.statusPill}>
            <AppText style={styles.statusPillText}>
              {selectedDay === 'Tue' ? '● IN SESSION' : 'WEEKDAY'}
            </AppText>
          </View>
        </View>
      </View>

      {/* Period Timeline */}
      <View style={styles.sectionHeader}>
        <AppText variant="h3" style={{ color: colors.text.primary, fontWeight: '700' }}>
          Period Schedule
        </AppText>
      </View>

      {timetableList.map((item, index) => {
        const isInProgress = item.status === 'in_progress' || item.active;
        const isCompleted = item.status === 'completed';

        return (
          <View
            key={item.id || index}
            style={[
              styles.periodCard,
              {
                backgroundColor: colors.cardBg,
                borderColor: isInProgress ? '#2563EB' : colors.cardBorder,
                borderWidth: isInProgress ? 1.5 : 1,
              },
            ]}
          >
            {/* Top row: Period name, Subject, Status Badge */}
            <View style={styles.cardHeader}>
              <View style={styles.subjectCol}>
                <View style={styles.periodBadgeRow}>
                  <Badge
                    label={item.period || `Period ${index + 1}`}
                    variant="student"
                    size="sm"
                  />
                  {isInProgress && (
                    <View style={styles.liveNowBadge}>
                      <AppText style={styles.liveNowText}>● LIVE NOW</AppText>
                    </View>
                  )}
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <AppText style={styles.completedText}>✓ DONE</AppText>
                    </View>
                  )}
                </View>

                <AppText
                  variant="bodyBold"
                  style={[styles.subjectTitle, { color: colors.text.primary }]}
                >
                  {item.subject}
                </AppText>
                <AppText variant="caption" style={{ color: colors.text.muted, marginTop: 2 }}>
                  Faculty: <AppText variant="caption" style={{ color: colors.text.secondary, fontWeight: '600' }}>{item.teacher}</AppText>
                </AppText>
              </View>
            </View>

            {/* Time & Location Row */}
            <View
              style={[
                styles.metaBox,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                },
              ]}
            >
              <View style={styles.metaCol}>
                <AppText style={styles.metaIcon}>⏰</AppText>
                <AppText variant="caption" style={[styles.metaValue, { color: colors.text.secondary }]}>
                  {item.time}
                </AppText>
              </View>
              <View style={styles.metaCol}>
                <AppText style={styles.metaIcon}>📍</AppText>
                <AppText variant="caption" style={[styles.metaValue, { color: colors.text.secondary }]}>
                  {item.room}
                </AppText>
              </View>
            </View>

            {/* Actions: Join Class / Notes */}
            <View style={styles.actionsFooter}>
              <TouchableOpacity
                onPress={() => handleJoinClass(item.subject, item.room)}
                activeOpacity={0.75}
                style={[
                  styles.joinBtn,
                  {
                    backgroundColor: isInProgress ? '#2563EB' : isDark ? 'rgba(37, 99, 235, 0.15)' : '#EFF6FF',
                  },
                ]}
              >
                <AppText
                  style={[
                    styles.joinBtnText,
                    { color: isInProgress ? '#FFFFFF' : '#2563EB' },
                  ]}
                >
                  {isInProgress ? 'Join Live Lecture' : 'Room Link'}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleStudyNotes(item.subject)}
                activeOpacity={0.75}
                style={[
                  styles.notesBtn,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <AppText variant="caption" style={{ color: colors.text.primary, fontWeight: '600' }}>
                  Study Notes
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  daySelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dayPill: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
  },
  summaryBanner: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusPill: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    color: '#3B82F6',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  periodCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subjectCol: {
    flex: 1,
  },
  periodBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  liveNowBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveNowText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '800',
  },
  completedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  subjectTitle: {
    fontSize: 16,
  },
  metaBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 12,
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  joinBtn: {
    flex: 1.4,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notesBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StudentTimetableTab;
