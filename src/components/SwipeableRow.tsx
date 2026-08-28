import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../lib/theme';

const DELETE_WIDTH = 84;
const SWIPE_OPEN_THRESHOLD = -40;

export function SwipeableRow({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const openRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        const base = openRef.current ? -DELETE_WIDTH : 0;
        const next = Math.min(0, Math.max(-DELETE_WIDTH - 20, base + g.dx));
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const base = openRef.current ? -DELETE_WIDTH : 0;
        const end = base + g.dx;
        const shouldOpen = end < SWIPE_OPEN_THRESHOLD;
        openRef.current = shouldOpen;
        Animated.spring(translateX, {
          toValue: shouldOpen ? -DELETE_WIDTH : 0,
          useNativeDriver: true,
          bounciness: 0,
        }).start();
      },
    })
  ).current;

  const closeAndDelete = () => {
    Animated.timing(translateX, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      openRef.current = false;
      onDelete();
    });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.deleteBg}>
        <Animated.View style={{ opacity: translateX.interpolate({ inputRange: [-DELETE_WIDTH, 0], outputRange: [1, 0] }) }}>
          <Text style={styles.deleteLabel} onPress={closeAndDelete}>
            Delete
          </Text>
        </Animated.View>
      </View>
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radii.lineBlock, overflow: 'hidden' },
  deleteBg: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_WIDTH,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    // Matches the parent's clip radius on the right edge — on
    // react-native-web, overflow:hidden's clip can leave a hairline gap at
    // the curve that lets an unrounded absolute child bleed through.
    borderTopRightRadius: radii.lineBlock,
    borderBottomRightRadius: radii.lineBlock,
  },
  deleteLabel: {
    color: '#fff',
    fontFamily: fonts.sansBold,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
});
