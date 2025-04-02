import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export type AnimatedXProps = {
  x: number;
  y: number;
};

const AnimatedX: React.FC<AnimatedXProps> = ({ x, y }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    position: 'absolute',
    left: x - 15,
    top: y - 15,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Animated.View style={[styles.line, styles.rotate45]} />
      <Animated.View style={[styles.line, styles.rotate135]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 30,
    height: 30,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    position: 'absolute',
    width: 30,
    height: 3,
    backgroundColor: 'red',
  },
  rotate45: {
    transform: [{ rotate: '45deg' }],
  },
  rotate135: {
    transform: [{ rotate: '135deg' }],
  },
});

export default AnimatedX; 