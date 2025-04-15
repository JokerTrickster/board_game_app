import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withTiming,
    withSequence,
    withDelay,
    Easing
} from 'react-native-reanimated';

const AnimatedLine = Animated.createAnimatedComponent(Line);

interface AnimatedXProps {
    x: number;
    y: number;
}

const AnimatedX: React.FC<AnimatedXProps> = ({ x, y }) => {
    const SIZE = 35; // X 표시의 크기
    const progress1 = useSharedValue(0);
    const progress2 = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        // 첫 번째 선 그리기 (좌상단 → 우하단)
        progress1.value = withTiming(1, {
            duration: 300,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        // 두 번째 선 그리기 (우상단 → 좌하단)
        progress2.value = withDelay(200,
            withTiming(1, {
                duration: 300,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            })
        );

        // 전체 opacity 애니메이션
        opacity.value = withTiming(1, {
            duration: 200,
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    // 첫 번째 선 애니메이션 (좌상단 → 우하단)
    const line1Props = useAnimatedProps(() => ({
        x2: SIZE * progress1.value,
        y2: SIZE * progress1.value,
    }));

    // 두 번째 선 애니메이션 (우상단 → 좌하단)
    const line2Props = useAnimatedProps(() => ({
        x1: SIZE,
        y1: 0,
        x2: SIZE - (SIZE * progress2.value),
        y2: SIZE * progress2.value,
    }));

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    left: x - SIZE/2,
                    top: y - SIZE/2,
                },
                animatedStyle,
            ]}
        >
            <Svg width={SIZE} height={SIZE}>
                {/* 첫 번째 선 (좌상단 → 우하단) */}
                <AnimatedLine
                    x1={0}
                    y1={0}
                    x2={0}
                    y2={0}
                    stroke="#4B8BFF"
                    strokeWidth={5}
                    strokeLinecap="round"
                    animatedProps={line1Props}
                />
                {/* 두 번째 선 (우상단 → 좌하단) */}
                <AnimatedLine
                    stroke="#4B8BFF"
                    strokeWidth={5}
                    strokeLinecap="round"
                    animatedProps={line2Props}
                />
            </Svg>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 35,
        height: 35,
    },
});

export default AnimatedX; 