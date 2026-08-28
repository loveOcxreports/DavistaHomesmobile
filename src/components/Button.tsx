import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, fonts, radii, shadows } from '../lib/theme';

type Variant = 'default' | 'gold' | 'ghost' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  flex?: number;
  small?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'default', flex, small, disabled, style }: Props) {
  const height = small ? 34 : 48;
  const content = (
    <Text
      style={[
        styles.label,
        small && styles.labelSm,
        variant === 'gold' && styles.labelOnGold,
        variant === 'danger' && styles.labelDanger,
      ]}
    >
      {title}
    </Text>
  );

  if (variant === 'gold') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          { flex, height, opacity: disabled ? 0.5 : pressed ? 0.9 : 1 },
          shadows.primaryButton,
          style,
        ]}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, { height }]}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { flex, height, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        variant === 'default' && styles.defaultVariant,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.input,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  defaultVariant: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: '#F0D5D5',
  },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.text,
  },
  labelSm: { fontSize: 11.5 },
  labelOnGold: { color: '#fff', fontFamily: fonts.sansExtrabold },
  labelDanger: { color: colors.danger },
});
