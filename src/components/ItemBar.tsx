// ItemBar.tsx
import React, { FC, memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from './styles/ItemBarStyles'; // 스타일 파일 import

interface ItemBarProps {
    /** 남은 생명 수 */
    life: number;
    /** 5초 멈춤 아이템 수 */
    timerStopCount: number;
    /** 힌트 아이템 수 */
    hintCount: number;
    /** 확대 버튼 클릭 핸들러 */
    onZoomInPress: () => void;
    /** 축소 버튼 클릭 핸들러 */
    onZoomOutPress: () => void;
    /** 5초 멈춤 아이템 사용 핸들러 */
    onTimerStopPress: () => void;
    /** 힌트 사용 핸들러 */
    onHintPress: () => void;
}

/**
 * 좌측 그룹은 생명, 타이머, 힌트 아이템을 표시하며,
 * 아이콘 위에 숫자(카운트)를 배지처럼 겹쳐서 표시하고,
 * 아이콘 아래에는 라벨 텍스트를 표시합니다.
 * 우측 그룹은 확대/축소 아이템을 표시합니다.
 */
const ItemBar: FC<ItemBarProps> = ({
    life,
    timerStopCount,
    hintCount,
    onZoomInPress,
    onZoomOutPress,
    onTimerStopPress,
    onHintPress,
}) => {
    return (
        <View style={styles.container}>
            {/* 좌측 그룹: 생명, 타이머, 힌트 */}
            <View style={styles.groupContainer}>
                {/* 생명 아이템 (눌림 없이 표시) */}
                <View
                    style={styles.itemContainer}
                    accessible={true}
                    accessibilityRole="text"
                    accessibilityLabel={`남은 생명 ${life}개`}
                    accessibilityHint="현재 게임에서 남은 생명의 개수입니다"
                >
                    <View style={styles.iconWrapper}>
                        <Image
                            source={require('../assets/icons/find-it/heart.png')}
                            style={styles.icon}
                            accessibilityIgnoresInvertColors={true}
                        />
                        <Text style={styles.countBadge}>{life}</Text>
                    </View>
                    <Text style={styles.itemLabel}>남은 생명</Text>
                </View>
                {/* 타이머 아이템 */}
                <TouchableOpacity
                    style={styles.itemContainer}
                    onPress={onTimerStopPress}
                    accessibilityRole="button"
                    accessibilityLabel={`5초 멈춤 아이템 ${timerStopCount}개 남음`}
                    accessibilityHint={timerStopCount > 0 ? '터치하여 타이머를 5초간 멈춥니다' : '사용할 수 있는 타이머 멈춤 아이템이 없습니다'}
                    disabled={timerStopCount === 0}
                >
                    <View style={styles.iconWrapper}>
                        <Image
                            source={require('../assets/icons/find-it/timer.png')}
                            style={styles.icon}
                            accessibilityIgnoresInvertColors={true}
                        />
                        <Text style={styles.countBadge}>{timerStopCount}</Text>
                    </View>
                    <Text style={styles.itemLabel}>5초 멈춤</Text>
                </TouchableOpacity>
                {/* 힌트 아이템 */}
                <TouchableOpacity
                    style={styles.itemContainer}
                    onPress={onHintPress}
                    accessibilityRole="button"
                    accessibilityLabel={`힌트 아이템 ${hintCount}개 남음`}
                    accessibilityHint={hintCount > 0 ? '터치하여 정답 위치에 힌트를 표시합니다' : '사용할 수 있는 힌트 아이템이 없습니다'}
                    disabled={hintCount === 0}
                >
                    <View style={styles.iconWrapper}>
                        <Image
                            source={require('../assets/icons/find-it/hint.png')}
                            style={styles.icon}
                            accessibilityIgnoresInvertColors={true}
                        />
                        <Text style={styles.countBadge}>{hintCount}</Text>
                    </View>
                    <Text style={styles.itemLabel}>힌트</Text>
                </TouchableOpacity>
            </View>
            {/* 우측 그룹: 확대, 축소 */}
            <View style={styles.groupContainer}>
                <TouchableOpacity
                    style={styles.itemContainer}
                    onPress={onZoomInPress}
                    accessibilityRole="button"
                    accessibilityLabel="확대"
                    accessibilityHint="터치하여 게임 이미지를 확대합니다"
                >
                    <Image
                        source={require('../assets/icons/find-it/zoom_out.png')}
                        style={styles.icon}
                        accessibilityIgnoresInvertColors={true}
                    />
                    <Text style={styles.itemLabel}>확대</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.itemContainer}
                    onPress={onZoomOutPress}
                    accessibilityRole="button"
                    accessibilityLabel="축소"
                    accessibilityHint="터치하여 게임 이미지를 축소합니다"
                >
                    <Image
                        source={require('../assets/icons/find-it/zoom_in.png')}
                        style={styles.icon}
                        accessibilityIgnoresInvertColors={true}
                    />
                    <Text style={styles.itemLabel}>축소</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Memoize ItemBar to prevent re-renders when props haven't changed
// This is especially important since it's rendered frequently during games
export default memo(ItemBar, (prevProps, nextProps) => {
    return (
        prevProps.life === nextProps.life &&
        prevProps.timerStopCount === nextProps.timerStopCount &&
        prevProps.hintCount === nextProps.hintCount &&
        prevProps.onZoomInPress === nextProps.onZoomInPress &&
        prevProps.onZoomOutPress === nextProps.onZoomOutPress &&
        prevProps.onTimerStopPress === nextProps.onTimerStopPress &&
        prevProps.onHintPress === nextProps.onHintPress
    );
});
