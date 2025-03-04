import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Linking } from 'react-native';
import Header from '../components/Header';
import styles from '../styles/GameDetailStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { findItWebSocketService } from '../services/FindItWebSocketService';
import { gameService } from '../services/GameService';

const GameDetailScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { game } = route.params; // ✅ HomeScreen에서 전달한 Header 가져오기

    const [userData, setUserData] = useState<any>(null);
    const [isMatching, setIsMatching] = useState(false); // ✅ 매칭 중 상태 추가
    const [matchMessage, setMatchMessage] = useState("매칭하기 또는 함께하기\n선택해 주세요!"); // ✅ 메시지 상태 추가

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = await gameService.getUserInfo();
            if (storedUser) {
                setUserData(storedUser);
            }
        };
        fetchUserData();
    }, []);

    // ✅ GameDetailScreen에서 Header 설정 (navigation.setOptions 사용)
    useEffect(() => {
        navigation.setOptions({
            header: () => <Header userData={userData} />,
        });
    }, [userData]);

    const handleMatching = () => {
        switch (game.title) {
            case '틀린그림찾기':
                findItWebSocketService.connect();
                break;
            case '장미의전쟁':
                break;
            case '카르카손':
                break;
            case '카후나':
                break;
            default:
                Alert.alert('오류', '게임 매칭을 시작할 수 없습니다.');
                return;
        }
        // ✅ 매칭 시작 UI 업데이트
        setIsMatching(true);
        setMatchMessage("매칭 중입니다...");

        Alert.alert('매칭 시작', `${game.title} 게임 매칭을 시작합니다.`);
    };

    const handleCancelMatching = () => {
        // ✅ 매칭 취소 이벤트 전송
        findItWebSocketService.sendMatchCancelEvent();

        // ✅ UI 상태 업데이트
        setIsMatching(false);
        setMatchMessage("매칭하기 또는 함께하기\n선택해 주세요!");

        Alert.alert('매칭 취소', '매칭이 취소되었습니다.');
    };

    return (
        <View style={styles.container}>
            <Header userData={userData} />
            {/* 뒤로가기 버튼 */}
            <View style={styles.titleRow}>
                <Text style={styles.gameTitle}>{game.title || '게임 제목 없음'}</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="angle-left" size={50} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.detailContainer}>
                {/* 
                  1) 이미지 왼쪽, 2) 튜토리얼 / 영상 보기 오른쪽 
                */}
                <View style={styles.topRow}>
                    <Image source={{ uri: game.image }} style={styles.gameImage} />

                    <View style={styles.rightColumn}>
                        {/* 게임 설명 */}
                        <TouchableOpacity style={styles.infoCard}>
                            <Text style={styles.infoText}>{game.description}</Text>
                        </TouchableOpacity>

                        {/* 유튜브 링크 */}
                        {game.youtubeUrl && (
                            <TouchableOpacity
                                style={styles.infoCard}
                                onPress={() => Linking.openURL(game.youtubeUrl)}>
                                <Text style={styles.infoText}>🎥 튜토리얼 영상 보기</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* 안내 메시지 (가이드) */}
                <View style={styles.actionCard}>
                    <Text style={styles.actionText}>{matchMessage}</Text>
                </View>

                {/* 매칭/함께하기 버튼 */}
                <View style={styles.buttonContainer}>
                    {isMatching ? (
                        <TouchableOpacity
                            style={[styles.matchButton, { backgroundColor: '#FF5C5C' }]}
                            onPress={handleCancelMatching}
                        >
                            <Text style={styles.buttonText}>매칭 취소</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.matchButton}
                            onPress={handleMatching}
                        >
                            <Text style={styles.buttonText}>매칭하기</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.togetherButton,
                            isMatching && { backgroundColor: '#ccc' }
                        ]}
                        onPress={() => {
                            if (!isMatching) {
                                Alert.alert('함께하기', '준비 중입니다.');
                            }
                        }}
                        disabled={isMatching}
                    >
                        <Text style={styles.buttonText}>함께하기</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default GameDetailScreen;
