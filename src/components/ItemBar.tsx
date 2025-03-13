import React, { FC } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

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
                <View style={styles.itemContainer}>
                    <View style={styles.iconWrapper}>
                        <Image source={require('../assets/icons/find-it/heart.png')} style={styles.icon} />
                        <Text style={styles.countBadge}>{life}</Text>
                    </View>
                    <Text style={styles.itemLabel}>남은 생명</Text>
                </View>
                {/* 타이머 아이템 */}
                <TouchableOpacity style={styles.itemContainer} onPress={onTimerStopPress}>
                    <View style={styles.iconWrapper}>
                        <Image source={require('../assets/icons/find-it/timer.png')} style={styles.icon} />
                        <Text style={styles.countBadge}>{timerStopCount}</Text>
                    </View>
                    <Text style={styles.itemLabel}>5초 멈춤</Text>
                </TouchableOpacity>
                {/* 힌트 아이템 */}
                <TouchableOpacity style={styles.itemContainer} onPress={onHintPress}>
                    <View style={styles.iconWrapper}>
                        <Image source={require('../assets/icons/find-it/hint.png')} style={styles.icon} />
                        <Text style={styles.countBadge}>{hintCount}</Text>
                    </View>
                    <Text style={styles.itemLabel}>힌트</Text>
                </TouchableOpacity>
            </View>
            {/* 우측 그룹: 확대, 축소 */}
            <View style={styles.groupContainer}>
                <TouchableOpacity style={styles.itemContainer} onPress={onZoomInPress}>
                    <Image source={require('../assets/icons/find-it/zoom_out.png')} style={styles.icon} />
                    <Text style={styles.itemLabel}>확대</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.itemContainer} onPress={onZoomOutPress}>
                    <Image source={require('../assets/icons/find-it/zoom_in.png')} style={styles.icon} />
                    <Text style={styles.itemLabel}>축소</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ItemBar;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#f2f2f2',
    },
    groupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
        marginRight:20,
    },
    itemContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
    },
    iconWrapper: {
        position: 'relative',
    },
    icon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    // 숫자(카운트)를 아이콘 위에 배치하는 배지 스타일
    countBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: 'red',
        color: '#fff',
        fontSize: 10,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    // 아이콘 아래에 표시할 라벨 텍스트
    itemLabel: {
        marginTop: 4,
        fontSize: 12,
        color: '#000',
    },
});
