import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

/**
 * AppText - Unified typography component across iOS and Android
 * 
 * @param {'h1'|'h2'|'h3'|'subtitle'|'body'|'bodyBold'|'caption'|'label'} variant
 * @param {'primary'|'secondary'|'muted'|'inverse'|'brand'|'danger'|'success'|'warning'} color
 * @param {'left'|'center'|'right'} align
 */
export const AppText = ({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  style,
  numberOfLines,
  ...rest
}) => {
  const textColor = getColorValue(color);
  const typographyStyle = TYPOGRAPHY[variant] || TYPOGRAPHY.body;

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        typographyStyle,
        { color: textColor, textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const getColorValue = (colorKey) => {
  switch (colorKey) {
    case 'primary':
      return COLORS.text.primary;
    case 'secondary':
      return COLORS.text.secondary;
    case 'muted':
      return COLORS.text.muted;
    case 'inverse':
      return COLORS.text.inverse;
    case 'brand':
      return COLORS.primary;
    case 'danger':
      return COLORS.status.danger;
    case 'success':
      return COLORS.status.success;
    case 'warning':
      return COLORS.status.warning;
    default:
      return typeof colorKey === 'string' && colorKey.startsWith('#')
        ? colorKey
        : COLORS.text.primary;
  }
};

export default AppText;
