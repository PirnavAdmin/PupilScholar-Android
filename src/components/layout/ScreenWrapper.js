import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';

/**
 * ScreenWrapper provides modern safe-area handling via react-native-safe-area-context,
 * cross-platform keyboard avoidance, and optional scroll support for iOS & Android.
 * 
 * @param {boolean} scrollable - wrap in ScrollView
 * @param {boolean} keyboardAware - wrap in KeyboardAvoidingView
 * @param {string} backgroundColor
 * @param {string} statusBarStyle - 'dark-content' | 'light-content'
 * @param {Array<string>} edges - safe area edges to apply: ['top', 'bottom', 'left', 'right']
 */
export const ScreenWrapper = ({
  children,
  scrollable = false,
  keyboardAware = true,
  backgroundColor = COLORS.background,
  statusBarStyle = 'dark-content',
  edges = ['top', 'left', 'right'],
  contentContainerStyle,
  style,
  header = null,
  footer = null,
}) => {
  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.staticContent, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor }, style]}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={backgroundColor}
        animated
      />
      {header}
      {keyboardAware ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flexOne}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flexOne}>{content}</View>
      )}
      {footer}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  staticContent: {
    flex: 1,
  },
});

export default ScreenWrapper;
