import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Animated as RNAnimated, View, Text, Image, AppState, TouchableWithoutFeedback, TouchableOpacity, Easing } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // ✅ 네비게이션 타입 import
import soloFindItViewModel from './services/SoloFindItViewModel'; // ✅ 올바른 경로로 변경
import { styles } from './styles/ReactSoloFindItStyles';
import { RootStackParamList } from '../../navigation/navigationTypes';
import AnimatedCircle from './AnimatedCircle';
import Animated, { runOnJS, useSharedValue, useAnimatedStyle, withTiming, useDerivedValue } from 'react-native-reanimated'; // ✅ React Native의 Animated 제거
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runInAction } from 'mobx';
import SoloHeader from '../../components/SoloHeader';
import ItemBar from '../../components/ItemBar';
import {findItService} from '../../services/FindItService';
import Sound from 'react-native-sound';
import { CommonAudioManager } from '../../services/CommonAudioManager'; // Global Audio Manager import



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
    const [currentRound, setCurrentRound] = useState<number>(1);
    // ✅ MobX 상태 변경 감지를 위한 useState 선언
    const [normalImage, setNormalImage] = useState<string | null>(soloFindItViewModel.normalImage);
    const [abnormalImage, setAbnormalImage] = useState<string | null>(soloFindItViewModel.abnormalImage);

    const IMAGE_FRAME_WIDTH = 400; // 이미지 프레임 크기 (고정)
    const IMAGE_FRAME_HEIGHT = 277;
    // ✅ 확대/축소 관련 값
    const MAX_SCALE = 2; // 최대 확대 비율
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

    // 클릭 사운드를 위한 ref (초기화 시 파일 경로를 지정)
    const clickSoundRef = useRef<Sound | null>(null);
    // 새로운 correct_click 사운드 ref 추가
    const correctSoundRef = useRef<Sound | null>(null);

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

        // offsetX.value = withTiming(Math.max(-maxOffsetX, Math.min(offsetX.value, maxOffsetX)), { duration: 200 });
        // offsetY.value = withTiming(Math.max(-maxOffsetY, Math.min(offsetY.value, maxOffsetY)), { duration: 200 });
        // offset이 컨테이너 밖으로 나가지 않도록 clamp 처리
        offsetX.value = withTiming(
            Math.min(maxOffsetX, Math.max(-maxOffsetX, offsetX.value)),
            { duration: 200 }
        );
        offsetY.value = withTiming(
            Math.min(maxOffsetY, Math.max(-maxOffsetY, offsetY.value)),
            { duration: 200 }
        );
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
        // overflow: 'hidden',
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

    // 컴포넌트 마운트 시 사운드 파일 로드
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
        CommonAudioManager.initBackgroundMusic();
        CommonAudioManager.playGameBackgroundMusic();
        // 홈 화면을 벗어나면 음악을 계속 재생할지, 아니면 중단할지 결정합니다.
        // 예를 들어, 홈 화면을 벗어날 때 정지하고 싶다면 아래 cleanup 코드를 활성화하면 됩니다.
        return () => {
            CommonAudioManager.stopGameBackgroundMusic();
        };
    }, []);

    useEffect(() => {
        if (soloFindItViewModel.timer > 0 && !soloFindItViewModel.timerStopped) {
            startTimerAnimation(soloFindItViewModel.timer);
        }
    }, [soloFindItViewModel.timer]);

    useEffect(() => {
        if (soloFindItViewModel.correctClicks.length === 5) {
            if (soloFindItViewModel.round == 10) {
                findItService.deductCoin(1);
                navigation.navigate('SoloFindItResult', { isSuccess: true });
            } else {
                soloFindItViewModel.nextRound();
            }
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
        
        if (soloFindItViewModel.isAlreadyClicked(finalX, finalY)) return;
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
            runOnJS(playCorrectSound)();
            // JS 스레드에서 상태 업데이트 실행
            runOnJS(addCorrectClick)(matchedPos.x, matchedPos.y);
        } else {
            runOnJS(playClickSound)();

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
            runInAction(() => {
                soloFindItViewModel.hints -= 1;
            });
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
            runInAction(() => {
                soloFindItViewModel.item_timer_stop -= 1;
            });
            setTimeout(() => {
                console.log("▶ 타이머 & 타이머 바 재시작!", remainingTime.current);
                isPaused.current = false;
                startTimerAnimation(remainingTime.current); // ✅ 남은 시간만큼 다시 진행
            }, 5000);
            // ✅ 서버에 아이템 사용 이벤트 전송
            soloFindItViewModel.useTimerStopItem();
        }
    };

    // 아래 추가: 체크박스 표시
    // 5개의 체크박스 중 맞춘 개수만큼 앞에서부터 check_box.png로 변경
    const renderCheckBoxes = () => {
        const total = 5;
        const correctCount = soloFindItViewModel.correctClicks.length;
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
        // 라운드 이미지
        setNormalImage(gameInfoList[soloFindItViewModel.round - 1].normalUrl);
        setAbnormalImage(gameInfoList[soloFindItViewModel.round - 1].abnormalUrl);
        setCurrentRound(soloFindItViewModel.round);
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
        if (soloFindItViewModel.life <= 0) {
            runInAction(() => {
                soloFindItViewModel.gameOver = true;
            });
        }
    }, [soloFindItViewModel.life]);


    // ✅ 게임 종료 시 타이머 바 정지
    useEffect(() => {
        if (soloFindItViewModel.gameOver) {
            runInAction(() => {
                soloFindItViewModel.timerStopped = true;
            });
            if (timerAnimation.current) {
                timerAnimation.current.stop();
            }
            navigation.navigate('SoloFindItResult', { isSuccess: false });
        }
    }, [soloFindItViewModel.gameOver]);

    return (
        <View style={styles.container}>
            <SoloHeader />
            {/* 상단 UI */}
            <View style={styles.topBar}>
            </View>


            <View style={styles.gameContainer}>
            {/* 정상 이미지 컨테이너 (정답, 오답 클릭 모두 지원) */}
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                <View style={[styles.normalImageContainer, { width: IMAGE_FRAME_WIDTH, height: IMAGE_FRAME_HEIGHT, overflow: 'hidden' }]}>
                    <Animated.View style={[animatedStyle]}>
                            <TouchableWithoutFeedback onPress={handleImageClick}>
                                {/* 내부 View에 ref와 동일한 스타일을 적용하여 비정상 이미지와 동일하게 구성 */}
                                <View ref={imageRef} style={styles.normalImageContainer}>
                                    {gameInfoList[currentRound-1].normalUrl ? (
                                    <Image source={{ uri: gameInfoList[currentRound - 1].normalUrl }} style={styles.image} />
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
                            backgroundColor: soloFindItViewModel.timerStopped ? 'red' : '#FC9D99',
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
                                {gameInfoList[currentRound - 1].abnormalUrl ? (
                                    <Image source={{ uri: gameInfoList[currentRound - 1].abnormalUrl }} style={styles.image} />
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
                </View>
            {renderCheckBoxes()}

            <ItemBar
                life={soloFindItViewModel.life}
                timerStopCount={soloFindItViewModel.item_timer_stop}
                hintCount={soloFindItViewModel.hints}
                onTimerStopPress={handleTimerStop}
                onHintPress={handleHint}
                onZoomInPress={handleZoomIn}
                onZoomOutPress={handleZoomOut}
            />

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
