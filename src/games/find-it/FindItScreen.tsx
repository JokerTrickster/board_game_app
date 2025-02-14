import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Button, TouchableWithoutFeedback } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // ✅ 네비게이션 타입 import
import findItViewModel from './FindItViewModel'; // ✅ 올바른 경로로 변경
import { styles } from './FindItStyles';
import { RootStackParamList } from '../../navigation/navigationTypes';

const FindItScreen: React.FC = observer(() => {
    
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'FindIt'>>();
    const imageRef = useRef<View>(null);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const currentImage = findItViewModel.images[findItViewModel.currentImageIndex];
    useEffect(() => {
        findItViewModel.startTimer(() => {
            console.log('타이머 종료! 남은 정답 개수를 목숨에서 차감');
            if (findItViewModel.lives <= 0) {
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
        console.log(`라운드 ${findItViewModel.round} 시작!`);
    }, [findItViewModel.round]);

    useEffect(() => {
        if (findItViewModel.gameOver) {
            console.log("게임 종료 페이지로 이동ㅇㅇㅇㅇ!");
            navigation.navigate('GameOver');
        }
    }, [findItViewModel.gameOver]);
    
    useEffect(() => {
        if (findItViewModel.correctClicks.length === 5) {
            console.log("라운드 클리어! 1초 후 다음 라운드로 이동");

            // ✅ 1초 기다렸다가 다음 라운드 이동
            setTimeout(() => {
                findItViewModel.nextRound();
            }, 1000);
        }
    }, [findItViewModel.correctClicks.length]); // ✅ 정답 개수를 감지
    const handleImageClick = (event: any) => {
        const { pageX, pageY } = event.nativeEvent;
        const relativeX = pageX - imagePosition.x;
        const relativeY = pageY - imagePosition.y;

        console.log(`클릭 좌표: X=${relativeX}, Y=${relativeY}`);

        if (findItViewModel.isAlreadyClicked(relativeX, relativeY)) {
            console.log('이미 클릭된 위치입니다!');
            return;
        }

        const correctAreas = [
            { x: 50, y: 60, radius: 20 },
            { x: 200, y: 150, radius: 20 },
            { x: 120, y: 80, radius: 20 },
            { x: 180, y: 200, radius: 20 },
            { x: 90, y: 130, radius: 20 }
        ];

        let isCorrect = correctAreas.some(area => {
            const distance = Math.sqrt(
                Math.pow(relativeX - area.x, 2) + Math.pow(relativeY - area.y, 2)
            );
            return distance <= area.radius;
        });
        isCorrect = true;

        if (isCorrect) {
            findItViewModel.addCorrectClick(relativeX, relativeY);
        } else {
            findItViewModel.addWrongClick(relativeX, relativeY);
            findItViewModel.decreaseLife();
        }
    };

    return (
        <View style={styles.container}>
            {/* 상단 UI */}
            <View style={styles.topBar}>
                <Text style={styles.roundText}>Round {findItViewModel.round}</Text>
                <Text style={[styles.timerText, { color: findItViewModel.timerColor }]}>⏳ {findItViewModel.timer} 초</Text>
            </View>

            {/* 정상 이미지 */}
            <Image source={currentImage.normal} style={styles.image} />

            {/* 틀린 그림 찾기 */}
            <TouchableWithoutFeedback onPress={handleImageClick}>
                <View ref={imageRef} style={styles.imageContainer}>
                    <Image source={currentImage.different} style={styles.image} />

                    {/* ✅ 클릭한 정답(⭕) 위치 표시 */}
                    {findItViewModel.correctClicks.map((pos, index) => (
                        <View key={`correct-${index}`} style={[styles.correctCircle, { left: pos.x - 15, top: pos.y - 15 }]} />
                    ))}

                    {/* ✅ 클릭한 오답(❌) 위치 표시 */}
                    {findItViewModel.wrongClicks.map((pos, index) => (
                        <View key={`wrong-${index}`} style={[styles.wrongXContainer, { left: pos.x - 15, top: pos.y - 15 }]}>
                            <View style={[styles.wrongXLine, styles.wrongXRotate45]} />
                            <View style={[styles.wrongXLine, styles.wrongXRotate135]} />
                        </View>
                    ))}
                </View>
            </TouchableWithoutFeedback>

            {/* ✅ 게임 정보 한 줄로 정리 */}
            <View style={styles.infoRow}>
                <Text>남은 개수: {5 - findItViewModel.correctClicks.length}</Text>
                <Text>❤️ {findItViewModel.lives}</Text>
                <Button title={`💡 ${findItViewModel.hints}`} onPress={() => findItViewModel.useHint()} />
                <Button title={`⏳ ${findItViewModel.item_timer_stop}`} onPress={() => findItViewModel.useTimerStopItem()} />
            </View>
        </View>
    );
});

export default FindItScreen;
