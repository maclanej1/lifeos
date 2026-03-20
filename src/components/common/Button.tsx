import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const base: ViewStyle[] = [styles.base, styles[size]];

    switch (variant) {
      case 'primary':
        base.push(styles.primary);
        break;
      case 'secondary':
        base.push(styles.secondary);
        break;
      case 'outline':
        base.push(styles.outline);
        break;
      case 'ghost':
        base.push(styles.ghost);
        break;
    }

    if (disabled) {
      base.push(styles.disabled);
    }

    return base;
  };

  const getTextStyle = (): TextStyle[] => {
    const base: TextStyle[] = [styles.text, styles[`${size}Text`]];

    if (variant === 'outline') {
      base.push(styles.outlineText);
    } else if (variant === 'ghost') {
      base.push(styles.ghostText);
    } else {
      base.push(styles.primaryText);
    }

    if (disabled) {
      base.push(styles.disabledText);
    }

    return base;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon}
      <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  small: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  medium: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  large: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  primary: {
    backgroundColor: Colors.accent.primary,
  },
  secondary: {
    backgroundColor: Colors.accent.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.accent.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: FontSizes.small,
  },
  mediumText: {
    fontSize: FontSizes.caption,
  },
  largeText: {
    fontSize: FontSizes.body,
  },
  primaryText: {
    color: Colors.background.primary,
  },
  outlineText: {
    color: Colors.accent.primary,
  },
  ghostText: {
    color: Colors.accent.primary,
  },
  disabledText: {
    color: Colors.text.muted,
  },
});
