// SoloFindItScreen.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableWithoutFeedback,
    StyleSheet,
    Dimensions,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../components/Header';
import { styles } from './ReactSoloFindItStyles';
import Animated, { runOnJS, useSharedValue, useAnimatedStyle, withTiming, useDerivedValue } from 'react-native-reanimated'; // ✅ React Native의 Animated 제거
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { StackNavigationProp } from '@react-navigation/stack'; // ✅ 네비게이션 타입 import
import { RootStackParamList } from '../../navigation/navigationTypes';
interface Marker {
    id: string;
    x: number;
    y: number;
}

const SoloFindItScreen: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'SoloFindIt'>>();
const route = useRoute<any>();
    const { gameInfoList } = route.params; // 서버에서 받아온 10개의 라운드 이미지 정보 배열
    const imageRef = useRef<View>(null);

    // 현재 라운드 (0 ~ 9)
    const [currentRound, setCurrentRound] = useState<number>(0);
    // 정답(동그라미) 마커는 그대로 유지, 오답(엑스) 마커는 3초 후 제거
    const [correctMarkers, setCorrectMarkers] = useState<Marker[]>([]);
    const [wrongMarkers, setWrongMarkers] = useState<Marker[]>([]);
    // 목숨, 아이템 초기값
    const [life, setLife] = useState<number>(3);
    const [timerItems, setTimerItems] = useState<number>(2);
    const [hintItems, setHintItems] = useState<number>(2);

    // 한 라운드에 필요한 정답 클릭 개수 (예제에서는 5개)
    const TARGET_CORRECT_COUNT = 5;
    // 터치 좌표와 정답 좌표 사이의 허용 오차 (픽셀 단위)
    const THRESHOLD = 30;

    // 타이머바 애니메이션 (전체 진행률: 1 → 0)
    const timerProgress = useSharedValue(1);
    const { width } = Dimensions.get('window');
    // 타이머바 컨테이너의 너비: 화면 너비의 90%
    const TIMER_BAR_WIDTH = width * 0.9;

    const animatedTimerStyle = useAnimatedStyle(() => ({
        width: TIMER_BAR_WIDTH * timerProgress.value,
    }));
    const IMAGE_FRAME_WIDTH = 400; // 이미지 프레임 크기 (고정)
    const IMAGE_FRAME_HEIGHT = 255;

    // ----------------- 확대/축소 관련 (핀치, 팬, 버튼) -----------------
    const MAX_SCALE = 2.5;
    const MIN_SCALE = 1;
    const scale = useSharedValue(1);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const lastOffsetX = useSharedValue(0);
    const lastOffsetY = useSharedValue(0);
    const lastScale = useSharedValue(1);
    const derivedScale = useDerivedValue(() => scale.value);
    const derivedOffsetX = useDerivedValue(() => offsetX.value);
    const derivedOffsetY = useDerivedValue(() => offsetY.value);

    
    // 핀치 제스처: 시작 시 현재 스케일을 저장하고 업데이트
    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            scale.value = Math.min(Math.max(event.scale, MIN_SCALE), MAX_SCALE);
        });


    const panGesture = Gesture.Pan()
        .onStart(() => {
            lastOffsetX.value = offsetX.value;
            lastOffsetY.value = offsetY.value;
        })
        .onUpdate((event) => {
            'worklet';
            const scaledWidth = IMAGE_FRAME_WIDTH * scale.value;
            const scaledHeight = IMAGE_FRAME_HEIGHT * scale.value;
            const maxOffsetX = scaledWidth > IMAGE_FRAME_WIDTH ? (scaledWidth - IMAGE_FRAME_WIDTH) / 2 : 0;
            const maxOffsetY = scaledHeight > IMAGE_FRAME_HEIGHT ? (scaledHeight - IMAGE_FRAME_HEIGHT) / 2 : 0;

            const newOffsetX = lastOffsetX.value + event.translationX;
            const newOffsetY = lastOffsetY.value + event.translationY;

            offsetX.value = Math.max(-maxOffsetX, Math.min(newOffsetX, maxOffsetX));
            offsetY.value = Math.max(-maxOffsetY, Math.min(newOffsetY, maxOffsetY));
        })
        .onEnd(() => {
            adjustOffset();
        });

    const adjustOffset = () => {
        'worklet';
        const scaledWidth = IMAGE_FRAME_WIDTH * scale.value;
        const scaledHeight = IMAGE_FRAME_HEIGHT * scale.value;

        // 허용 가능한 최대 offset (양쪽 각각)
        const maxOffsetX = scaledWidth > IMAGE_FRAME_WIDTH ? (scaledWidth - IMAGE_FRAME_WIDTH) / 2 : 0;
        const maxOffsetY = scaledHeight > IMAGE_FRAME_HEIGHT ? (scaledHeight - IMAGE_FRAME_HEIGHT) / 2 : 0;

        offsetX.value = withTiming(Math.max(-maxOffsetX, Math.min(offsetX.value, maxOffsetX)), { duration: 200 });
        offsetY.value = withTiming(Math.max(-maxOffsetY, Math.min(offsetY.value, maxOffsetY)), { duration: 200 });
    };

    const animatedImageStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: offsetX.value },
            { translateY: offsetY.value },
            { scale: scale.value },
        ],
    }));
    
    // 타이머 종료 시 호출되는 함수
    const handleTimerFinish = useCallback(() => {
        // 아직 정답 횟수를 달성하지 못한 경우 타임 아웃 처리
        if (correctMarkers.length < TARGET_CORRECT_COUNT) {
            Alert.alert("시간 종료", "타임 아웃되었습니다.");
            // 목숨 차감
            setLife((prev) => {
                const newLife = prev - 1;
                if (newLife <= 0) {
                    // 추가: 게임 종료 화면으로 이동하는 로직 작성 가능
                    navigation.navigate('Home');

                }
                return newLife;
            });
        }
        // 라운드 전환 (현재 라운드가 마지막이 아니라면)
        if (currentRound < gameInfoList.length - 1) {
            setCurrentRound((prev) => prev + 1);
            // 다음 라운드를 위해 마커 초기화
            setCorrectMarkers([]);
            setWrongMarkers([]);
            // 확대/축소 초기화
            scale.value = withTiming(1, { duration: 200 });
            offsetX.value = withTiming(0, { duration: 200 });
            offsetY.value = withTiming(0, { duration: 200 });
        } else {
            // 추가: 결과 화면으로 이동하는 로직 작성 가능
            navigation.navigate('Home');

        }
    }, [correctMarkers.length, currentRound, gameInfoList.length, scale, offsetX, offsetY]);

    // 매 라운드 시작 시 60초 타이머바 애니메이션 실행
    useEffect(() => {
        timerProgress.value = 1; // 초기화
        timerProgress.value = withTiming(0, { duration: 60000 }, (finished) => {
            if (finished) {
                runOnJS(handleTimerFinish)();
            }
        });
    }, [currentRound, handleTimerFinish, timerProgress]);

    // 오답 마커 제거 함수 (3초 후)
    const scheduleWrongMarkerRemoval = useCallback((id: string) => {
        setTimeout(() => {
            setWrongMarkers((prev) => prev.filter((marker) => marker.id !== id));
        }, 3000);
    }, []);

    // 이미지 터치 핸들러
    const handleImagePress = (event: any) => {
        // 터치 좌표 (이미지 내 상대 좌표)
        const { locationX, locationY } = event.nativeEvent;
        const currentGameInfo = gameInfoList[currentRound];
        const correctPositions: Marker[] = currentGameInfo.correctPositions; // 예: [{ x: number, y: number }, ...]

        // 이미 해당 좌표에 대해 정답 마커가 등록되었으면 중복처리 방지
        const alreadyHit = correctMarkers.some((marker) => {
            const dx = marker.x - locationX;
            const dy = marker.y - locationY;
            return Math.sqrt(dx * dx + dy * dy) < THRESHOLD;
        });
        if (alreadyHit) return;

        // 올바른 위치에 클릭했는지 체크
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

        // 마커 객체 생성 (고유 id 부여)
        const markerId = Date.now().toString() + Math.random().toString();
        const newMarker: Marker = { id: markerId, x: locationX, y: locationY };

        if (isCorrect) {
            // 정답이면 동그라미(⭕) 표시 (영구적으로 유지)
            setCorrectMarkers((prev) => [...prev, newMarker]);
            // 정답 5개 달성 시 다음 라운드 진행
            if (correctMarkers.length + 1 >= TARGET_CORRECT_COUNT) {
                setTimeout(() => {
                    if (currentRound < gameInfoList.length - 1) {
                        setCurrentRound((prev) => prev + 1);
                        // 다음 라운드를 위해 마커 초기화
                        setCorrectMarkers([]);
                        setWrongMarkers([]);
                        // 확대/축소 초기화
                        scale.value = withTiming(1, { duration: 200 });
                        offsetX.value = withTiming(0, { duration: 200 });
                        offsetY.value = withTiming(0, { duration: 200 });
                    } else {
                        Alert.alert("게임 종료", "모든 라운드를 완료했습니다!");
                        // 추가: 결과 화면으로 이동하거나 게임 종료 처리
                        navigation.navigate('Home');

                    }
                }, 1000);
            }
        } else {
            // 오답이면 엑스(❌) 표시 (3초 후 제거)
            setWrongMarkers((prev) => [...prev, newMarker]);
            scheduleWrongMarkerRemoval(markerId);
            // 목숨 차감
            setLife((prev) => {
                const newLife = prev - 1;
                if (newLife <= 0) {
                    Alert.alert("게임 종료", "목숨을 모두 잃었습니다!");
                    navigation.navigate('Home');
                }
                return newLife;
            });
        }
    };

    const handleImageClick = useCallback((event: any) => {
        'worklet';
        // transform 보정 없이 원본 좌표 사용
        const { locationX, locationY } = event.nativeEvent;
        const finalX = parseFloat(locationX.toFixed(2));
        const finalY = parseFloat(locationY.toFixed(2));

        runOnJS(sendClickToServer)(finalX, finalY);
        console.log(`📌 [클릭 좌표] (${finalX}, ${finalY})`);

    }, []);

    const sendClickToServer = (x: number, y: number) => {
        console.log(`📌 클릭한 좌표: (${x}, ${y})`);
    };
    // 이미지를 렌더링할 때 정답/오답 마커 오버레이 컴포넌트 사용
    // (각 이미지 컨테이너에 확대/축소 제스처와 애니메이션 스타일을 적용)
    const renderImageWithMarkers = (uri: string) => {
        return (
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
                    <TouchableWithoutFeedback onPress={handleImagePress}>
                        <Image source={{ uri }} style={styles.image} />
                    </TouchableWithoutFeedback>
                    {correctMarkers.map((marker) => (
                        <View
                            key={marker.id}
                            style={[
                                styles.marker,
                                styles.correctMarker,
                                { left: marker.x - 15, top: marker.y - 15 },
                            ]}
                        >
                            <Text style={styles.markerText}>⭕</Text>
                        </View>
                    ))}
                    {wrongMarkers.map((marker) => (
                        <View
                            key={marker.id}
                            style={[
                                styles.marker,
                                styles.wrongMarker,
                                { left: marker.x - 15, top: marker.y - 15 },
                            ]}
                        >
                            <Text style={styles.markerText}>❌</Text>
                        </View>
                    ))}
                </Animated.View>
            </GestureDetector>
        );
    };

    // 확대/축소 버튼 핸들러 (버튼 클릭 시 스케일 조정)
    const handleZoomIn = () => {
        scale.value = withTiming(Math.min(MAX_SCALE, scale.value + 0.5), { duration: 200 });
    };

    const handleZoomOut = () => {
        scale.value = withTiming(Math.max(MIN_SCALE, scale.value - 0.5), { duration: 200 });
    };
    const animatedStyle = useAnimatedStyle(() => ({
        width: IMAGE_FRAME_WIDTH,
        height: IMAGE_FRAME_HEIGHT,
        overflow: 'hidden',
        transform: [
            { translateX: derivedOffsetX.value },
            { translateY: derivedOffsetY.value },
            { scale: derivedScale.value },
        ],
    }));


    return (
        <View style={styles.container}>
            {/* 상단 헤더 */}
            <Header />
            <Text style={styles.roundText}>
                Round {currentRound + 1} / {gameInfoList.length}
            </Text>
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                <View style={[styles.imageContainer, { width: IMAGE_FRAME_WIDTH, height: IMAGE_FRAME_HEIGHT, overflow: 'hidden' }]}>
                    <Animated.View style={[animatedStyle]}>

                    {/* 게임 화면 영역 */}
                            <TouchableWithoutFeedback onPress={handleImageClick}>
                                <View ref={imageRef} style={styles.imageContainer}>

                                {renderImageWithMarkers(gameInfoList[currentRound].normalUrl)}
                                </View>
                            </TouchableWithoutFeedback>
                    </Animated.View >
                </View >
            </GestureDetector >
            {/* 타이머 바 */}
            <View style={styles.timerBarContainer}>
                <Animated.View style={[styles.timerBar, animatedTimerStyle]} />
            </View>
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                <View style={[styles.imageContainer, { width: IMAGE_FRAME_WIDTH, height: IMAGE_FRAME_HEIGHT, overflow: 'hidden' }]}>
                    <Animated.View style={[animatedStyle]}>
                        <TouchableWithoutFeedback onPress={handleImageClick}>
                            <View ref={imageRef} style={styles.imageContainer}>
                            {/* 비정상 이미지 (서버 응답에 abnormalUrl이 있을 경우) */}
                            {gameInfoList[currentRound].abnormalUrl &&
                                    renderImageWithMarkers(gameInfoList[currentRound].abnormalUrl)}
                            </View>
                        </TouchableWithoutFeedback>
            </Animated.View >
        </View >
            </GestureDetector >
            {/* 확대/축소 버튼 (필요에 따라 UI 위치 및 스타일 조정) */}
            {/* 확대/축소 버튼 */}
            <View style={styles.controlPanel}>
                <TouchableOpacity onPress={handleZoomIn} style={styles.controlButton}>
                    <Text style={styles.controlButtonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleZoomOut} style={styles.controlButton}>
                    <Text style={styles.controlButtonText}>-</Text>
                </TouchableOpacity>
            </View>

            {/* 아이템 및 상태 영역 */}
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

export default SoloFindItScreen;
