import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AppText } from '../../components/typography/AppText';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { MOCK_PARENT_DATA } from '../../data/mockSchoolData';
import { SPACING, RADIUS } from '../../constants/spacing';
import { getParentTimetable } from '../../api/timetableApi';

export const ParentChildrenTab = ({
  selectedChildId = 'child_01',
  onSelectChild,
}) => {
  const { isDark, colors } = useTheme();
  const [activeChildId, setActiveChildId] = useState(selectedChildId);
  const [childTimetable, setChildTimetable] = useState([]);
  const [isLoadingTimetable, setIsLoadingTimetable] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTimetable = async () => {
      setIsLoadingTimetable(true);
      try {
        const studentId = activeChildId === 'child_01' ? 1239 : 1240;
        const res = await getParentTimetable(studentId);
        const data = Array.isArray(res) ? res : (res?.data || []);
        if (isMounted) setChildTimetable(data);
      } catch {
        if (isMounted) setChildTimetable([]);
      } finally {
        if (isMounted) setIsLoadingTimetable(false);
      }
    };
    fetchTimetable();
    return () => {
      isMounted = false;
    };
  }, [activeChildId]);

  const childrenList = [
    { id: 'child_01', name: 'Alex Rivera', grade: 'Grade 10-A', initials: 'AR' },
    { id: 'child_02', name: 'Emma Rivera', grade: 'Grade 6-B', initials: 'ER' },
  ];

  const currentChild =
    MOCK_PARENT_DATA.childrenDetails[activeChildId] ||
    MOCK_PARENT_DATA.childrenDetails.child_01;

  const handleSelectChild = (id) => {
    setActiveChildId(id);
    if (onSelectChild) onSelectChild(id);
  };

  const handleCallTeacher = (name, phone) => {
    Alert.alert(
      `Contact Faculty`,
      `Dialing ${name} at ${phone}...`,
      [{ text: 'Call Now' }, { text: 'Cancel', style: 'cancel' }]
    );
  };

  const handleMessageTeacher = (name) => {
    Alert.alert(
      `Message: ${name}`,
      `Your direct message channel is active with ${name}. You will be notified when they reply.`,
      [{ text: 'Send Note' }, { text: 'Cancel', style: 'cancel' }]
    );
  };

  const handleFeeAction = (status, amount) => {
    if (status === 'Paid') {
      Alert.alert('Fee Receipt', 'Receipt #REC-2024-9912 is available. Downloading official PDF voucher...');
    } else {
      Alert.alert('Fee Payment', `Proceed to secure payment gateway for ${amount}?`, [
        { text: 'Pay with Card / Bank' },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Child Switcher Pills */}
      <View style={styles.childSwitcherRow}>
        {childrenList.map((c) => {
          const isSelected = activeChildId === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => handleSelectChild(c.id)}
              activeOpacity={0.8}
              style={[
                styles.childPill,
                {
                  backgroundColor: isSelected
                    ? '#059669'
                    : isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.05)',
                  borderColor: isSelected ? '#059669' : colors.cardBorder,
                },
              ]}
            >
              <Avatar name={c.name} size="sm" role="student" />
              <View style={styles.childPillTextCol}>
                <AppText
                  style={[
                    styles.childPillName,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text.primary,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                >
                  {c.name}
                </AppText>
                <AppText
                  variant="caption"
                  style={{
                    color: isSelected ? 'rgba(255, 255, 255, 0.8)' : colors.text.muted,
                    fontSize: 10,
                  }}
                >
                  {c.grade}
                </AppText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Welfare & Safety Tracking Card */}
      <View
        style={[
          styles.glassCard,
          { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View>
            <AppText variant="h3" style={[styles.cardTitle, { color: colors.text.primary }]}>
              Daily Safety & Attendance
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              Live SIS status for today
            </AppText>
          </View>
          <Badge label="Active" variant="success" size="sm" showDot />
        </View>

        <View style={styles.statusGrid}>
          <View style={[styles.statusBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5' }]}>
            <AppText style={styles.statusBoxEmoji}>🏫</AppText>
            <AppText variant="caption" style={{ color: colors.text.muted, fontSize: 10 }}>
              Campus Status
            </AppText>
            <AppText style={[styles.statusBoxVal, { color: '#059669' }]}>
              {currentChild.attendance.today}
            </AppText>
          </View>

          <View style={[styles.statusBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }]}>
            <AppText style={styles.statusBoxEmoji}>🚌</AppText>
            <AppText variant="caption" style={{ color: colors.text.muted, fontSize: 10 }}>
              School Transit
            </AppText>
            <AppText style={[styles.statusBoxVal, { color: '#2563EB' }]}>
              {currentChild.attendance.busStatus.split('•')[0]}
            </AppText>
          </View>
        </View>

        <View style={styles.attendanceProgressRow}>
          <View style={styles.progressCol}>
            <AppText variant="caption" style={{ color: colors.text.muted }}>
              Semester Attendance Record:
            </AppText>
            <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
              {currentChild.attendance.percentage} ({currentChild.attendance.daysAttended})
            </AppText>
          </View>
        </View>
      </View>

      {/* Academic Performance Card */}
      <View
        style={[
          styles.glassCard,
          { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <AppText variant="h3" style={[styles.cardTitle, { color: colors.text.primary }]}>
              Academic Performance
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              {currentChild.academicProgress.recentExam}
            </AppText>
          </View>
          <Badge label={currentChild.academicProgress.overallGrade} variant="success" size="sm" />
        </View>

        <View style={styles.enrolledList}>
          <AppText variant="caption" style={[styles.subSectionLabel, { color: colors.text.muted }]}>
            ENROLLED SUBJECTS & CURRENT GRADES
          </AppText>
          {currentChild.enrolledSubjects.map((sub, idx) => (
            <View
              key={idx}
              style={[
                styles.subjectRow,
                idx < currentChild.enrolledSubjects.length - 1 && [
                  styles.subjectBorder,
                  { borderBottomColor: colors.cardBorder },
                ],
              ]}
            >
              <View style={{ flex: 1 }}>
                <AppText variant="body" style={{ color: colors.text.primary, fontWeight: '600' }}>
                  {sub.name}
                </AppText>
                <AppText variant="caption" style={{ color: colors.text.secondary }}>
                  Faculty: {sub.teacher}
                </AppText>
              </View>
              <Badge label={sub.grade} variant="info" size="sm" />
            </View>
          ))}
        </View>
      </View>

      {/* Faculty Advisor & Direct Contact */}
      <View
        style={[
          styles.glassCard,
          { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View>
            <AppText variant="h3" style={[styles.cardTitle, { color: colors.text.primary }]}>
              Class Teacher & Mentor
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              {currentChild.classTeacher}
            </AppText>
          </View>
          <Badge label="Faculty" variant="neutral" size="sm" />
        </View>

        {/* Teacher's latest observation note */}
        <View style={[styles.noteContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC' }]}>
          <AppText variant="caption" style={{ color: '#059669', fontWeight: '700', marginBottom: 2 }}>
            Latest Teacher Note ({currentChild.recentTeacherNote.date}):
          </AppText>
          <AppText variant="caption" style={{ color: colors.text.secondary, fontStyle: 'italic', lineHeight: 18 }}>
            "{currentChild.recentTeacherNote.message}"
          </AppText>
        </View>

        <View style={styles.teacherContactRow}>
          <TouchableOpacity
            style={[styles.callBtn, { backgroundColor: '#059669' }]}
            onPress={() => handleCallTeacher(currentChild.classTeacher, currentChild.teacherPhone)}
            activeOpacity={0.75}
          >
            <AppText style={styles.btnIcon}>📞</AppText>
            <AppText style={styles.btnTextWhite}>Call Teacher</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.msgBtn, { borderColor: colors.cardBorder, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' }]}
            onPress={() => handleMessageTeacher(currentChild.classTeacher)}
            activeOpacity={0.75}
          >
            <AppText style={styles.btnIcon}>💬</AppText>
            <AppText style={[styles.btnTextDark, { color: colors.text.primary }]}>Send Note</AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dynamic Student Timetable Card */}
      <View
        style={[
          styles.glassCard,
          { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View>
            <AppText variant="h3" style={[styles.cardTitle, { color: colors.text.primary }]}>
              Daily Class Schedule
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              {currentChild.name} • {currentChild.grade}
            </AppText>
          </View>
          <Badge label="Timetable" variant="neutral" size="sm" />
        </View>

        {isLoadingTimetable ? (
          <ActivityIndicator size="small" color="#F59E0B" style={{ marginVertical: 12 }} />
        ) : childTimetable.length > 0 ? (
          <View style={{ marginTop: 6 }}>
            {childTimetable.slice(0, 4).map((slot, idx) => (
              <View
                key={slot.id || idx}
                style={[
                  styles.subjectRow,
                  idx < Math.min(childTimetable.length, 4) - 1 && [styles.subjectBorder, { borderBottomColor: colors.cardBorder }],
                ]}
              >
                <View>
                  <AppText variant="bodyBold" style={{ color: colors.text.primary, fontSize: 13 }}>
                    {slot.subjectName || slot.subject || 'Academic Period'}
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.text.muted, fontSize: 11 }}>
                    {slot.time || `${slot.startTime || '08:30'} - ${slot.endTime || '09:20'}`} • {slot.roomNo || slot.room || 'Room 201'}
                  </AppText>
                </View>
                <Badge label={slot.teacherName || 'Faculty'} variant="neutral" size="sm" />
              </View>
            ))}
          </View>
        ) : (
          <View style={{ paddingVertical: 8 }}>
            <AppText variant="caption" style={{ color: colors.text.secondary, fontStyle: 'italic' }}>
              Standard school hours: 08:30 AM – 03:30 PM (6 periods daily)
            </AppText>
          </View>
        )}
      </View>

      {/* Tuition / Fee Status Card */}
      <View
        style={[
          styles.glassCard,
          { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View>
            <AppText variant="h3" style={[styles.cardTitle, { color: colors.text.primary }]}>
              Tuition & Term Fees
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              Status: {currentChild.feeStatus.status} • {currentChild.feeStatus.amountDue}
            </AppText>
          </View>
          <Badge
            label={currentChild.feeStatus.status}
            variant={currentChild.feeStatus.status === 'Paid' ? 'success' : 'danger'}
            size="sm"
          />
        </View>

        <View style={styles.feeActionRow}>
          <Button
            title={currentChild.feeStatus.status === 'Paid' ? 'Download Official Receipt' : 'Pay Online Now'}
            variant={currentChild.feeStatus.status === 'Paid' ? 'secondary' : 'primary'}
            role="parent"
            size="md"
            onPress={() => handleFeeAction(currentChild.feeStatus.status, currentChild.feeStatus.amountDue)}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  childSwitcherRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.lg,
  },
  childPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: 10,
  },
  childPillTextCol: {
    flex: 1,
  },
  childPillName: {
    fontSize: 14,
  },
  glassCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statusBox: {
    flex: 1,
    padding: 10,
    borderRadius: RADIUS.md,
    alignItems: 'flex-start',
  },
  statusBoxEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  statusBoxVal: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  attendanceProgressRow: {
    paddingTop: 8,
  },
  progressCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  enrolledList: {
    marginTop: 4,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
  },
  subjectBorder: {
    borderBottomWidth: 1,
  },
  noteContainer: {
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 12,
  },
  teacherContactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  msgBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 6,
  },
  btnIcon: {
    fontSize: 13,
  },
  btnTextWhite: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  btnTextDark: {
    fontWeight: '700',
    fontSize: 12,
  },
  feeActionRow: {
    marginTop: 8,
  },
});

export default ParentChildrenTab;
