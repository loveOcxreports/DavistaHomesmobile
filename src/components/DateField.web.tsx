// Web build of DateField — Metro/react-native-web picks this file over
// DateField.tsx automatically on the web platform. Native date pickers
// (@react-native-community/datetimepicker) have no web implementation, so
// this uses a plain <input type="date"> instead, which every browser
// already renders as a proper native date picker.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../lib/theme';

type Props = {
  label: string;
  value: string; // ISO yyyy-mm-dd, '' when unset
  onChange: (iso: string) => void;
};

export function DateField({ label, value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.control}>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={webInputStyle}
        />
      </View>
    </View>
  );
}

const webInputStyle: React.CSSProperties = {
  border: 'none',
  outline: 'none',
  background: 'transparent',
  width: '100%',
  height: '100%',
  fontSize: 16,
  color: colors.text,
  fontFamily: 'inherit',
};

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, flexBasis: '45%', gap: 5 },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  control: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radii.input,
    backgroundColor: colors.surfaceTint,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
});
