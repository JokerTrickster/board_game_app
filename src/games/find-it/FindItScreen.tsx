import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Button, TouchableWithoutFeedback } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/navigationTypes'; // ✅ 타입 import
import gameViewModel from '../viewmodels/GameViewModel';
import { styles } from './FindItStyles';

const GameScreen: React.FC = observer(() => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Game'>>(); // ✅ 네비게이션 타입 적용
    const imageRef = useRef<View>(null);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        gameViewModel.startTimer(() => {
            console.log('타이머 종료! 다음 라운드로 이동 또는 게임 오버');
        });

        // ✅ 이미지가 렌더링된 후 위치를 정확히 가져오기
        setTimeout(() => {
            if (imageRef.current) {
                imageRef.current.measure((fx, fy, width, height, px, py) => {
                    console.log("이미지 좌표 측정됨:", px, py);
                    setImagePosition({ x: px, y: py });
                });
            }
        }, 500);
    }, []);
    useEffect(() => {
        console.log(`라운드 ${gameViewModel.round} 시작!`);
    }, [gameViewModel.round]);

    useEffect(() => {
        console.log(gameViewModel.gameOver);
        // ✅ 게임 종료 시 "GameOverScreen"으로 이동
        if (gameViewModel.gameOver) {
            console.log("게임 종료 페이지로 이동!");
            navigation.navigate('GameOver'); // ✅ 네비게이션을 사용하여 이동
        }
    }, [gameViewModel.gameOver]);

    const handleImageClick = (event: any) => {
        const { pageX, pageY } = event.nativeEvent;

        // ✅ 터치한 좌표를 이미지 내부 좌표로 변환
        const relativeX = pageX - imagePosition.x;
        const relativeY = pageY - imagePosition.y;

        console.log(`클릭 좌표: X=${relativeX}, Y=${relativeY}`);

        // ✅ 이미 클릭된 위치인지 확인 후 무시
        if (gameViewModel.isAlreadyClicked(relativeX, relativeY)) {
            console.log('이미 클릭된 위치입니다!');
            return;
        }

        // ✅ 정답 영역 (예제 좌표: x, y, radius)
        const correctAreas = [
            { x: 50, y: 60, radius: 20 },
            { x: 200, y: 150, radius: 20 },
            { x: 120, y: 80, radius: 20 },
            { x: 180, y: 200, radius: 20 },
            { x: 90, y: 130, radius: 20 }
        ];

        let isCorrect = true;

        // 랜덤으로 정답인지 틀렸는지 표시
        if (Math.random() > 0.5) {
            isCorrect = true;
        }

        if (isCorrect) {
            gameViewModel.addCorrectClick(relativeX, relativeY);
        } else {
            gameViewModel.addWrongClick(relativeX, relativeY);
            gameViewModel.decreaseLife();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.roundText}>Round {gameViewModel.round}</Text>
                <Text style={[styles.timerText, { color: gameViewModel.timerColor }]}>⏳ {gameViewModel.timer} 초</Text>
            </View>

            <Image source={require('../assets/normal_image.png')} style={styles.image} />

            <TouchableWithoutFeedback onPress={handleImageClick}>
                <View ref={imageRef} style={styles.imageContainer}>
                    <Image source={require('../assets/different_image.png')} style={styles.image} />

                    {/* ✅ 클릭한 정답(⭕) 위치 표시 */}
                    {gameViewModel.correctClicks.map((pos, index) => (
                        <View key={`correct-${index}`} style={[styles.correctCircle, { left: pos.x - 15, top: pos.y - 15 }]} />
                    ))}

                    {/* ✅ 클릭한 오답(❌) 위치 표시 */}
                    {gameViewModel.wrongClicks.map((pos, index) => (
                        <View key={`wrong-${index}`} style={[styles.wrongXContainer, { left: pos.x - 15, top: pos.y - 15 }]}>
                            <View style={[styles.wrongXLine, styles.wrongXRotate45]} />
                            <View style={[styles.wrongXLine, styles.wrongXRotate135]} />
                        </View>
                    ))}
                </View>
            </TouchableWithoutFeedback>

            <View style={styles.infoContainer}>
                <Text>❤️ 목숨: {gameViewModel.lives}</Text>
                <Text> 타이머: {gameViewModel.item_timer_stop}</Text>
                <Text>💡 힌트: {gameViewModel.hints}</Text>
            </View>

            <View style={styles.buttonContainer}>
                <Button title="힌트 사용" onPress={() => gameViewModel.useHint()} />
                <Button title="타이머 멈추기" onPress={() => gameViewModel.useTimerStopItem()} />
            </View>
        </View>
    );
});


export default GameScreen;
