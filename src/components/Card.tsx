import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../lib/theme';

type Props = {
  title: string;
  dotColor: string;
  readout?: string;
  readoutBig?: boolean;
  children: React.ReactNode;
};

export function Card({ title, dotColor, readout, readoutBig, children }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.clip}>
        <View style={styles.head}>
          <View style={[styles.dot, { backgroundColor: dotColor, shadowColor: dotColor }]} />
          <Text style={styles.title}>{title}</Text>
          {readout ? (
            <Text style={[styles.readout, readoutBig && styles.readoutBig]}>{readout}</Text>
          ) : null}
        </View>
        <View style={styles.body}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Border and corner-clipping live on separate elements — combining a
  // border with overflow:hidden on the same node leaves a faint color seam
  // at the rounded corner on react-native-web (harmless on native).
  card: {
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.editorCard,
  },
  clip: {
    // Inset 1px inside `card`'s border, so its radius must be 1px smaller
    // to nest concentrically — using the same radius as the outer border
    // leaves a sliver where the two curves don't align (visible as a
    // hairline color seam on react-native-web; native clips it invisibly).
    borderRadius: radii.editorCard - 1,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.canvasAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.text2,
  },
  readout: {
    marginLeft: 'auto',
    fontFamily: fonts.monoBold,
    fontSize: 10.5,
    color: colors.primary,
  },
  readoutBig: {
    fontFamily: fonts.monoExtrabold,
    fontSize: 11.5,
    color: colors.text,
  },
  body: { padding: 14 },
});
