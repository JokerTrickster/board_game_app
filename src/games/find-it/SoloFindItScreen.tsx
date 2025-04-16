import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Animated as RNAnimated, View, Text, Image, AppState, TouchableWithoutFeedback, TouchableOpacity, Easing, StyleSheet, Modal } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // ✅ 네비게이션 타입 import
import soloFindItViewModel from './services/SoloFindItViewModel'; // ✅ 올바른 경로로 변경
import { styles as importedStyles, styles } from './styles/ReactSoloFindItStyles';
import { RootStackParamList } from '../../navigation/navigationTypes';
import AnimatedCircle from './AnimatedCircle';
import Animated, { runOnJS, useSharedValue, useAnimatedStyle, withTiming, useDerivedValue } from 'react-native-reanimated'; // ✅ React Native의 Animated 제거
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runInAction, set } from 'mobx';
import SoloHeader from '../../components/SoloHeader';
import ItemBar from '../../components/ItemBar';
import {findItService} from '../../services/FindItService';
import Sound from 'react-native-sound';
import { CommonAudioManager } from '../../services/CommonAudioManager'; // Global Audio Manager import
import { BackHandler } from 'react-native';
import AnimatedX from './AnimatedX';
import AnimatedHint from './AnimatedHint';
import { GAME_TIMER, ITEM_TIMER_STOP, LIFE, HINTS } from './services/constants' 

