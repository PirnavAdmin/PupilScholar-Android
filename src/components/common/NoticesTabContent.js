import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AppText } from '../typography/AppText';
import { Badge } from './Badge';
import { useTheme } from '../../context/ThemeContext';
import { MOCK_NOTICES } from '../../data/mockSchoolData';
import { SPACING, RADIUS } from '../../constants/spacing';

const CATEGORIES = ['All', 'Holiday', 'Examinations', 'Events', 'Administrative'];

/**
 * Universal School Notices & Circulars Tab Component
 * Adapts dynamically to Dark & Light theme
 */
export const NoticesTabContent = ({ role = 'teacher' }) => {
  const { isDark, colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);

  const filteredNotices = selectedCategory === 'All'
    ? MOCK_NOTICES
    : MOCK_NOTICES.filter((n) => n.category.toLowerCase() === selectedCategory.toLowerCase());

  const handleDownload = (filename) => {
    Alert.alert(
      'Download Document',
      `Downloading "${filename}" to device storage...`,
      [{ text: 'OK' }]
    );
  };

  const handleAcknowledge = (title) => {
    Alert.alert(
      'Notice Acknowledged',
      `You have acknowledged receipt of: "${title}".`,
      [{ text: 'Done' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Category Pills Header */}
      <View style={styles.categoryScroll}>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.75}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected
                      ? '#2563EB'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.05)',
                    borderColor: isSelected
                      ? '#2563EB'
                      : colors.cardBorder,
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  style={[
                    styles.categoryText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text.secondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {cat}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Header Info */}
      <View style={styles.noticeListHeader}>
        <AppText variant="h3" style={{ color: colors.text.primary, fontWeight: '700' }}>
          Official Circulars
        </AppText>
        <Badge
          label={`${filteredNotices.length} Notices`}
          variant="neutral"
          size="sm"
        />
      </View>

      {/* Notices List */}
      {filteredNotices.map((notice) => {
        const isExpanded = expandedNoticeId === notice.id;

        return (
          <View
            key={notice.id}
            style={[
              styles.noticeCard,
              {
                backgroundColor: colors.cardBg,
                borderColor: notice.urgent ? 'rgba(239, 68, 68, 0.4)' : colors.cardBorder,
              },
            ]}
          >
            {/* Top Row: Category + Urgent Badge + Date */}
            <View style={styles.cardTopRow}>
              <View style={styles.badgeRow}>
                {notice.urgent && (
                  <View style={styles.urgentPill}>
                    <AppText style={styles.urgentText}>URGENT</AppText>
                  </View>
                )}
                <Badge
                  label={notice.category}
                  variant={notice.urgent ? 'danger' : 'neutral'}
                  size="sm"
                />
              </View>
              <AppText variant="caption" style={{ color: colors.text.muted, fontSize: 11 }}>
                {notice.date}
              </AppText>
            </View>

            {/* Notice Title */}
            <TouchableOpacity
              onPress={() => setExpandedNoticeId(isExpanded ? null : notice.id)}
              activeOpacity={0.8}
            >
              <AppText
                variant="bodyBold"
                style={[styles.noticeTitle, { color: colors.text.primary }]}
              >
                {notice.title}
              </AppText>
            </TouchableOpacity>

            {/* Notice Content (Summary or Full) */}
            <AppText
              variant="body"
              style={[
                styles.noticeContent,
                { color: colors.text.secondary },
              ]}
            >
              {isExpanded ? notice.fullText : notice.summary}
            </AppText>

            {/* Issuer Info */}
            <View style={styles.issuerRow}>
              <AppText variant="caption" style={{ color: colors.text.muted, fontSize: 11 }}>
                Issued by: <AppText variant="caption" style={{ color: colors.text.secondary, fontWeight: '600' }}>{notice.author}</AppText>
              </AppText>

              <TouchableOpacity
                onPress={() => setExpandedNoticeId(isExpanded ? null : notice.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppText variant="caption" style={styles.readMoreLink}>
                  {isExpanded ? 'Show Less ▲' : 'Read Full Notice ▼'}
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Action Buttons: PDF Attachment & Acknowledge */}
            <View
              style={[
                styles.actionFooter,
                { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)' },
              ]}
            >
              {notice.attachment ? (
                <TouchableOpacity
                  style={[styles.attachmentBtn, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }]}
                  onPress={() => handleDownload(notice.attachment)}
                  activeOpacity={0.7}
                >
                  <AppText style={styles.btnEmoji}>📎</AppText>
                  <AppText variant="caption" style={styles.attachmentText} numberOfLines={1}>
                    {notice.attachment}
                  </AppText>
                </TouchableOpacity>
              ) : (
                <View />
              )}

              <TouchableOpacity
                style={[styles.ackBtn, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' }]}
                onPress={() => handleAcknowledge(notice.title)}
                activeOpacity={0.7}
              >
                <AppText style={styles.btnEmoji}>✓</AppText>
                <AppText variant="caption" style={styles.ackText}>
                  Acknowledge
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
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
  },
  noticeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: 4,
  },
  noticeCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  urgentPill: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  noticeTitle: {
    fontSize: 15,
    marginBottom: 6,
  },
  noticeContent: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  issuerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  readMoreLink: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 11,
  },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  attachmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: '60%',
    gap: 4,
  },
  btnEmoji: {
    fontSize: 12,
  },
  attachmentText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 11,
  },
  ackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  ackText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 11,
  },
});

export default NoticesTabContent;
