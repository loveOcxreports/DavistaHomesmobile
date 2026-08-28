import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii, shadows } from '../lib/theme';

export function Toast({ message }: { message: string }) {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 20, duration: 150, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [message, translateY, opacity]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.toast, shadows.toast, { transform: [{ translateY }], opacity }]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 90,
    alignSelf: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: radii.listCard,
    backgroundColor: colors.primaryDeep,
  },
  text: {
    color: '#fff',
    fontFamily: fonts.sansExtrabold,
    fontSize: 11.5,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
});
