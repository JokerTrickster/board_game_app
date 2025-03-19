import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Animated as RNAnimated, View, Text, Image, Button, TouchableWithoutFeedback,  TouchableOpacity, Easing } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // ✅ 네비게이션 타입 import
import findItViewModel from './services/FindItViewModel'; // ✅ 올바른 경로로 변경
import { styles } from './styles/ReactFindItStyles';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { webSocketService } from '../../services/WebSocketService';
import AnimatedCircle from './AnimatedCircle';
import { findItWebSocketService } from '../../services/FindItWebSocketService';
import Animated, { runOnJS, useSharedValue, useAnimatedStyle, withTiming, useDerivedValue } from 'react-native-reanimated'; // ✅ React Native의 Animated 제거
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import MultiHeader from '../../components/MultiHeader';
import ItemBar from '../../components/ItemBar';


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
    const IMAGE_FRAME_WIDTH = 350; // 이미지 프레임 크기 (고정)
    const IMAGE_FRAME_HEIGHT = 242;
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
    // 아래 추가: 체크박스 표시
    // 5개의 체크박스 중 맞춘 개수만큼 앞에서부터 check_box.png로 변경
    const renderCheckBoxes = () => {
        const total = 5;
        const correctCount = findItViewModel.correctClicks.length;
        return (
            <View style={styles.checkBoxContainer}>
                {Array.from({ length: total }, (_, i) => (
                    <Image
                        key={i}
                        source={
                            i < correctCount
                                ? require('../../assets/icons/find-it/check_box.png')
                                : require('../../assets/icons/find-it/empty_check_box.png')
                        }
                        style={styles.checkBoxImage}
                    />
                ))}
            </View>
        );
    };

    // ✅ MobX 상태 변경 감지하여 UI 업데이트
    useEffect(() => {
        setNormalImage(findItViewModel.normalImage);
        setAbnormalImage(findItViewModel.abnormalImage);
    }, [findItViewModel.normalImage, findItViewModel.abnormalImage]);

    // ✅ 라운드 변경 시 타이머 바 초기화 & 다시 시작 및 이미지 transform 초기화
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
        // 라운드 변경 시 이미지 transform 초기화
        scale.value = withTiming(1, { duration: 200 });
        offsetX.value = withTiming(0, { duration: 200 });
        offsetY.value = withTiming(0, { duration: 200 });
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
        }
    }, [findItViewModel.gameOver]);
    
    return (
        <View style={styles.container}>
            <MultiHeader />
            <View style={styles.topBar}>
            </View>

            <View style={styles.gameContainer}>
            {/* 정상 이미지 컨테이너 (정답, 오답 클릭 모두 지원) */}
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                <View style={[styles.normalImageContainer, { width: IMAGE_FRAME_WIDTH, height: IMAGE_FRAME_HEIGHT, overflow: 'hidden' }]}>
                    <Animated.View style={[animatedStyle]}>
                        {normalImage ? (
                            <TouchableWithoutFeedback onPress={handleImageClick}>
                                {/* 내부 View에 ref와 동일한 스타일을 적용하여 비정상 이미지와 동일하게 구성 */}
                                <View ref={imageRef} style={styles.normalImageContainer}>
                                    {normalImage ? (
                                        <Image source={{ uri: normalImage }} style={styles.image} />
                                    ) : (
                                        <Text>이미지를 불러오는 중...</Text>
                                    )}
                                    {findItViewModel.correctClicks.map((pos, index) => (
                                        <AnimatedCircle key={`correct-normal-${index}`} x={pos.x} y={pos.y} />
                                    ))}
                                    {findItViewModel.wrongClicks.map((pos, index) => (
                                        <View key={index} style={[styles.wrongXContainer, { left: pos.x - 15, top: pos.y - 15 }]}>
                                            <View style={[styles.wrongXLine, styles.wrongXRotate45]} />
                                            <View style={[styles.wrongXLine, styles.wrongXRotate135]} />
                                        </View>
                                    ))}
                                    {findItViewModel.missedPositions.map((pos, index) => (
                                        <View key={`missed-normal-${index}`} style={[styles.missedCircle, { left: pos.x - 15, top: pos.y - 15 }]} />
                                    ))}
                                    {hintVisible && findItViewModel.hintPosition && (
                                        <View style={[styles.hintCircle, { left: findItViewModel.hintPosition.x - 15, top: findItViewModel.hintPosition.y - 15 }]} />
                                    )}
                                </View>
                            </TouchableWithoutFeedback>
                        ) : (
                            <Text>이미지를 불러오는 중...</Text>
                        )}
                    </Animated.View>
                </View>
            </GestureDetector>

            {/* ✅ 타이머 바 추가 */}
            <View style={styles.timerContainer}>
                {/* 타이머 이미지 */}
                <Image
                    source={require('../../assets/icons/find-it/timer_bar.png')}
                    style={styles.timerImage}
                />
                {/* 타이머 바 */}
                <RNAnimated.View
                    style={[
                        styles.timerBar,
                        {
                            width: timerWidth.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%'],
                            }),
                            backgroundColor: findItViewModel.timerStopped ? 'red' : '#FC9D99',
                        },
                    ]}
                />
            </View>
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                <View style={[styles.abnormalImageContainer, { width: IMAGE_FRAME_WIDTH, height: IMAGE_FRAME_HEIGHT, overflow: 'hidden' }]}>
                    <Animated.View style={[animatedStyle]}>
                        {/* ✅ 틀린 그림 */}
                        <TouchableWithoutFeedback onPress={handleImageClick}>
                            <View ref={imageRef} style={styles.abnormalImageContainer}>
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
                </View>
            {renderCheckBoxes()}
    
            <ItemBar
                life={findItViewModel.life}
                timerStopCount={findItViewModel.item_timer_stop}
                hintCount={findItViewModel.hints}
                onTimerStopPress={handleTimerStop}
                onHintPress={handleHint}
                onZoomInPress={handleZoomIn}
                onZoomOutPress={handleZoomOut}
            />

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
