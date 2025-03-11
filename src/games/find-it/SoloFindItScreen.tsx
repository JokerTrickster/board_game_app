import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Animated as RNAnimated, View, Text, Image, Button, TouchableWithoutFeedback, TouchableOpacity, Easing } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // ✅ 네비게이션 타입 import
import soloFindItViewModel from './SoloFindItViewModel'; // ✅ 올바른 경로로 변경
import { styles } from './ReactFindItStyles';
import { RootStackParamList } from '../../navigation/navigationTypes';
import AnimatedCircle from './AnimatedCircle';
import Animated, { runOnJS, useSharedValue, useAnimatedStyle, withTiming, useDerivedValue } from 'react-native-reanimated'; // ✅ React Native의 Animated 제거
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runInAction } from 'mobx';

const SoloFindItScreen: React.FC = observer(() => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'FindIt'>>();
    const imageRef = useRef<View>(null);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const timerWidth = useRef(new RNAnimated.Value(100)).current;  // ✅ 타이머 바 애니메이션  
    const timerAnimation = useRef<RNAnimated.CompositeAnimation | null>(null);
    const remainingTime = useRef(soloFindItViewModel.timer); // ✅ 남은 시간 저장
    const isPaused = useRef(false); // ✅ 타이머 정지 여부
    const [hintVisible, setHintVisible] = useState(false); // ✅ 힌트 표시 여부
    // 현재 라운드 (0 ~ 9)
    const [currentRound, setCurrentRound] = useState<number>(0);
    // ✅ MobX 상태 변경 감지를 위한 useState 선언
    const [normalImage, setNormalImage] = useState<string | null>(soloFindItViewModel.normalImage);
    const [abnormalImage, setAbnormalImage] = useState<string | null>(soloFindItViewModel.abnormalImage);

    const IMAGE_FRAME_WIDTH = 400; // 이미지 프레임 크기 (고정)
    const IMAGE_FRAME_HEIGHT = 255;
    // ✅ 확대/축소 관련 값
    const MAX_SCALE = 2.5; // 최대 확대 비율
    const MIN_SCALE = 1; // 최소 축소 비율

    // ✅ 확대 및 이동 관련 상태값
    const scale = useSharedValue(1);
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const lastOffsetX = useSharedValue(0);
    const lastOffsetY = useSharedValue(0);
    const isZoomed = useSharedValue(false); // ✅ 확대 여부 저장

    const derivedScale = useDerivedValue(() => scale.value);
    const derivedOffsetX = useDerivedValue(() => offsetX.value);
    const derivedOffsetY = useDerivedValue(() => offsetY.value);
   
    const route = useRoute<any>();
    const { gameInfoList } = route.params; 

    // ✅ 확대/축소 버튼 핸들러 (두 이미지 동기화)
    const handleZoomIn = () => {
        scale.value = withTiming(Math.min(MAX_SCALE, scale.value + 0.5), { duration: 200 });
        isZoomed.value = scale.value > 1;
        adjustOffset(); // ✅ `runOnJS(adjustOffset)()` 제거
    };

    const handleZoomOut = () => {
        scale.value = withTiming(Math.max(MIN_SCALE, scale.value - 0.5), { duration: 200 });
        isZoomed.value = scale.value > 1;
        adjustOffset(); // ✅ `runOnJS(adjustOffset)()` 제거
    };


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

    // ✅ 핀치 줌 제스처 정의
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
            'worklet';
            adjustOffset();
        });

    // ✅ 애니메이션 적용 (두 이미지 동일하게 적용)
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

    const startTimerAnimation = useCallback((duration: number) => {
        if (timerAnimation.current) {
            timerAnimation.current.stop();
        }
        timerAnimation.current = RNAnimated.timing(timerWidth, {
            toValue: 0,
            duration: duration * 1000,
            easing: Easing.linear,
            useNativeDriver: false,
        });

        timerAnimation.current.start();
    }, []);
    useEffect(() => {
        if (soloFindItViewModel.timer > 0 && !soloFindItViewModel.timerStopped) {
            startTimerAnimation(soloFindItViewModel.timer);
        }
    }, [soloFindItViewModel.timer]);
    useEffect(() => {
        if (soloFindItViewModel.correctClicks.length === 5) {
            setCurrentRound(soloFindItViewModel.round);
            soloFindItViewModel.nextRound();
        }
    }), [soloFindItViewModel.correctClicks]
    
    // 정답 클릭 시 좌표를 추가하는 함수
    const addCorrectClick = (x: number, y: number) => {
        runInAction(() => {
            soloFindItViewModel.correctClicks.push({
                x, y,
                userID: 0
            });
        });
    };

    // 오답 클릭 시 좌표를 추가하는 함수
    const addWrongClick = (x: number, y: number) => {
        runInAction(() => {
            soloFindItViewModel.wrongClicks.push({
                x, y,
                userID: 0
            });
        });
        // 4초 후 해당 오답 좌표를 제거합니다.
        setTimeout(() => {
            runInAction(() => {
                const index = soloFindItViewModel.wrongClicks.findIndex(item => item.x === x && item.y === y);
                if (index > -1) {
                    soloFindItViewModel.wrongClicks.splice(index, 1);
                }
            });
        }, 2500);
    };
    const TOLERANCE = 20; // 클릭 허용 오차 (픽셀 단위)

    const handleImageClick = useCallback((event: any) => {
        'worklet';
        const { locationX, locationY } = event.nativeEvent;
        const finalX = parseFloat(locationX.toFixed(2));
        const finalY = parseFloat(locationY.toFixed(2));

        // 현재 라운드에 해당하는 게임 정보 가져오기
        const currentGameInfo = gameInfoList[soloFindItViewModel.round-1];
        let isCorrect = false;
        let matchedPos = null;
        // correctPositions 배열을 순회하며 클릭 위치와의 거리를 계산하고, 
        // 사용자가 클릭한 좌표에 해당하는 정답 좌표(gameInfo에 있는 좌표)를 찾음
        for (let i = 0; i < currentGameInfo.correctPositions.length; i++) {
            const pos = currentGameInfo.correctPositions[i];
            const dx = finalX - pos.x;
            const dy = finalY - pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 허용 오차 이내면 해당 정답 좌표를 저장
            if (distance <= TOLERANCE) {
                matchedPos = pos;
                isCorrect = true;
                break;
            }
        }

        if (isCorrect) {
            // JS 스레드에서 상태 업데이트 실행
            runOnJS(addCorrectClick)(matchedPos.x, matchedPos.y);
        } else {
            // 필요에 따라 오답 처리 로직 추가 가능 (예: wrongClicks 배열에 추가)
            soloFindItViewModel.life -= 1;
            runOnJS(addWrongClick)(finalX, finalY);
        }
    }, [gameInfoList]);


    // ✅ 힌트 아이템 사용
    const handleHint = () => {
        if (soloFindItViewModel.hints > 0) {
            // ✅ 서버에 아이템 사용 이벤트 전송
            const currentGameInfo = gameInfoList[soloFindItViewModel.round-1];
            soloFindItViewModel.useHintItem(currentGameInfo.correctPositions);
            soloFindItViewModel.hints -= 1;
        }

    };
    // ✅ 타이머 멈춤 아이템 사용 시 타이머 바 멈추기
    const handleTimerStop = () => {
        if (soloFindItViewModel.item_timer_stop > 0 && !soloFindItViewModel.timerStopped) {
            soloFindItViewModel.useTimerStopItem();

            if (timerAnimation.current) {
                timerAnimation.current.stop(); // ✅ 타이머 바 애니메이션 정지
            }

            remainingTime.current = soloFindItViewModel.timer; // ✅ 현재 남은 시간 저장
            isPaused.current = true;

            setTimeout(() => {
                console.log("▶ 타이머 & 타이머 바 재시작!", remainingTime.current);
                isPaused.current = false;
                startTimerAnimation(remainingTime.current); // ✅ 남은 시간만큼 다시 진행
            }, 5000);
            // ✅ 서버에 아이템 사용 이벤트 전송
            soloFindItViewModel.useTimerStopItem();
        }
    };

    // ✅ MobX 상태 변경 감지하여 UI 업데이트
    useEffect(() => {
        setNormalImage(soloFindItViewModel.normalImage);
        setAbnormalImage(soloFindItViewModel.abnormalImage);
    }, [soloFindItViewModel.normalImage, soloFindItViewModel.abnormalImage]);

    // ✅ 라운드 변경 시 타이머 바 초기화 & 다시 시작 및 이미지 transform 초기화
    useEffect(() => {
        if (!soloFindItViewModel.roundClearEffect) {
            startTimerAnimation(soloFindItViewModel.timer);
            timerWidth.setValue(100); // 처음에는 100%
            soloFindItViewModel.startTimer();
        }
        if (!soloFindItViewModel.roundFailEffect) {
            startTimerAnimation(soloFindItViewModel.timer);
            timerWidth.setValue(100); // 처음에는 100%
            soloFindItViewModel.startTimer();
        }
        // 라운드 변경 시 이미지 transform 초기화
        scale.value = withTiming(1, { duration: 200 });
        offsetX.value = withTiming(0, { duration: 200 });
        offsetY.value = withTiming(0, { duration: 200 });
    }, [soloFindItViewModel.round]);


    // ✅ 힌트 좌표가 변경될 때마다 감지하여 5초 후 제거
    useEffect(() => {
        if (soloFindItViewModel.hintPosition) {
            setHintVisible(true);
            setTimeout(() => setHintVisible(false), 4000);
        }
    }, [soloFindItViewModel.hintPosition]);

    useEffect(() => {
        setTimeout(() => {
            if (imageRef.current) {
                imageRef.current.measure((fx, fy, width, height, px, py) => {
                    setImagePosition({ x: px, y: py });
                });
            }
        }, 500);
    }, []);

    useEffect(() => {
        console.log(`🔄 게임 상태 변경됨! (목숨: ${soloFindItViewModel.life}, 힌트: ${soloFindItViewModel.hints}, 타이머 정지: ${soloFindItViewModel.item_timer_stop}, 라운드: ${soloFindItViewModel.round})`);

        // 여기서 UI 업데이트 로직을 실행하거나 필요한 추가 작업 수행 가능
    }, [soloFindItViewModel.life, soloFindItViewModel.hints, soloFindItViewModel.item_timer_stop, soloFindItViewModel.round]);


    // ✅ 게임 종료 시 타이머 바 정지
    useEffect(() => {
        if (soloFindItViewModel.gameOver) {
            soloFindItViewModel.timerStopped = true;
            if (timerAnimation.current) {
                timerAnimation.current.stop();
            }
            navigation.navigate('Home');
        }
    }, [soloFindItViewModel.gameOver]);

    return (
        <View style={styles.container}>
            {/* 상단 UI */}
            <View style={styles.topBar}>
                <Text style={styles.roundText}>Round {soloFindItViewModel.round}</Text>
            </View>

            {/* 정상 이미지 컨테이너 (정답, 오답 클릭 모두 지원) */}
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                <View style={[styles.imageContainer, { width: IMAGE_FRAME_WIDTH, height: IMAGE_FRAME_HEIGHT, overflow: 'hidden' }]}>
                    <Animated.View style={[animatedStyle]}>
                            <TouchableWithoutFeedback onPress={handleImageClick}>
                                {/* 내부 View에 ref와 동일한 스타일을 적용하여 비정상 이미지와 동일하게 구성 */}
                                <View ref={imageRef} style={styles.imageContainer}>
                                    {gameInfoList[currentRound].normalUrl ? (
                                        <Image source={{ uri: gameInfoList[currentRound].normalUrl }} style={styles.image} />
                                    ) : (
                                        <Text>이미지를 불러오는 중...</Text>
                                    )}
                                    {soloFindItViewModel.correctClicks.map((pos, index) => (
                                        <AnimatedCircle key={`correct-normal-${index}`} x={pos.x} y={pos.y} />
                                    ))}
                                    {soloFindItViewModel.wrongClicks.map((pos, index) => (
                                        <View key={index} style={[styles.wrongXContainer, { left: pos.x - 15, top: pos.y - 15 }]}>
                                            <View style={[styles.wrongXLine, styles.wrongXRotate45]} />
                                            <View style={[styles.wrongXLine, styles.wrongXRotate135]} />
                                        </View>
                                    ))}
                                    {soloFindItViewModel.missedPositions.map((pos, index) => (
                                        <View key={`missed-normal-${index}`} style={[styles.missedCircle, { left: pos.x - 15, top: pos.y - 15 }]} />
                                    ))}
                                    {hintVisible && soloFindItViewModel.hintPosition && (
                                        <View style={[styles.hintCircle, { left: soloFindItViewModel.hintPosition.x - 15, top: soloFindItViewModel.hintPosition.y - 15 }]} />
                                    )}
                                </View>
                            </TouchableWithoutFeedback>
                    </Animated.View>
                </View>
            </GestureDetector>


            {/* ✅ 타이머 바 추가 */}
            <View style={styles.timerBarContainer}>
                <RNAnimated.View style={[styles.timerBar, {
                    width: timerWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: soloFindItViewModel.timerStopped ? 'red' : 'green'
                }]} />
            </View>
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                <View style={[styles.imageContainer, { width: IMAGE_FRAME_WIDTH, height: IMAGE_FRAME_HEIGHT, overflow: 'hidden' }]}>
                    <Animated.View style={[animatedStyle]}>
                        {/* ✅ 틀린 그림 */}
                        <TouchableWithoutFeedback onPress={handleImageClick}>
                            <View ref={imageRef} style={styles.imageContainer}>
                                {gameInfoList[currentRound].abnormalUrl ? (
                                    <Image source={{ uri: gameInfoList[currentRound].abnormalUrl }} style={styles.image} />
                                ) : (
                                    <Text>이미지를 불러오는 중...</Text>
                                )}
                                {/* ✅ 정답 표시 */}
                                {soloFindItViewModel.correctClicks.map((pos, index) => (
                                    <AnimatedCircle key={`correct-${index}`} x={pos.x} y={pos.y} />
                                ))}

                                {/* ✅ 오답 표시 */}
                                {soloFindItViewModel.wrongClicks.map((pos, index) => (
                                    <View key={index} style={[styles.wrongXContainer, { left: pos.x - 15, top: pos.y - 15 }]}>
                                        <View style={[styles.wrongXLine, styles.wrongXRotate45]} />
                                        <View style={[styles.wrongXLine, styles.wrongXRotate135]} />
                                    </View>
                                ))}
                                {/* ✅ 못 맞춘 좌표 표시 (4초간) */}
                                {soloFindItViewModel.missedPositions.map((pos, index) => (
                                    <View key={`missed-${index}`} style={[styles.missedCircle, { left: pos.x - 15, top: pos.y - 15 }]} />
                                ))}
                                {/* ✅ 힌트 표시 */}
                                {hintVisible && soloFindItViewModel.hintPosition && (
                                    <View style={[styles.hintCircle, { left: soloFindItViewModel.hintPosition.x - 15, top: soloFindItViewModel.hintPosition.y - 15 }]} />
                                )}
                            </View>

                        </TouchableWithoutFeedback>
                    </Animated.View>
                </View>
            </GestureDetector>
            {/* 확대/축소 버튼 */}
            <View style={styles.controlPanel}>
                <TouchableOpacity onPress={handleZoomIn} style={styles.controlButton}>
                    <Text style={styles.controlButtonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleZoomOut} style={styles.controlButton}>
                    <Text style={styles.controlButtonText}>-</Text>
                </TouchableOpacity>
            </View>

            {/* ✅ 게임 정보 한 줄로 정리 */}
            <View style={styles.infoRow}>
                <Text style={styles.infoText}>남은 개수: {5 - soloFindItViewModel.correctClicks.length}</Text>
                <Text style={styles.infoText}>❤️ {soloFindItViewModel.life}</Text>

                {/* 힌트 버튼 */}
                <TouchableOpacity style={styles.infoButton} onPress={handleHint}>
                    <Text style={styles.infoButtonText}>💡 {soloFindItViewModel.hints}</Text>
                </TouchableOpacity>

                {/* 타이머 정지 버튼 */}
                <TouchableOpacity style={styles.infoButton} onPress={handleTimerStop}>
                    <Text style={styles.infoButtonText}>⏳ {soloFindItViewModel.item_timer_stop}</Text>
                </TouchableOpacity>
            </View>

            {soloFindItViewModel.roundClearEffect && (
                <View style={styles.clearEffectContainer}>
                    <Text style={styles.clearEffectText}>🎉 ROUND CLEAR! 🎉</Text>
                </View>
            )}
            {soloFindItViewModel.roundFailEffect && (
                <View style={styles.failEffectContainer}>
                    <Text style={styles.failEffectText}>🎉 TIME OUT! 🎉</Text>
                </View>
            )}
        </View>
    );
});

export default SoloFindItScreen;
