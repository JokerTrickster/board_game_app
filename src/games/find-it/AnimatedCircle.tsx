import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

interface AnimatedCircleProps {
    x: number;
    y: number;
}

const AnimatedCircle: React.FC<AnimatedCircleProps> = ({ x, y }) => {
    const scale = useRef(new Animated.Value(0.5)).current; // 🔥 시작 크기 변경
    const opacity = useRef(new Animated.Value(0)).current; // ✅ 투명도 애니메이션

    useEffect(() => {
        Animated.parallel([
            Animated.timing(scale, {
                toValue: 1,
                duration: 300, // ⏳ 더 빠른 애니메이션 (기존 500ms → 300ms)
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.circle,
                {
                    left: x - 20, // 🔥 중심 정렬
                    top: y - 20,
                    transform: [{ scale }],
                    opacity,
                },
            ]}
        />
    );
};

const styles = StyleSheet.create({
    circle: {
        position: 'absolute',
        width: 40, // 🔥 더 커진 원
        height: 40,
        borderRadius: 20,
        backgroundColor: 'transparent', // 🔥 내부 투명
        borderWidth: 3, // 🔥 더 두꺼운 테두리
        borderColor: 'red', // 🔥 빨간색 테두리
    },
});

export default AnimatedCircle;
