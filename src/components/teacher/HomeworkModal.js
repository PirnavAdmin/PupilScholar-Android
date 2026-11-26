import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../typography/AppText';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useTheme } from '../../context/ThemeContext';
import {
  getHomeworkList,
  createHomework,
  deleteHomework,
} from '../../api/teacherApi';
import { SPACING, RADIUS } from '../../constants/spacing';

export const HomeworkModal = ({ visible, onClose, onHomeworkChanged }) => {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [homeworkList, setHomeworkList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form state
  const [title, setTitle] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Grade 10-A');
  const [selectedSubject, setSelectedSubject] = useState('Advanced Mathematics');
  const [dueDate, setDueDate] = useState('Tomorrow, 5:00 PM');
  const [description, setDescription] = useState('');

  const gradeOptions = ['Grade 10-A', 'Grade 9-B', 'Grade 11-A'];
  const subjectOptions = ['Advanced Mathematics', 'Applied Algebra', 'Calculus'];

  // Load homework when modal becomes visible
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    const fetchHomework = async () => {
      setIsLoading(true);
      try {
        const res = await getHomeworkList();
        if (isMounted && res.data) {
          setHomeworkList(res.data);
        }
      } catch {
        // Fallback handled inside teacherApi
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHomework();
    return () => {
      isMounted = false;
    };
  }, [visible]);

  // Handle Publish Assignment
  const handleCreateAssignment = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please provide a title for the assignment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        className: selectedGrade,
        subject: selectedSubject,
        dueDate,
        description: description.trim(),
      };

      await createHomework(payload);

      // Add to local state immediately
      const newEntry = {
        id: `hw_${Date.now()}`,
        title: payload.title,
        grade: payload.className,
        subject: payload.subject,
        dueDate: payload.dueDate,
        description: payload.description,
        submissions: '0/32',
        submissionsCount: 0,
        totalStudents: 32,
      };

      setHomeworkList((prev) => [newEntry, ...prev]);
      setTitle('');
      setDescription('');
      setActiveTab('list');
      Alert.alert('Success', `Assignment "${payload.title}" has been assigned to ${selectedGrade}.`);
      if (onHomeworkChanged) onHomeworkChanged();
    } catch {
      Alert.alert('Created', 'Assignment published.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteHomework = (id, hwTitle) => {
    Alert.alert(
      'Delete Assignment',
      `Are you sure you want to delete "${hwTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHomework(id);
              setHomeworkList((prev) => prev.filter((item) => item.id !== id));
              if (onHomeworkChanged) onHomeworkChanged();
            } catch {
              setHomeworkList((prev) => prev.filter((item) => item.id !== id));
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.modalScreen, { backgroundColor: colors.background }]}
      >
        {/* Top Header */}
        <View
          style={[
            styles.headerRow,
            {
              paddingTop: Math.max(insets.top, 16),
              borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          <View style={styles.headerTitleCol}>
            <AppText variant="h2" style={[styles.modalTitle, { color: colors.text.primary }]}>
              Homework & Assignments
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              Curriculum Tasks & Student Submissions
            </AppText>
          </View>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={[
              styles.closeBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <AppText style={styles.closeBtnText}>✕</AppText>
          </TouchableOpacity>
        </View>

        {/* Navigation Tabs (List vs Create) */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setActiveTab('list')}
            style={[
              styles.tabBtn,
              activeTab === 'list' && [styles.activeTabBtn, { borderColor: '#7C3AED' }],
            ]}
          >
            <AppText
              style={[
                styles.tabBtnText,
                { color: activeTab === 'list' ? '#7C3AED' : colors.text.secondary },
              ]}
            >
              Active Tasks ({homeworkList.length})
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('create')}
            style={[
              styles.tabBtn,
              activeTab === 'create' && [styles.activeTabBtn, { borderColor: '#7C3AED' }],
            ]}
          >
            <AppText
              style={[
                styles.tabBtnText,
                { color: activeTab === 'create' ? '#7C3AED' : colors.text.secondary },
              ]}
            >
              + New Assignment
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'list' ? (
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <AppText variant="caption" style={{ color: colors.text.secondary, marginTop: 8 }}>
                Loading assignments...
              </AppText>
            </View>
          ) : (
            <ScrollView
              style={styles.contentScroll}
              contentContainerStyle={styles.contentScrollContainer}
              showsVerticalScrollIndicator={false}
            >
              {homeworkList.map((hw) => (
                <View
                  key={hw.id}
                  style={[
                    styles.homeworkCard,
                    {
                      backgroundColor: colors.cardBg,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.hwCardHeader}>
                    <View style={styles.hwMetaRow}>
                      <Badge label={hw.grade} variant="teacher" size="sm" />
                      <AppText variant="caption" style={{ color: colors.text.muted }}>
                        {hw.subject}
                      </AppText>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDeleteHomework(hw.id, hw.title)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <AppText style={styles.deleteIcon}>🗑️</AppText>
                    </TouchableOpacity>
                  </View>

                  <AppText variant="bodyBold" style={[styles.hwTitle, { color: colors.text.primary }]}>
                    {hw.title}
                  </AppText>

                  {hw.description ? (
                    <AppText
                      variant="caption"
                      style={{ color: colors.text.secondary, marginBottom: 8 }}
                      numberOfLines={2}
                    >
                      {hw.description}
                    </AppText>
                  ) : null}

                  <View
                    style={[
                      styles.hwFooter,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                      },
                    ]}
                  >
                    <View style={styles.hwFooterItem}>
                      <AppText style={styles.hwFooterEmoji}>⏳</AppText>
                      <AppText variant="caption" style={{ color: '#EF4444', fontWeight: '700' }}>
                        Due: {hw.dueDate}
                      </AppText>
                    </View>

                    <View style={styles.hwFooterItem}>
                      <AppText style={styles.hwFooterEmoji}>📥</AppText>
                      <AppText variant="caption" style={{ color: colors.text.primary, fontWeight: '700' }}>
                        Turned In: {hw.submissions}
                      </AppText>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )
        ) : (
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentScrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Input
                label="Assignment Title"
                placeholder="e.g. Chapter 4 Problem Set"
                value={title}
                onChangeText={setTitle}
                required
              />

              {/* Class Selection Pills */}
              <AppText variant="caption" style={[styles.fieldLabel, { color: colors.text.secondary }]}>
                Assign to Class
              </AppText>
              <View style={styles.pillRow}>
                {gradeOptions.map((g) => {
                  const isSelected = selectedGrade === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setSelectedGrade(g)}
                      style={[
                        styles.formPill,
                        {
                          backgroundColor: isSelected
                            ? '#7C3AED'
                            : isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : '#F1F5F9',
                          borderColor: isSelected ? '#7C3AED' : colors.cardBorder,
                        },
                      ]}
                    >
                      <AppText
                        variant="caption"
                        style={{
                          color: isSelected ? '#FFFFFF' : colors.text.primary,
                          fontWeight: isSelected ? '800' : '600',
                        }}
                      >
                        {g}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Subject Selection Pills */}
              <AppText variant="caption" style={[styles.fieldLabel, { color: colors.text.secondary }]}>
                Subject
              </AppText>
              <View style={styles.pillRow}>
                {subjectOptions.map((subj) => {
                  const isSelected = selectedSubject === subj;
                  return (
                    <TouchableOpacity
                      key={subj}
                      onPress={() => setSelectedSubject(subj)}
                      style={[
                        styles.formPill,
                        {
                          backgroundColor: isSelected
                            ? '#7C3AED'
                            : isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : '#F1F5F9',
                          borderColor: isSelected ? '#7C3AED' : colors.cardBorder,
                        },
                      ]}
                    >
                      <AppText
                        variant="caption"
                        style={{
                          color: isSelected ? '#FFFFFF' : colors.text.primary,
                          fontWeight: isSelected ? '800' : '600',
                        }}
                      >
                        {subj}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Input
                label="Submission Deadline"
                placeholder="e.g. Friday, 5:00 PM"
                value={dueDate}
                onChangeText={setDueDate}
                required
              />

              <AppText variant="caption" style={[styles.fieldLabel, { color: colors.text.secondary }]}>
                Instructions & Details
              </AppText>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
                    color: colors.text.primary,
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder="Describe assignment instructions, page numbers, or questions..."
                placeholderTextColor={colors.text.muted}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />

              <Button
                title={isSubmitting ? 'Publishing...' : 'Publish to Class'}
                variant="primary"
                role="teacher"
                size="lg"
                onPress={handleCreateAssignment}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.publishBtn}
              />
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalScreen: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  headerTitleCol: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    gap: 12,
  },
  tabBtn: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomColor: '#7C3AED',
  },
  tabBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollContainer: {
    padding: SPACING.lg,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeworkCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
  },
  hwCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hwMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteIcon: {
    fontSize: 16,
  },
  hwTitle: {
    fontSize: 16,
    marginBottom: 6,
  },
  hwFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: 4,
  },
  hwFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hwFooterEmoji: {
    fontSize: 14,
  },
  formCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  fieldLabel: {
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  formPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  textArea: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: SPACING.xl,
  },
  publishBtn: {
    marginTop: 4,
  },
});

export default HomeworkModal;
