import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withTiming,
    withSpring,
    Easing
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedCircleProps {
    x: number;
    y: number;
    startAngle?: number; // 시작 각도를 props로 받을 수 있도록 추가
}

const CircleAnimation: React.FC<AnimatedCircleProps> = ({ x, y, startAngle = -270 }) => {
    const CIRCLE_LENGTH = Math.PI * 40; // 원의 둘레 (반지름 20)
    const progress = useSharedValue(0);
    const strokeOffset = useSharedValue(CIRCLE_LENGTH);

    useEffect(() => {
        // 원이 그려지는 애니메이션
        strokeOffset.value = withTiming(0, {
            duration: 1000,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        // 페이드인 애니메이션
        progress.value = withSpring(1, {
            damping: 10,
            stiffness: 80,
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ scale: progress.value }],
    }));

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: strokeOffset.value,
    }));

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    left: x - 20,
                    top: y - 20,
                },
                animatedStyle,
            ]}
        >
            <Svg width={40} height={40}>
                <AnimatedCircle
                    cx={20}
                    cy={20}
                    r={18}
                    stroke="red"
                    strokeWidth={4}
                    fill="transparent"
                    strokeDasharray={`${CIRCLE_LENGTH}, ${CIRCLE_LENGTH}`}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    transform={`rotate(${startAngle}, 20, 20)`} // 회전 중심점(20, 20)을 기준으로 회전
                />
            </Svg>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 40,
        height: 40,
    },
});

export default CircleAnimation;
