// SoloFindItScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableWithoutFeedback,
    StyleSheet,
    Dimensions,
    Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../components/Header';

const SoloFindItScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { gameInfoList } = route.params; // 서버에서 받아온 10개의 라운드 이미지 정보 배열

    // 현재 라운드 (0 ~ 9)
    const [currentRound, setCurrentRound] = useState<number>(0);
    // 각 라운드의 정답 여부를 저장 (true: 정답, false: 오답)
    const [results, setResults] = useState<boolean[]>([]);
    // 아이템 초기값
    const [life, setLife] = useState<number>(3);
    const [timerItems, setTimerItems] = useState<number>(2);
    const [hintItems, setHintItems] = useState<number>(2);

    // 터치 좌표와 정답 좌표 사이의 허용 오차 (픽셀 단위)
    const THRESHOLD = 30;

    // 이미지 터치 시 호출: event.nativeEvent.locationX, locationY 사용
    const handleImagePress = (event: any) => {
        const { locationX, locationY } = event.nativeEvent;
        const currentGameInfo = gameInfoList[currentRound];
        const correctPositions = currentGameInfo.correctPositions; // 예: [{ x: number, y: number }, ...]

        let isCorrect = false;
        for (let pos of correctPositions) {
            const dx = pos.x - locationX;
            const dy = pos.y - locationY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < THRESHOLD) {
                isCorrect = true;
                break;
            }
        }

        Alert.alert(isCorrect ? "정답!" : "오답!", isCorrect ? "정답입니다." : "오답입니다.");
        setResults(prev => [...prev, isCorrect]);

        if (currentRound < gameInfoList.length - 1) {
            setTimeout(() => {
                setCurrentRound(prev => prev + 1);
            }, 1000);
        } else {
            // 10라운드 모두 완료 시 결과 화면으로 이동
        }
    };

    return (
        <View style={styles.container}>
            {/* 상단 헤더 */}
            <Header />

            {/* 게임 화면 영역 */}
            <View style={styles.gameScreen}>
                <Text style={styles.roundText}>
                    Round {currentRound + 1} / {gameInfoList.length}
                </Text>
                <TouchableWithoutFeedback onPress={handleImagePress}>
                    <Image
                        source={{ uri: gameInfoList[currentRound].normalUrl }}
                        style={styles.image}
                    />
                </TouchableWithoutFeedback>
                {/* 타이머 바 (예시: 고정 타이머 바, 실제 타이머 애니메이션은 추가 구현 필요) */}
                <View style={styles.timerBarContainer}>
                    <View style={styles.timerBar} />
                </View>
                {/* 비정상 이미지 (선택사항, 서버 응답에 abnormalUrl이 있을 경우) */}
                {gameInfoList[currentRound].abnormalUrl && (
                    <Image
                        source={{ uri: gameInfoList[currentRound].abnormalUrl }}
                        style={styles.abnormalImage}
                    />
                )}
            </View>

            {/* 아이템 영역 */}
            <View style={styles.itemContainer}>
                <View style={styles.item}>
                    <Text style={styles.itemLabel}>목숨</Text>
                    <Text style={styles.itemCount}>{life}</Text>
                </View>
                <View style={styles.item}>
                    <Text style={styles.itemLabel}>타이머</Text>
                    <Text style={styles.itemCount}>{timerItems}</Text>
                </View>
                <View style={styles.item}>
                    <Text style={styles.itemLabel}>힌트</Text>
                    <Text style={styles.itemCount}>{hintItems}</Text>
                </View>
            </View>
        </View>
    );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    gameScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roundText: {
        fontSize: 24,
        marginVertical: 10,
        textAlign: 'center',
    },
    image: {
        width: width,
        height: width * 0.75, // 예: 4:3 비율
        resizeMode: 'contain',
    },
    timerBarContainer: {
        width: width * 0.9,
        height: 10,
        backgroundColor: '#ddd',
        marginVertical: 10,
    },
    timerBar: {
        flex: 1,
        backgroundColor: 'green',
    },
    abnormalImage: {
        width: width,
        height: width * 0.75,
        resizeMode: 'contain',
        marginTop: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        backgroundColor: '#f5f5f5',
    },
    item: {
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemCount: {
        fontSize: 16,
        marginVertical: 5,
    },
});

export default SoloFindItScreen;
