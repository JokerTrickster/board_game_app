import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Animated as RNAnimated, View, Text, Image, Button, TouchableWithoutFeedback,  TouchableOpacity, Easing } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // ✅ 네비게이션 타입 import
import findItViewModel from './FindItViewModel'; // ✅ 올바른 경로로 변경
import { styles } from './FindItStyles';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { webSocketService } from '../../services/WebSocketService';
import AnimatedCircle from './AnimatedCircle';
import { findItWebSocketService } from '../../services/FindItWebSocketService';
import Animated, { runOnJS, useSharedValue, useAnimatedStyle, withTiming, useDerivedValue } from 'react-native-reanimated'; // ✅ React Native의 Animated 제거
import { Gesture, GestureDetector } from 'react-native-gesture-handler';


const IMAGE_FRAME_WIDTH = 400; // 이미지 프레임 크기 (고정)
const IMAGE_FRAME_HEIGHT = 255;
// ✅ 확대/축소 관련 값
const MAX_SCALE = 2; // 최대 확대 비율
const MIN_SCALE = 1; // 최소 축소 비율

const FindItScreen: React.FC = observer(() => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'FindIt'>>();
    const imageRef = useRef<View>(null);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const timerWidth = useRef(new RNAnimated.Value(100)).current;  // ✅ 타이머 바 애니메이션  
    const timerAnimation = useRef<RNAnimated.CompositeAnimation | null>(null);
    const remainingTime = useRef(findItViewModel.timer); // ✅ 남은 시간 저장
    const isPaused = useRef(false); // ✅ 타이머 정지 여부
    const [hintVisible, setHintVisible] = useState(false); // ✅ 힌트 표시 여부
    // ✅ MobX 상태 변경 감지를 위한 useState 선언
    const [normalImage, setNormalImage] = useState<string | null>(findItViewModel.normalImage);
    const [abnormalImage, setAbnormalImage] = useState<string | null>(findItViewModel.abnormalImage);


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


    // ✅ 이동 시 프레임 내부에서만 유지하도록 보정
    const adjustOffset = () => {
        'worklet';
        const scaledWidth = IMAGE_FRAME_WIDTH * scale.value;
        const scaledHeight = IMAGE_FRAME_HEIGHT * scale.value;

        const minOffsetX = Math.min(0, (IMAGE_FRAME_WIDTH - scaledWidth) / 2);
        const maxOffsetX = -minOffsetX;
        const minOffsetY = Math.min(0, (IMAGE_FRAME_HEIGHT - scaledHeight) / 2);
        const maxOffsetY = -minOffsetY;

        offsetX.value = withTiming(Math.max(minOffsetX, Math.min(offsetX.value, maxOffsetX)), { duration: 200 });
        offsetY.value = withTiming(Math.max(minOffsetY, Math.min(offsetY.value, maxOffsetY)), { duration: 200 });
    };


    // ✅ 핀치 줌 제스처 정의
    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            scale.value = Math.min(Math.max(event.scale, MIN_SCALE), MAX_SCALE);
        });



    // ✅ 팬 제스처 (두 이미지 동기화하여 이동)
    const panGesture = Gesture.Pan()
        .onStart(() => {
            lastOffsetX.value = offsetX.value;
            lastOffsetY.value = offsetY.value;
        })
        .onUpdate((event) => {
            'worklet';
            if (scale.value > 1) {
                const scaledWidth = IMAGE_FRAME_WIDTH * scale.value;
                const scaledHeight = IMAGE_FRAME_HEIGHT * scale.value;

                const minOffsetX = Math.min(0, (IMAGE_FRAME_WIDTH - scaledWidth) / 2);
                const maxOffsetX = -minOffsetX;
                const minOffsetY = Math.min(0, (IMAGE_FRAME_HEIGHT - scaledHeight) / 2);
                const maxOffsetY = -minOffsetY;

                offsetX.value = Math.max(minOffsetX, Math.min(lastOffsetX.value + event.translationX, maxOffsetX));
                offsetY.value = Math.max(minOffsetY, Math.min(lastOffsetY.value + event.translationY, maxOffsetY));
            }
        })
        .onEnd(() => {
            adjustOffset();
        });
    

    // ✅ 애니메이션 적용 (두 이미지 동일하게 적용)
    const animatedStyle = useAnimatedStyle(() => ({
        width: IMAGE_FRAME_WIDTH,
        height: IMAGE_FRAME_HEIGHT,
        overflow: 'hidden',
        transform: [
            { scale: derivedScale.value },  // ✅ `useDerivedValue` 적용
            { translateX: derivedOffsetX.value },  // ✅ `useDerivedValue` 적용
            { translateY: derivedOffsetY.value },  // ✅ `useDerivedValue` 적용
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
        if (findItViewModel.timer > 0 && !findItViewModel.timerStopped) {
            startTimerAnimation(findItViewModel.timer);
        }
    }, [findItViewModel.timer]);
    
    // ✅ 클릭 좌표 계산 (확대/이동 고려)

    const handleImageClick = useCallback((event: any) => {
        'worklet';
        // transform 보정 없이 원본 좌표 사용
        const { locationX, locationY } = event.nativeEvent;
        const finalX = parseFloat(locationX.toFixed(2));
        const finalY = parseFloat(locationY.toFixed(2));

        runOnJS(sendClickToServer)(finalX, finalY);
        console.log(`📌 [클릭 좌표] (${finalX}, ${finalY})`);

        if (findItViewModel.isAlreadyClicked(finalX, finalY)) return;
        findItWebSocketService.sendSubmitPosition(finalX, finalY);
    }, []);

    const sendClickToServer = (x: number, y: number) => {
        console.log(`📌 클릭한 좌표: (${x}, ${y})`);
    };

    // ✅ 힌트 아이템 사용
    const handleHint = () => {
        if (findItViewModel.hints > 0) {
            // ✅ 서버에 아이템 사용 이벤트 전송
            findItWebSocketService.sendHintItemEvent();
        }

    };
    // ✅ 타이머 멈춤 아이템 사용 시 타이머 바 멈추기
    const handleTimerStop = () => {
        if (findItViewModel.item_timer_stop > 0 && !findItViewModel.timerStopped) {
            findItViewModel.useTimerStopItem();

            if (timerAnimation.current) {
                timerAnimation.current.stop(); // ✅ 타이머 바 애니메이션 정지
            }

            remainingTime.current = findItViewModel.timer; // ✅ 현재 남은 시간 저장
            isPaused.current = true;

            setTimeout(() => {
                console.log("▶ 타이머 & 타이머 바 재시작!", remainingTime.current);
                isPaused.current = false;
                startTimerAnimation(remainingTime.current); // ✅ 남은 시간만큼 다시 진행
            }, 5000);
            // ✅ 서버에 아이템 사용 이벤트 전송
            findItWebSocketService.sendTimerItemEvent();
        }
    };

    // ✅ MobX 상태 변경 감지하여 UI 업데이트
    useEffect(() => {
        setNormalImage(findItViewModel.normalImage);
        setAbnormalImage(findItViewModel.abnormalImage);
    }, [findItViewModel.normalImage, findItViewModel.abnormalImage]);

    // ✅ 라운드 변경 시 타이머 바 초기화 & 다시 시작
    useEffect(() => {
        if (!findItViewModel.roundClearEffect) {
            startTimerAnimation(findItViewModel.timer);
            timerWidth.setValue(100); // 처음에는 100%
            findItViewModel.startTimer();
        }
        if (!findItViewModel.roundFailEffect) {
            startTimerAnimation(findItViewModel.timer);
            timerWidth.setValue(100); // 처음에는 100%
            findItViewModel.startTimer();
        }
    }, [findItViewModel.round]);

    
    // ✅ 힌트 좌표가 변경될 때마다 감지하여 5초 후 제거
    useEffect(() => {
        if (findItViewModel.hintPosition) {
            setHintVisible(true);
            setTimeout(() => setHintVisible(false), 5000);
        }
    }, [findItViewModel.hintPosition]);

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
        console.log(`🔄 게임 상태 변경됨! (목숨: ${findItViewModel.life}, 힌트: ${findItViewModel.hints}, 타이머 정지: ${findItViewModel.item_timer_stop}, 라운드: ${findItViewModel.round})`);

        // 여기서 UI 업데이트 로직을 실행하거나 필요한 추가 작업 수행 가능
    }, [findItViewModel.life, findItViewModel.hints, findItViewModel.item_timer_stop, findItViewModel.round]);

 
    // ✅ 게임 종료 시 타이머 바 정지
    useEffect(() => {
        if (findItViewModel.gameOver) {
            console.log("🛑 게임 종료! 타이머 바 정지");
            findItViewModel.timerStopped = true;
            if (timerAnimation.current) {
                timerAnimation.current.stop();
            }
            navigation.navigate('FindItGameOver');
        }
    }, [findItViewModel.gameOver]);
    
    return (
        <View style={styles.container}>
            {/* 상단 UI */}
            <View style={styles.topBar}>
                <Text style={styles.roundText}>Round {findItViewModel.round}</Text>
            </View>

            {/* ✅ 정상 이미지 (정답 표시 추가) */}
            <View style={[styles.imageContainer, { width: IMAGE_FRAME_WIDTH, height: IMAGE_FRAME_HEIGHT, overflow: 'hidden' }]}>
                <Animated.View style={[animatedStyle]}>

                {normalImage ? (
                    <>
                        <Image source={{ uri: normalImage }} style={styles.image} />

                        {/* ✅ 정답 위치 (⭕) - 정상 이미지에도 표시 */}
            
                        {findItViewModel.correctClicks.map((pos, index) => (
                            <AnimatedCircle key={`correct-normal-${index}`} x={pos.x} y={pos.y} />
                        ))}
                    </>
                ) : (
                    <Text>이미지를 불러오는 중...</Text>
                )}
                </Animated.View>
            </View>


            {/* ✅ 타이머 바 추가 */}
            <View style={styles.timerBarContainer}>
                <RNAnimated.View style={[styles.timerBar, {
                    width: timerWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: findItViewModel.timerStopped ? 'red' : 'green'
                }]} />
                    </View>
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                <View style={[styles.imageContainer, { width: IMAGE_FRAME_WIDTH, height: IMAGE_FRAME_HEIGHT, overflow: 'hidden' }]}>
                    <Animated.View style={[animatedStyle]}>
                        {/* ✅ 틀린 그림 */}
                        <TouchableWithoutFeedback onPress={handleImageClick}>
                            <View ref={imageRef} style={styles.imageContainer}>
                                {abnormalImage ? (
                                    <Image source={{ uri: abnormalImage }} style={styles.image} />
                                ) : (
                                    <Text>이미지를 불러오는 중...</Text>
                                )}

                                {/* ✅ 정답 표시 */}
                
                                {findItViewModel.correctClicks.map((pos, index) => (
                                    <AnimatedCircle key={`correct-${index}`} x={pos.x} y={pos.y} />
                                ))}

                                {/* ✅ 오답 표시 */}
                                {findItViewModel.wrongClicks.map((pos, index) => (
                                    <View key={index} style={[styles.wrongXContainer, { left: pos.x - 15, top: pos.y - 15 }]}>
                                        <View style={[styles.wrongXLine, styles.wrongXRotate45]} />
                                        <View style={[styles.wrongXLine, styles.wrongXRotate135]} />
                                    </View>
                                ))}
                                {/* ✅ 못 맞춘 좌표 표시 (4초간) */}
                                {findItViewModel.missedPositions.map((pos, index) => (
                                    <View key={`missed-${index}`} style={[styles.missedCircle, { left: pos.x - 15, top: pos.y - 15 }]} />
                                ))}
                                {/* ✅ 힌트 표시 */}
                                {hintVisible && findItViewModel.hintPosition && (
                                    <View style={[styles.hintCircle, { left: findItViewModel.hintPosition.x - 15, top: findItViewModel.hintPosition.y - 15 }]} />
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
                <Text style={styles.infoText}>남은 개수: {5 - findItViewModel.correctClicks.length}</Text>
                <Text style={styles.infoText}>❤️ {findItViewModel.life}</Text>

                {/* 힌트 버튼 */}
                <TouchableOpacity style={styles.infoButton} onPress={handleHint}>
                    <Text style={styles.infoButtonText}>💡 {findItViewModel.hints}</Text>
                </TouchableOpacity>

                {/* 타이머 정지 버튼 */}
                <TouchableOpacity style={styles.infoButton} onPress={handleTimerStop}>
                    <Text style={styles.infoButtonText}>⏳ {findItViewModel.item_timer_stop}</Text>
                </TouchableOpacity>
            </View>

            {findItViewModel.roundClearEffect && (
                <View style={styles.clearEffectContainer}>
                    <Text style={styles.clearEffectText}>🎉 ROUND CLEAR! 🎉</Text>
                </View>
            )}
            {findItViewModel.roundFailEffect && (
                <View style={styles.failEffectContainer}>
                    <Text style={styles.failEffectText}>🎉 TIME OUT! 🎉</Text>
                </View>
            )}
        </View>
    );
});

export default FindItScreen;
