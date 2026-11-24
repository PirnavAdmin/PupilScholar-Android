import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { AppText } from '../typography/AppText';

/**
 * Universal Avatar Component with image fallback to initials
 * 
 * @param {string} source - Image URL
 * @param {string} name - Fallback name or initials
 * @param {'sm'|'md'|'lg'|'xl'} size
 * @param {'teacher'|'student'|'parent'|null} role
 * @param {boolean} showOnline
 */
export const Avatar = ({
  source,
  name = 'User',
  size = 'md',
  role = null,
  showOnline = false,
  style,
}) => {
  const [hasError, setHasError] = useState(false);

  const dimension = SIZES[size] || SIZES.md;
  const initials = getInitials(name);

  // Background and border from role if available
  const roleColor = role && COLORS.roles[role] ? COLORS.roles[role].primary : COLORS.primary;
  const roleBg = role && COLORS.roles[role] ? COLORS.roles[role].light : COLORS.primarySurface;

  const showImage = Boolean(source && !hasError);

  return (
    <View
      style={[
        styles.container,
        {
          width: dimension.size,
          height: dimension.size,
          borderRadius: dimension.size / 2,
          backgroundColor: roleBg,
          borderColor: roleColor,
          borderWidth: 1.5,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            {
              width: dimension.size - 3,
              height: dimension.size - 3,
              borderRadius: (dimension.size - 3) / 2,
            },
          ]}
          onError={() => setHasError(true)}
        />
      ) : (
        <AppText
          style={[
            styles.initialsText,
            {
              fontSize: dimension.fontSize,
              color: roleColor,
              fontWeight: '700',
            },
          ]}
        >
          {initials}
        </AppText>
      )}

      {showOnline && (
        <View
          style={[
            styles.onlineBadge,
            {
              width: dimension.dotSize,
              height: dimension.dotSize,
              borderRadius: dimension.dotSize / 2,
            },
          ]}
        />
      )}
    </View>
  );
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const SIZES = {
  sm: { size: 32, fontSize: 12, dotSize: 8 },
  md: { size: 42, fontSize: 15, dotSize: 10 },
  lg: { size: 56, fontSize: 20, dotSize: 14 },
  xl: { size: 76, fontSize: 26, dotSize: 16 },
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  initialsText: {
    letterSpacing: 0.5,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.status.success,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
});

export default Avatar;
