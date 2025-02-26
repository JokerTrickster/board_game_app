import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
        switch (game) {
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

        Alert.alert('매칭 시작', `${game} 게임 매칭을 시작합니다.`);
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
            <Header />
            {/* 뒤로가기 버튼 추가 */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="angle-left" size={30} color="#000" />
            </TouchableOpacity>

            <Text style={styles.gameTitle}>{game}</Text>

            <ScrollView contentContainerStyle={styles.detailContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryText}>게임 썸네일</Text>
                </View>

                <View style={styles.infoContainer}>
                    <TouchableOpacity style={styles.infoCard}>
                        <Text style={styles.infoText}>게임설명</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.infoCard}>
                        <Text style={styles.infoText}>튜토리얼 영상 (유튜브)</Text>
                    </TouchableOpacity>
                </View>

                {/* ✅ 매칭 상태에 따라 메시지 변경 */}
                <View style={styles.actionCard}>
                    <Text style={styles.actionText}>{matchMessage}</Text>
                </View>

                <View style={styles.buttonContainer}>
                    {/* ✅ 매칭 상태에 따라 버튼 변경 */}
                    {isMatching ? (
                        <TouchableOpacity
                            style={[styles.matchButton, { backgroundColor: '#FF5C5C' }]} // 빨간색(매칭 취소)
                            onPress={handleCancelMatching}>
                            <Text style={styles.buttonText}>매칭 취소</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.matchButton}
                            onPress={handleMatching}>
                            <Text style={styles.buttonText}>매칭하기</Text>
                        </TouchableOpacity>
                    )}

                    {/* ✅ 매칭 중이면 함께하기 버튼 비활성화 */}
                    <TouchableOpacity
                        style={[
                            styles.togetherButton,
                            isMatching && { backgroundColor: '#ccc' } // 비활성화 스타일
                        ]}
                        onPress={() => {
                            if (!isMatching) {
                                Alert.alert('함께하기', '준비 중입니다.');
                            }
                        }}
                        disabled={isMatching}>
                        <Text style={styles.buttonText}>함께하기</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default GameDetailScreen;
