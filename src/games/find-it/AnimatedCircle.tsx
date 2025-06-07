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
    isUser1?: boolean; // 유저 구분을 위한 prop 추가
}

const CircleAnimation: React.FC<AnimatedCircleProps> = ({ 
    x, 
    y, 
    startAngle = -270,
    isUser1 = true 
}) => {
    const CIRCLE_LENGTH = Math.PI * 40;
    const progress = useSharedValue(0);
    const strokeOffset = useSharedValue(CIRCLE_LENGTH);

    // 유저별 색상 설정 - fill 제거
    const strokeColor = isUser1 ? '#00FF00' : '#0000FF';

    useEffect(() => {
        strokeOffset.value = withTiming(0, {
            duration: 1000,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

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
                    stroke={strokeColor}
                    strokeWidth={4}
                    fill="transparent"  // 배경색 제거
                    strokeDasharray={`${CIRCLE_LENGTH}, ${CIRCLE_LENGTH}`}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    transform={`rotate(${startAngle}, 20, 20)`}
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
