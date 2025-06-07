import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withTiming,
    withDelay,
    Easing
} from 'react-native-reanimated';

const AnimatedLine = Animated.createAnimatedComponent(Line);

interface AnimatedXProps {
    x: number;
    y: number;
    isUser1?: boolean;
}

const AnimatedX: React.FC<AnimatedXProps> = ({ x, y, isUser1 = true }) => {
    const SIZE = 30;
    const progress1 = useSharedValue(0);
    const progress2 = useSharedValue(0);
    const opacity = useSharedValue(0);
    
    // 유저별 색상 설정 - 배경색 제거
    const strokeColor = isUser1 ? '#FF0000' : '#800080'; // 빨간색 vs 보라색

    useEffect(() => {
        // 애니메이션 시작
        opacity.value = withTiming(1, { duration: 200 });
        progress1.value = withTiming(1, {
            duration: 300,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        progress2.value = withDelay(200,
            withTiming(1, {
                duration: 300,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            })
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const line1Props = useAnimatedProps(() => ({
        x2: SIZE * progress1.value,
        y2: SIZE * progress1.value,
    }));

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
                    left: x - 15, 
                    top: y - 15
                },
                animatedStyle
            ]}
        >
            <Svg width={SIZE} height={SIZE}>
                <AnimatedLine
                    x1={0}
                    y1={0}
                    stroke={strokeColor}
                    strokeWidth={6}
                    strokeLinecap="round"
                    animatedProps={line1Props}
                />
                <AnimatedLine
                    stroke={strokeColor}
                    strokeWidth={6}
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
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default AnimatedX; 