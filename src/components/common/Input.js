import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/spacing';
import { AppText } from '../typography/AppText';
import { useTheme } from '../../context/ThemeContext';

/**
 * Universal Input Component with automatic Theme (Dark/Light) adaptability
 * Fixed height (52px) to prevent vertical stretching glitches.
 * Tapping anywhere on the input wrapper instantly focuses the TextInput.
 */
export const Input = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  leftIcon = null,
  rightIcon = null,
  isPassword = false,
  secureTextEntry,
  value,
  onChangeText,
  placeholder,
  editable = true,
  theme = 'auto',
  containerStyle,
  inputStyle,
  autoCapitalize = 'none',
  keyboardType = 'default',
  ...rest
}, ref) => {
  const { isDark: contextIsDark } = useTheme();
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useImperativeHandle(ref, () => inputRef.current);

  const isSecure = isPassword ? !showPassword : secureTextEntry;
  const isDark = theme === 'auto' ? contextIsDark : theme === 'dark' || theme === 'glass';

  const getBorderColor = () => {
    if (error) return COLORS.status.danger;
    if (isFocused) return isDark ? '#60A5FA' : '#2563EB';
    return isDark ? 'rgba(255, 255, 255, 0.18)' : '#CBD5E1';
  };

  const getBgColor = () => {
    if (!editable) return isDark ? 'rgba(255, 255, 255, 0.04)' : '#F1F5F9';
    if (isDark) return isFocused ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.08)';
    return isFocused ? '#FFFFFF' : '#F8FAFC';
  };

  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const placeholderColor = isDark ? 'rgba(255, 255, 255, 0.45)' : '#94A3B8';

  const handleWrapperPress = () => {
    if (editable && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <AppText
            variant="caption"
            style={[
              styles.label,
              { color: error ? COLORS.status.danger : isDark ? '#94A3B8' : '#475569' },
            ]}
          >
            {label}
          </AppText>
          {required && (
            <AppText variant="caption" color="danger" style={styles.requiredAsterisk}>
              *
            </AppText>
          )}
        </View>
      ) : null}

      <Pressable
        onPress={handleWrapperPress}
        style={[
          styles.inputWrapper,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBgColor(),
          },
          isFocused && (isDark ? styles.inputWrapperFocusedDark : styles.inputWrapperFocused),
          error && styles.inputWrapperError,
        ]}
      >
        {leftIcon ? (
          <View pointerEvents="none" style={styles.leftIconWrapper}>
            {leftIcon}
          </View>
        ) : null}

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          secureTextEntry={isSecure}
          editable={editable}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          spellCheck={false}
          keyboardType={keyboardType}
          selectionColor={isDark ? '#60A5FA' : '#2563EB'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            {
              color: textColor,
              paddingLeft: leftIcon ? SPACING.xs : SPACING.md,
              paddingRight: isPassword || rightIcon ? SPACING.xs : SPACING.md,
            },
            inputStyle,
          ]}
          {...rest}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.rightActionWrapper}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
            hitSlop={15}
          >
            <AppText
              variant="caption"
              style={[styles.toggleText, { color: isDark ? '#60A5FA' : '#2563EB' }]}
            >
              {showPassword ? 'Hide' : 'Show'}
            </AppText>
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.rightActionWrapper}>{rightIcon}</View>
        ) : null}
      </Pressable>

      {error ? (
        <AppText variant="caption" color="danger" style={styles.errorText}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText
          variant="caption"
          style={[styles.helperText, { color: isDark ? '#64748B' : '#94A3B8' }]}
        >
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
    fontSize: 13,
  },
  requiredAsterisk: {
    marginLeft: 3,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 14,
    height: 52,
    maxHeight: 52,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperFocusedDark: {
    borderColor: '#60A5FA',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  leftIconWrapper: {
    width: 44,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActionWrapper: {
    paddingHorizontal: SPACING.md,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontWeight: '700',
    fontSize: 12,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
