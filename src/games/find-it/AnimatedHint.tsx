import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withTiming,
    withDelay,
    Easing
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AnimatedHintProps {
    x: number;
    y: number;
}

const AnimatedHint: React.FC<AnimatedHintProps> = ({ x, y }) => {
    const SIZE = 40;
    const progress = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
        // 체크 표시 그리기 애니메이션
        progress.value = withTiming(1, {
            duration: 600,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });

        // 페이드인 애니메이션
        opacity.value = withTiming(1, {
            duration: 200,
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const animatedProps = useAnimatedProps(() => {
        // 체크 표시의 경로를 계산
        const currentProgress = progress.value;
        
        // 시작점
        const startX = SIZE * 0.2;
        const startY = SIZE * 0.5;
        
        // 중간점 (꺾이는 지점)
        const middleX = SIZE * 0.4;
        const middleY = SIZE * 0.7;
        
        // 끝점
        const endX = SIZE * 0.8;
        const endY = SIZE * 0.3;

        // 현재 진행도에 따라 경로 계산
        let d = `M ${startX} ${startY}`;
        
        if (currentProgress <= 0.5) {
            // 첫 번째 선 그리기 (시작점에서 중간점까지)
            const currentX = startX + (middleX - startX) * (currentProgress * 2);
            const currentY = startY + (middleY - startY) * (currentProgress * 2);
            d += ` L ${currentX} ${currentY}`;
        } else {
            // 첫 번째 선 완성
            d += ` L ${middleX} ${middleY}`;
            
            // 두 번째 선 그리기 (중간점에서 끝점까지)
            const progress2 = (currentProgress - 0.5) * 2;
            const currentX = middleX + (endX - middleX) * progress2;
            const currentY = middleY + (endY - middleY) * progress2;
            d += ` L ${currentX} ${currentY}`;
        }

        return {
            d: d
        };
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    left: x - SIZE/2,
                    top: y - SIZE/2 - 15,
                },
                animatedStyle,
            ]}
        >
            <Svg width={SIZE} height={SIZE}>
                <AnimatedPath
                    animatedProps={animatedProps}
                    stroke="#7FD858"
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </Svg>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 45,
        height: 45,
    },
});

export default AnimatedHint;
