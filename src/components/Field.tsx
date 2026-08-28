import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radii } from '../lib/theme';

type Props = TextInputProps & {
  label: string;
  spanFull?: boolean;
};

export function Field({ label, spanFull, style, ...inputProps }: Props) {
  return (
    <View style={[styles.wrap, spanFull && styles.spanFull]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.muted2}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, flexBasis: '45%', gap: 5 },
  spanFull: { flexBasis: '100%' },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radii.input,
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
  },
});
