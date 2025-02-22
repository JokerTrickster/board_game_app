import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { View, Text, Image, Button, TouchableWithoutFeedback, Animated, TouchableOpacity, Easing } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // ✅ 네비게이션 타입 import
import findItViewModel from './FindItViewModel'; // ✅ 올바른 경로로 변경
import { styles } from './FindItStyles';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { webSocketService } from '../../services/WebSocketService';
import AnimatedCircle from './AnimatedCircle';

const FindItScreen: React.FC = observer(() => {
    
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'FindIt'>>();
    const imageRef = useRef<View>(null);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    // ✅ 타이머 바 애니메이션 설정
    const timerWidth = useRef(new Animated.Value(100)).current;
    const timerAnimation = useRef<Animated.CompositeAnimation | null>(null);
    const remainingTime = useRef(findItViewModel.timer); // ✅ 남은 시간 저장
    const isPaused = useRef(false); // ✅ 타이머 정지 여부
    const [hintVisible, setHintVisible] = useState(false); // ✅ 힌트 표시 여부
    // ✅ MobX 상태 변경 감지를 위한 useState 선언
    const [normalImage, setNormalImage] = useState<string | null>(findItViewModel.normalImage);
    const [abnormalImage, setAbnormalImage] = useState<string | null>(findItViewModel.abnormalImage);

    // ✅ 타이머 바 애니메이션 시작 (남은 시간만큼 진행)
    const startTimerAnimation = useCallback((duration: number, reset: boolean = true) => {
        if (timerAnimation.current) {
            timerAnimation.current.stop(); // 기존 애니메이션 중지
        }

        // ✅ 타이머 멈춤 아이템 사용 후 재개 시에는 초기화하지 않음
        if (reset) {
            timerWidth.setValue(100); // 새로운 라운드 시작 시만 타이머 바를 꽉 채움
        }

        timerAnimation.current = Animated.timing(timerWidth, {
            toValue: 0,
            duration: duration * 1000, // 남은 시간만큼 진행
            easing: Easing.linear,
            useNativeDriver: false,
        });

        timerAnimation.current.start();
    }, []);
    // ✅ 클릭 핸들러를 `useCallback`으로 최적화
    const handleImageClick = useCallback((event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        let relativeX = pageX - imagePosition.x;
        let relativeY = pageY - imagePosition.y;

        relativeX = parseFloat(relativeX.toFixed(2));
        relativeY = parseFloat(relativeY.toFixed(2));

        if (findItViewModel.isAlreadyClicked(relativeX, relativeY)) return;

        webSocketService.sendSubmitPosition(
            findItViewModel.round,
            relativeX,
            relativeY
        );
    }, [imagePosition]);
    // ✅ 힌트 아이템 사용
    const handleHint = () => {
        if (findItViewModel.hints > 0) {
            // ✅ 서버에 아이템 사용 이벤트 전송
            webSocketService.sendHintItemEvent();
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
                startTimerAnimation(remainingTime.current, false); // ✅ 남은 시간만큼 다시 진행
            }, 5000);
            // ✅ 서버에 아이템 사용 이벤트 전송
            webSocketService.sendTimerItemEvent();
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
            console.log(`⏳ 라운드 ${findItViewModel.round} 시작! 타이머 초기화.`);
            startTimerAnimation(60,true);
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
            if (timerAnimation.current) {
                findItViewModel.timerStopped = true;
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
            <View style={styles.imageContainer}>
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
            </View>
            {/* ✅ 타이머 바 추가 */}
            <View style={styles.timerBarContainer}>
                <Animated.View style={[styles.timerBar, {
                    width: timerWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: findItViewModel.timerStopped ? 'red' : 'green'
                }]} />
            </View>
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

                    {/* ✅ 힌트 표시 */}
                    {hintVisible && findItViewModel.hintPosition && (
                        <View style={[styles.hintCircle, { left: findItViewModel.hintPosition.x - 15, top: findItViewModel.hintPosition.y - 15 }]} />
                    )}
                </View>
            </TouchableWithoutFeedback>

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
        </View>
    );
});

export default FindItScreen;
