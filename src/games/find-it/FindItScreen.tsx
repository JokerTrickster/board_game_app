import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Button, TouchableWithoutFeedback, Animated, TouchableOpacity, Easing } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // ✅ 네비게이션 타입 import
import findItViewModel from './FindItViewModel'; // ✅ 올바른 경로로 변경
import { styles } from './FindItStyles';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { webSocketService } from '../../services/WebSocketService';

const FindItScreen: React.FC = observer(() => {
    
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'FindIt'>>();
    const imageRef = useRef<View>(null);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const currentImage = findItViewModel.images[findItViewModel.currentImageID];
    // ✅ 타이머 바 애니메이션 설정
    const timerWidth = useRef(new Animated.Value(100)).current;
    const timerAnimation = useRef<Animated.CompositeAnimation | null>(null);
    const remainingTime = useRef(findItViewModel.timer); // ✅ 남은 시간 저장
    const isPaused = useRef(false); // ✅ 타이머 정지 여부
    const isRoundChanging = useRef(false); // ✅ 현재 라운드 변경 중인지 여부
    const [hintVisible, setHintVisible] = useState(false); // ✅ 힌트 표시 여부

    // ✅ 타이머 바 애니메이션 시작 (남은 시간만큼 진행)
    const startTimerAnimation = (duration: number) => {
        if (timerAnimation.current) {
            timerAnimation.current.stop(); // ✅ 기존 애니메이션 중지
        }

        // ✅ 현재 남은 시간 비율 계산
        const remainingRatio = duration / 60; // 남은 시간 / 60초 (비율)
        const remainingWidth = remainingRatio * 100; // 100% 기준으로 변환
        timerWidth.setValue(remainingWidth); // ✅ 현재 진행 상태 반영

        timerAnimation.current = Animated.timing(timerWidth, {
            toValue: 0,
            duration: duration * 1000, // ✅ 남은 시간 그대로 사용 (줄어드는 속도 일정 유지)
            easing: Easing.linear, // ✅ 선형 속도로 일정하게 줄어들도록 설정
            useNativeDriver: false,
        });

        timerAnimation.current.start();
    };

    // ✅ 힌트 좌표가 변경될 때마다 감지하여 5초 후 제거
    useEffect(() => {
        if (findItViewModel.hintPosition) {
            setHintVisible(true);
            setTimeout(() => setHintVisible(false), 5000);
        }
    }, [findItViewModel.hintPosition]);

    useEffect(() => {
        startTimerAnimation(findItViewModel.timer);  // ✅ 라운드가 시작될 때 애니메이션 시작
        findItViewModel.startTimer(() => {
            console.log('타이머 종료! 남은 정답 개수를 목숨에서 차감');
            if (findItViewModel.life <= 0) {
                console.log('💀 게임 종료!');
                navigation.navigate('GameOver');
            }
        });

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

 
    useEffect(() => {
        if (findItViewModel.gameOver) {
            console.log("게임 종료 페이지로 이동!");
            navigation.navigate('GameOver');
        }
    }, [findItViewModel.gameOver]);
    
    useEffect(() => {
        if (findItViewModel.correctClicks.length === 5 && !isRoundChanging.current) {
            console.log("라운드 클리어! 1초 후 다음 라운드로 이동");
            isRoundChanging.current = true; // ✅ 중복 실행 방지

            setTimeout(() => {
                startTimerAnimation(60); // ✅ 다음 라운드에서 타이머 바 초기화
                findItViewModel.nextRound();
                isRoundChanging.current = false; // ✅ 라운드 변경 완료 후 다시 false
            }, 1000);
        }
    }, [findItViewModel.correctClicks.length]); // ✅ 정답 개수를 감지


    const handleImageClick = (event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        let relativeX = pageX - imagePosition.x;
        let relativeY = pageY - imagePosition.y;

        // ✅ 좌표를 소수점 2자리까지 반올림
        relativeX = parseFloat(relativeX.toFixed(2));
        relativeY = parseFloat(relativeY.toFixed(2));

        console.log(`📍 클릭 좌표: X=${relativeX}, Y=${relativeY}`);

        if (findItViewModel.isAlreadyClicked(relativeX, relativeY)) {
            console.log('⚠️ 이미 클릭된 위치입니다!');
            return;
        }

        const currentRound = findItViewModel.round;
        const currentImageId = findItViewModel.currentImageID; // ✅ 현재 이미지 ID

        // ✅ 서버로 클릭한 좌표 전송 (반올림된 좌표)
        webSocketService.sendSubmitPosition(currentRound, currentImageId, relativeX, relativeY);
    };
    // ✅ 힌트 아이템 사용d
    const handleHint = () => {
        if (findItViewModel.hints > 0) {
            console.log("💡 힌트 아이템 사용!");

            // ✅ 서버에 아이템 사용 이벤트 전송
            webSocketService.sendHintItemEvent();
        }
       
    };
    // ✅ 타이머 멈춤 아이템 사용 시 타이머 바 멈추기
    const handleTimerStop = () => {
        if (findItViewModel.item_timer_stop > 0 && !findItViewModel.timerStopped) {
            console.log("⏳ 타이머 멈춤 아이템 사용!");
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
            webSocketService.sendTimerItemEvent();
        }
    };
    return (
        <View style={styles.container}>
            {/* 상단 UI */}
            <View style={styles.topBar}>
                <Text style={styles.roundText}>Round {findItViewModel.round}</Text>
            </View>

            {/* ✅ 정상 이미지 + 정답(⭕) 표시 */}
            <View style={styles.imageContainer}>
                <Image source={currentImage.normal} style={styles.image} />
                {findItViewModel.correctClicks.map((pos, index) => (
                    <View key={`correct-normal-${index}`} style={[styles.correctCircle, { left: pos.x - 15, top: pos.y - 15 }]} />
                ))}
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
            {/* ✅ 틀린 그림 + 정답(⭕) & 오답(❌) 표시 */}
            <TouchableWithoutFeedback onPress={handleImageClick}>
                <View ref={imageRef} style={styles.imageContainer}>
                    <Image source={currentImage.different} style={styles.image} />

                    {/* ✅ 정답 표시 (⭕) */}
                    {findItViewModel.correctClicks.map((pos, index) => (
                        <View key={`correct-diff-${index}`} style={[styles.correctCircle, { left: pos.x - 15, top: pos.y - 15 }]} />
                    ))}

                    {/* ✅ 오답 표시 (❌) */}
                    {findItViewModel.wrongClicks.map((pos, index) => (
                        <View key={`wrong-${index}`} style={[styles.wrongXContainer, { left: pos.x - 15, top: pos.y - 15 }]}>
                            <View style={[styles.wrongXLine, styles.wrongXRotate45]} />
                            <View style={[styles.wrongXLine, styles.wrongXRotate135]} />
                        </View>
                    ))}

                    {/* ✅ 힌트 위치 표시 (🟢 초록색 원) */}
                    {findItViewModel.hintPosition && (
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
        </View>
    );
});

export default FindItScreen;