const SoloFindItScreen: React.FC = observer(() => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'SoloFindIt'>>();
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
    const [correctPositions, setCorrectPositions] = useState<any[]>([]); // ✅ 정답 좌표 저장

    // 클릭 사운드를 위한 ref (초기화 시 파일 경로를 지정)
    const clickSoundRef = useRef<Sound | null>(null);
    // 새로운 correct_click 사운드 ref 추가
    const correctSoundRef = useRef<Sound | null>(null);
    const TOLERANCE = 20; // 클릭 허용 오차 (픽셀 단위)
    // shared value로 마지막 클릭 시간을 저장합니다.
    const lastClickTimeSV = useSharedValue(0);
    const imageSize = useRef({ width: IMAGE_FRAME_WIDTH, height: IMAGE_FRAME_HEIGHT });
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
        const backAction = () => {
            // 여기서 특별한 동작 없이 그냥 true를 반환하면, 
            // 시스템의 기본 백 버튼 동작(예: 앱 종료, 화면 이동 등)을 차단합니다.
            return true;
        };

        // 백 버튼 이벤트 리스너 추가
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        // 컴포넌트가 언마운트될 때 리스너 제거
        return () => backHandler.remove();
    }, []);
    // Add modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

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
                const index = soloFindItViewModel.wrongClicks.findIndex((pos: { x: number; y: number }) => pos.x === x && pos.y === y);
                if (index > -1) {
                    soloFindItViewModel.wrongClicks.splice(index, 1);
                }
            });
        }, 2500);
    };


    const handleImageClick = useCallback((event: any) => {
        'worklet';

        // 게임이 클리어되거나 게임오버 상태일 때 클릭 무시
        if (soloFindItViewModel.roundClearEffect || soloFindItViewModel.roundFailEffect) {
            return;
        }

        // 1초 이내의 연속 클릭이면 무시합니다.
        const now = Date.now();
        if (now - lastClickTimeSV.value < 1000) {
            return;
        }
        lastClickTimeSV.value = now;

        const { locationX, locationY } = event.nativeEvent;
        // 이미지의 실제 크기와 화면에 표시되는 크기의 비율 계산
        const scaleX = IMAGE_FRAME_WIDTH / imageSize.current.width;
        const scaleY = IMAGE_FRAME_HEIGHT / imageSize.current.height;

        // 클릭 좌표를 실제 이미지 크기에 맞게 조정
        const finalX = parseFloat((locationX * scaleX).toFixed(2));
        const finalY = parseFloat((locationY * scaleY).toFixed(2));
        // 아래 콘솔은 절대 지우지마라 
        console.log('이미지 클릭 좌표', finalX, finalY);
        console.log('현재 남은 정답 좌표 ', correctPositions);
        // 이미 클릭한 정답 위치인지 확인
        for (const click of soloFindItViewModel.correctClicks) {
            const correctPosX = parseFloat((click.x * scaleX).toFixed(2));
            const correctPosY = parseFloat((click.y * scaleY).toFixed(2));

            const dx = finalX - correctPosX;
            const dy = finalY - correctPosY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= 30) {
                return;
            }
        }

        // 이미 클릭한 오답 위치인지 확인
        for (const click of soloFindItViewModel.wrongClicks) {
            const dx = finalX - click.x;
            const dy = finalY - click.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= TOLERANCE) {
                return;
            }
        }

        let isCorrect = false;
        let correctIndex = -1;
        // 정답을 찾는다. 
        for (let i = 0; i < correctPositions.length; i++) {
            const pos = correctPositions[i];

            // 클릭 좌표를 실제 이미지 크기에 맞게 조정
            const correctPosX = parseFloat((pos.x * scaleX).toFixed(2));
            const correctPosY = parseFloat((pos.y * scaleY).toFixed(2));

            const dx = finalX - correctPosX;
            const dy = finalY - correctPosY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (finalX >= 250) {
                if (distance <= 30) {
                    isCorrect = true;
                    correctIndex = i;
                    break;
                }
            } else {
                if (distance <= 20) {
                    isCorrect = true;
                    correctIndex = i;
                    break;
                }
            }
        }

        if (isCorrect) {
            runOnJS(playCorrectSound)();
            runOnJS(addCorrectClick)(locationX, locationY);
            // Remove the matched correct position
            
            if (correctIndex !== -1) {
                runOnJS(setCorrectPositions)(prev => {
                    const updated = [...prev];
                    updated.splice(correctIndex, 1);
                    return updated;
                });
            }
            if (soloFindItViewModel.correctClicks.length+1 === 5) {
                runInAction(() => {
                    soloFindItViewModel.roundClearEffect = true;
                });
                if (soloFindItViewModel.round === 10) {
                    setTimeout(() => {
                        findItService.deductCoin(300);
                        navigation.navigate('SoloFindItResult', { isSuccess: true, gameInfoList: gameInfoList });
                        setModalVisible(false);
                    }, 3000);
                } else {
                    setTimeout(() => {
                        runInAction(() => {
                            soloFindItViewModel.roundClearEffect = false;
                            soloFindItViewModel.nextRound();
                        });
                    }, 3000);
                }
            }
        } else {
            runOnJS(playClickSound)();
            soloFindItViewModel.life -= 1;
            runOnJS(addWrongClick)(locationX, locationY);

            if (soloFindItViewModel.life <= 0) {
                runOnJS(() => {
                    soloFindItViewModel.roundFailEffect = true;
                    setTimeout(() => {
                        soloFindItViewModel.roundFailEffect = false;
                        navigation.navigate('SoloFindItResult', {
                            gameInfoList: gameInfoList,
                            isSuccess: false
                        });
                    }, 3000);
                })();
            }
        }
    }, [gameInfoList, correctPositions, navigation, soloFindItViewModel.round, soloFindItViewModel.life]);


    // ✅ 힌트 아이템 사용
    const handleHint = useCallback(() => {
        if (soloFindItViewModel.hints > 0) {
            const scaleX = IMAGE_FRAME_WIDTH / imageSize.current.width;
            const scaleY = IMAGE_FRAME_HEIGHT / imageSize.current.height;
            
            const unsolvedPositions = correctPositions.filter((pos: { x: number; y: number; }) => {
                const finalX = parseFloat((pos.x * scaleX).toFixed(2));
                const finalY = parseFloat((pos.y * scaleY).toFixed(2));
                return !soloFindItViewModel.correctClicks.some(click => 
                    Math.abs(click.x - finalX) < TOLERANCE && Math.abs(click.y - finalY) < TOLERANCE
                );
            });
            if (unsolvedPositions.length > 0) {
                // 랜덤하게 하나의 힌트 위치 선택
                const randomIndex = Math.floor(Math.random() * unsolvedPositions.length);
                const hintPos = unsolvedPositions[randomIndex];

                // 이미지 크기에 맞게 힌트 위치 조정
                const scaleX = IMAGE_FRAME_WIDTH / imageSize.current.width;
                const scaleY = IMAGE_FRAME_HEIGHT / imageSize.current.height;
                const scaledHintPos = {
                    x: parseFloat((hintPos.x / scaleX).toFixed(2)),
                    y: parseFloat((hintPos.y / scaleY).toFixed(2))
                };

                // 힌트 위치 설정
                runInAction(() => {
                    soloFindItViewModel.hintPosition = scaledHintPos;
                    soloFindItViewModel.hints -= 1;
                });

                setHintVisible(true);

                // 4초 후에 힌트 숨기기
                setTimeout(() => {
                    setHintVisible(false);
                    runInAction(() => {
                        soloFindItViewModel.hintPosition = null; // 힌트 위치 초기화
                    });
                }, 4000);
            }
        }
    }, [gameInfoList, correctPositions]);

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
            <View style={importedStyles.checkBoxContainer}>
                {Array.from({ length: total }, (_, i) => (
                    <Image
                        key={i}
                        source={
                            i < correctCount
                                ? require('../../assets/icons/find-it/check_box.png')
                                : require('../../assets/icons/find-it/empty_check_box.png')
                        }
                        style={importedStyles.checkBoxImage}
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
        setCorrectPositions(gameInfoList[soloFindItViewModel.round - 1].correctPositions);
    }, [soloFindItViewModel.round]);
    
    useEffect(() => {
        gameInfoList.forEach((gameInfo:any) => {
          Image.prefetch(gameInfo.normalUrl);
          Image.prefetch(gameInfo.abnormalUrl);
        });
      }, []);

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


    // Update useEffect for game over
    useEffect(() => {
        if (soloFindItViewModel.gameOver) {
            runInAction(() => {
                soloFindItViewModel.timerStopped = true;
                soloFindItViewModel.roundFailEffect = true;
            });
            setModalMessage('GAME OVER');
            setModalVisible(true);
            if (timerAnimation.current) {
                timerAnimation.current.stop();
            }
            setTimeout(() => {
                navigation.navigate('SoloFindItResult', { isSuccess: false, gameInfoList: gameInfoList });
            }, 1500);
        }
    }, [soloFindItViewModel.gameOver]);

    // 이미지 확대/축소 핸들러
    const handleZoom = (scaleFactor: number) => {
        // 이미지의 크기를 조정하는 대신, transform을 사용하여 확대/축소
        imageRef.current?.setNativeProps({
            style: {
                transform: [{ scale: scaleFactor }]
            }
        });
    };

    // 게임 시작 시 초기 정답 좌표 설정
    useEffect(() => {
        // 첫 라운드의 정답 좌표를 correctPositions에 저장
        const initialPositions = gameInfoList[0].correctPositions.map((pos: { x: number; y: number }) => ({ ...pos }));
        setCorrectPositions(initialPositions);
    }, []); // 빈 의존성 배열로 컴포넌트 마운트 시 한 번만 실행

    return (
        <View style={importedStyles.container}>
            <SoloHeader />
            {/* 상단 UI */}
            <View style={importedStyles.topBar}>
            </View>


            <View style={importedStyles.gameContainer}>
            {/* 정상 이미지 컨테이너 (정답, 오답 클릭 모두 지원) */}
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                <View style={importedStyles.normalImageContainer}>
                    <Animated.View style={[importedStyles.image, animatedStyle]}>
                        <TouchableWithoutFeedback 
                            onPress={handleImageClick}
                            disabled={soloFindItViewModel.roundClearEffect || soloFindItViewModel.roundFailEffect}
                        >
                            <View>
                                <Image
                                    source={{ uri: gameInfoList[currentRound - 1].normalUrl }}
                                    style={importedStyles.image}
                                    onLayout={(event) => {
                                        const { width, height } = event.nativeEvent.layout;
                                        imageSize.current = { width, height };
                                    }}
                                />
                                {/* 정답, 오답, 힌트 표시를 포함하는 View에 pointerEvents="none" 추가 */}
                                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                                    {/* 정답 표시 */}
                                    {soloFindItViewModel.correctClicks.map((pos, index) => (
                                        <AnimatedCircle 
                                            key={`correct-normal-${index}`} 
                                            x={pos.x} 
                                            y={pos.y} 
                                        />
                                    ))}
                                    {/* 오답 표시 */}
                                    {soloFindItViewModel.wrongClicks.map((pos, index) => (
                                        <AnimatedX 
                                            key={`wrong-normal-${index}`}
                                            x={pos.x}
                                            y={pos.y}
                                        />
                                    ))}
                                    {/* 힌트 표시 */}
                                    {hintVisible && soloFindItViewModel.hintPosition && (
                                        <AnimatedHint x={soloFindItViewModel.hintPosition.x} y={soloFindItViewModel.hintPosition.y} />
                                    )}
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </View>
            </GestureDetector>


            {/* ✅ 타이머 바 추가 */}
            <View style={importedStyles.timerContainer}>
                {/* 타이머 이미지 */}
                <Image
                    source={require('../../assets/icons/find-it/timer_bar.png')}
                    style={importedStyles.timerImage}
                />
                {/* 타이머 바 컨테이너 */}
                <View style={importedStyles.timerBarBorder}>
                    {/* 타이머 바 */}
                    <RNAnimated.View
                        style={[
                            importedStyles.timerBar,
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
            </View>
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, panGesture)}>
                    <View style={importedStyles.abnormalImageContainer}>
                    <Animated.View style={[importedStyles.image, animatedStyle]}>
                        {/* ✅ 틀린 그림 */}
                        <TouchableWithoutFeedback 
                            onPress={handleImageClick}
                            disabled={soloFindItViewModel.roundClearEffect || soloFindItViewModel.roundFailEffect}
                        >
                            <View>
                                <Image
                                    source={{ uri: gameInfoList[currentRound - 1].abnormalUrl }}
                                    style={importedStyles.image}
                                    onLayout={(event) => {
                                        const { width, height } = event.nativeEvent.layout;
                                        imageSize.current = { width, height };
                                    }}
                                />
                                {/* 정답, 오답, 힌트 표시를 포함하는 View에 pointerEvents="none" 추가 */}
                                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                                    {/* 정답 표시 */}
                                    {soloFindItViewModel.correctClicks.map((pos, index) => (
                                        <AnimatedCircle 
                                            key={`correct-abnormal-${index}`} 
                                            x={pos.x} 
                                            y={pos.y} 
                                        />
                                    ))}
                                    {/* 오답 표시 */}
                                    {soloFindItViewModel.wrongClicks.map((pos, index) => (
                                        <AnimatedX 
                                            key={`wrong-abnormal-${index}`}
                                            x={pos.x}
                                            y={pos.y}
                                        />
                                    ))}
                                    {/* 힌트 표시 */}
                                    {hintVisible && soloFindItViewModel.hintPosition && (
                                        <AnimatedHint x={soloFindItViewModel.hintPosition.x} y={soloFindItViewModel.hintPosition.y} />
                                    )}
                                </View>
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
                <View style={importedStyles.clearEffectContainer}>
                    <Image
                        source= {require('../../assets/icons/find-it/clear_star.png')} 
                        style={styles.clearIcon}
                    />
                    <Text style={importedStyles.clearEffectRound}>ROUND {soloFindItViewModel.round}</Text>
                    <Text style={importedStyles.clearEffectText}>클리어!</Text>
                    <View style={importedStyles.clearEffectTextContainer}>
                        <Text style={importedStyles.clearEffectMessage}>다음 라운드 준비중...</Text>
                    </View>
                </View>
            )}
            {soloFindItViewModel.roundFailEffect && (
                <View style={importedStyles.failEffectContainer}>
                    <Image
                        source={require('../../assets/icons/find-it/fail_star.png')} 
                        style={styles.clearIcon}
                    />
                    <Text style={importedStyles.clearEffectRound}>ROUND {soloFindItViewModel.round}</Text>
                    <Text style={importedStyles.clearEffectText}>게임오버</Text>
                    <View style={importedStyles.clearEffectTextContainer}>
                        <Text style={importedStyles.clearEffectMessage}>다시 도전해보세요!</Text>
                    </View>
                </View>
            )}

        </View>
    );
});

export default SoloFindItScreen;
