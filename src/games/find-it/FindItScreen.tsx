import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Animated as RNAnimated, View, Text, Image, AppState, TouchableWithoutFeedback,  TouchableOpacity, Easing } from 'react-native';
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
import {CommonAudioManager} from '../../services/CommonAudioManager';
import Sound from 'react-native-sound';
import AnimatedX from './AnimatedX';


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
    const IMAGE_FRAME_WIDTH = 400; // 이미지 프레임 크기 (고정)
    const IMAGE_FRAME_HEIGHT = 277;
    // ✅ 확대/축소 관련 값
    const MAX_SCALE = 2; // 최대 확대 비율
    const MIN_SCALE = 1; // 최소 축소 비율
    // 클릭 사운드를 위한 ref (초기화 시 파일 경로를 지정)
    const clickSoundRef = useRef<Sound | null>(null);
    // 새로운 correct_click 사운드 ref 추가
    const correctSoundRef = useRef<Sound | null>(null);
    const TOLERANCE = 20; // 클릭 허용 오차 (픽셀 단위)
    const imageSize = useRef({ width: IMAGE_FRAME_WIDTH, height: IMAGE_FRAME_HEIGHT });
    // 클릭 간격 제한을 위한 ref 추가
    const lastClickTime = useRef(0);
    const CLICK_DELAY = 1000; // 1초 (밀리초 단위)

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
        // 축소할 때는 항상 중앙으로 이동
        const newScale = Math.max(MIN_SCALE, scale.value - 0.5);
        scale.value = withTiming(newScale, { duration: 200 });

        // 스케일이 1이 되면 중앙으로 이동
        if (newScale <= 1) {
            offsetX.value = withTiming(0, { duration: 200 });
            offsetY.value = withTiming(0, { duration: 200 });
        } else {
            // 스케일이 1보다 크면 현재 위치에서 중앙으로 부드럽게 이동
            const scaledWidth = IMAGE_FRAME_WIDTH * newScale;
            const scaledHeight = IMAGE_FRAME_HEIGHT * newScale;

            const maxOffsetX = (scaledWidth - IMAGE_FRAME_WIDTH) / 2;
            const maxOffsetY = (scaledHeight - IMAGE_FRAME_HEIGHT) / 2;

            // 현재 offset을 허용 범위 내로 조정
            offsetX.value = withTiming(
                Math.min(maxOffsetX, Math.max(-maxOffsetX, offsetX.value)),
                { duration: 200 }
            );
            offsetY.value = withTiming(
                Math.min(maxOffsetY, Math.max(-maxOffsetY, offsetY.value)),
                { duration: 200 }
            );
        }

        isZoomed.value = newScale > 1;
    };


    const adjustOffset = () => {
        'worklet';
        if (scale.value <= MIN_SCALE + 0.001) {
            // Center image when fully zoomed out
            offsetX.value = withTiming(0, { duration: 200 });
            offsetY.value = withTiming(0, { duration: 200 });
        } else {
            const scaledWidth = IMAGE_FRAME_WIDTH * scale.value;
            const scaledHeight = IMAGE_FRAME_HEIGHT * scale.value;

            // 허용 가능한 최대 offset (양쪽 각각)
            const maxOffsetX = scaledWidth > IMAGE_FRAME_WIDTH ? (scaledWidth - IMAGE_FRAME_WIDTH) / 2 : 0;
            const maxOffsetY = scaledHeight > IMAGE_FRAME_HEIGHT ? (scaledHeight - IMAGE_FRAME_HEIGHT) / 2 : 0;

            // offset이 컨테이너 밖으로 나가지 않도록 clamp 처리
            offsetX.value = withTiming(
                Math.min(maxOffsetX, Math.max(-maxOffsetX, offsetX.value)),
                { duration: 200 }
            );
            offsetY.value = withTiming(
                Math.min(maxOffsetY, Math.max(-maxOffsetY, offsetY.value)),
                { duration: 200 }
            );
        }
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
        transform: [
            { translateX: derivedOffsetX.value },
            { translateY: derivedOffsetY.value },
            { scale: derivedScale.value },
        ],
    }));
    // 사용자 클릭 시 사운드 재생 함수
    const playClickSound = () => {
        if (clickSoundRef.current) {
            clickSoundRef.current.stop(() => {
                clickSoundRef.current?.play((success) => {
                    if (!success) {
                        console.log('Sound playback failed');
                    }
                });
            });
        }
    };
    // 새로 추가: 맞은 클릭 사운드 재생 함수
    const playCorrectSound = () => {
        if (correctSoundRef.current) {
            correctSoundRef.current.stop(() => {
                correctSoundRef.current?.play((success) => {
                    if (!success) {
                        console.log('Correct sound playback failed');
                    }
                });
            });
        }
    };

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

    // 앱 상태 감지
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                // 앱이 백그라운드 또는 비활성화 상태일 때 배경음악 정지
                CommonAudioManager.initBackgroundMusic();
            } else if (nextAppState === 'active') {
                // 앱이 포그라운드로 돌아올 때 배경음악 재생 (원하는 경우)
                CommonAudioManager.playGameBackgroundMusic();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);
    useEffect(() => {
        clickSoundRef.current = new Sound('wrong_click.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('Failed to load the sound', error);
                return;
            }
            // 사운드 로드 완료
            console.log('Sound loaded successfully');
        });
        // correct_click 사운드 로드
        correctSoundRef.current = new Sound('correct_click.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('Failed to load correct sound', error);
                return;
            }
            console.log('Correct sound loaded successfully');
        });

        return () => {
            // 컴포넌트 언마운트 시 사운드 해제
            clickSoundRef.current?.release();
            correctSoundRef.current?.release();
        };
    }, []);
    useEffect(() => {
        if (findItViewModel.timer > 0 && !findItViewModel.timerStopped) {
            startTimerAnimation(findItViewModel.timer);
        }
    }, [findItViewModel.timer]);

    useEffect(() => {
        CommonAudioManager.initBackgroundMusic();
        CommonAudioManager.playGameBackgroundMusic();
        // 홈 화면을 벗어나면 음악을 계속 재생할지, 아니면 중단할지 결정합니다.
        // 예를 들어, 홈 화면을 벗어날 때 정지하고 싶다면 아래 cleanup 코드를 활성화하면 됩니다.
        return () => {
            CommonAudioManager.stopGameBackgroundMusic();
        };
    }, []);


    // ✅ 클릭 좌표 계산 (확대/이동 고려)
    const handleImageClick = useCallback((event: any) => {
        'worklet';
        
        // 게임이 클리어되거나 게임오버 상태일 때 클릭 무시
        if (findItViewModel.roundClearEffect || findItViewModel.roundFailEffect) {
            return;
        }
        
        // 클릭 가능 상태가 아니면 무시
        if (!findItViewModel.isClickable) {
            return;
        }
        
        // 1초 이내의 연속 클릭이면 무시합니다.
        const now = Date.now();
        if (now - lastClickTime.current < CLICK_DELAY) {
            return;
        }
        lastClickTime.current = now;
        
        // transform 보정 없이 원본 좌표 사용
        const { locationX, locationY } = event.nativeEvent;
        const scaleX = IMAGE_FRAME_WIDTH / imageSize.current.width; // IMAGE_FRAME_WIDTH가 400이면 1이 됩니다.
        const scaleY = IMAGE_FRAME_HEIGHT / imageSize.current.height; // IMAGE_FRAME_HEIGHT가 277이면 1이 됩니다.

        
        const finalX = parseFloat((locationX * scaleX).toFixed(2));
        const finalY = parseFloat((locationY * scaleY).toFixed(2));

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

        if (findItViewModel.normalImage) {
            Image.prefetch(findItViewModel.normalImage);
        }
        if (findItViewModel.abnormalImage) {
            Image.prefetch(findItViewModel.abnormalImage);
        }
    }, [findItViewModel.normalImage, findItViewModel.abnormalImage]);
    // 앱 상태 감지
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                // 앱이 백그라운드 또는 비활성화 상태일 때 배경음악 정지
                CommonAudioManager.initBackgroundMusic();
            } else if (nextAppState === 'active') {
                // 앱이 포그라운드로 돌아올 때 배경음악 재생 (원하는 경우)
                CommonAudioManager.playGameBackgroundMusic();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);
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
                <View style={[styles.normalImageContainer]}>
                        <Animated.View style={[styles.image, animatedStyle]}>
                        {normalImage ? (
                            <TouchableWithoutFeedback 
                                onPress={handleImageClick}
                                disabled={findItViewModel.roundClearEffect || findItViewModel.roundFailEffect || !findItViewModel.isClickable}
                            >
                                {/* 내부 View에 ref와 동일한 스타일을 적용하여 비정상 이미지와 동일하게 구성 */}
                                <View ref={imageRef} >
                                    {normalImage ? (
                                        <Image source={{ uri: normalImage }} style={styles.image} />
                                    ) : (
                                        <Text>이미지를 불러오는 중...</Text>
                                    )}
                                    {findItViewModel.correctClicks.map((pos, index) => (
                                        <AnimatedCircle key={`correct-normal-${index}`} x={pos.x} y={pos.y} />
                                    ))}
                                    {findItViewModel.wrongClicks.map((pos, index) => (
                                        <AnimatedX key={`wrong-${index}`} x={pos.x} y={pos.y} />
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
                <View style={[styles.abnormalImageContainer]}>
                        <Animated.View style={[styles.image, animatedStyle]}>
                        {/* ✅ 틀린 그림 */}
                        <TouchableWithoutFeedback 
                            onPress={handleImageClick}
                            disabled={findItViewModel.roundClearEffect || findItViewModel.roundFailEffect || !findItViewModel.isClickable}
                        >
                            <View ref={imageRef} >
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
                                    <AnimatedX key={`wrong-abnormal-${index}`} x={pos.x} y={pos.y} />
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
                <Image
                    source= {require('../../assets/icons/find-it/clear_star.png')} 
                    style={styles.clearIcon}
                />
                <Text style={styles.clearEffectRound}>ROUND {findItViewModel.round}</Text>
                <Text style={styles.clearEffectText}>클리어!</Text>
                <View style={styles.clearEffectTextContainer}>
                    <Text style={styles.clearEffectMessage}>다음 라운드 준비중...</Text>
                </View>
            </View>
            )}
            {findItViewModel.roundFailEffect && (
                <View style={styles.failEffectContainer}>
                <Image
                    source={require('../../assets/icons/find-it/fail_star.png')} 
                    style={styles.clearIcon}
                />
                <Text style={styles.clearEffectRound}>ROUND {findItViewModel.round}</Text>
                <Text style={styles.clearEffectText}>게임오버</Text>
                <View style={styles.clearEffectTextContainer}>
                    <Text style={styles.clearEffectMessage}>다시 도전해보세요!</Text>
                </View>
            </View>
            )}
        </View>
    );
});

export default FindItScreen;
