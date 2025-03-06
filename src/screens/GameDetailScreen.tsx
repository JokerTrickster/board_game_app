import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Linking, ImageBackground, Modal } from 'react-native';
import Header from '../components/Header';
import styles from '../styles/ReactGameDetailStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { findItWebSocketService } from '../services/FindItWebSocketService';
import { WebView } from 'react-native-webview';
import { gameService } from '../services/GameService';

const GameDetailScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { game } = route.params; // ✅ HomeScreen에서 전달한 Header 가져오기

    const [userData, setUserData] = useState<any>(null);
    const [isMatching, setIsMatching] = useState(false); // ✅ 매칭 중 상태 추가
    const [matchMessage, setMatchMessage] = useState("매칭하기 또는 함께하기\n선택해 주세요!"); // ✅ 메시지 상태 추가
    // 모달 상태: 게임 설명 모달, 유튜브 모달
    const [isDescriptionModalVisible, setDescriptionModalVisible] = useState(false);
    const [isYoutubeModalVisible, setYoutubeModalVisible] = useState(false);

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
        <ImageBackground
            source={require('../assets/images/common/background_basic.png')}
            style={styles.background}
        >
        <View style={styles.container}>
            <Header userData={userData} />
            {/* 뒤로가기 버튼 */}
            <View style={styles.titleRow}>
                    {game.title === '틀린그림찾기' ? (
                        <Image
                            source={require('../assets/images/game_detail/find_it_title.png')}
                            style={styles.gameTitleImage} // 원하는 크기와 위치로 스타일 지정
                        />
                    ) : (
                        <Text style={styles.gameTitle}>{game.title || '게임 제목 없음'}</Text>
                    )}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="angle-left" size={50} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.detailContainer}>
                {/* 
                  1) 이미지 왼쪽, 2) 튜토리얼 / 영상 보기 오른쪽 
                */}
                <View style={styles.topRow}>
                        <Image
                            source={
                                game.title === '틀린그림찾기'
                                    ? require('../assets/images/common/find-it.png')
                                    : require('../assets/images/common/default.png')
                            }
                            style={styles.gameImage}
                        />

                    <View style={styles.rightColumn}>
                        {/* 게임 설명 */}
                            {/* 게임 설명 영역: placeholder 이미지로 덮고, 터치 시 모달 오픈 */}
                            <TouchableOpacity style={styles.infoCard} onPress={() => setDescriptionModalVisible(true)}>
                                <Image
                                    source={require('../assets/images/game_detail/tutorial_image.png')}
                                    style={styles.infoImage}
                                />
                            </TouchableOpacity>

                        {/* 유튜브 링크 */}
                            {game.youtubeUrl && (
                                <TouchableOpacity style={styles.infoCard} onPress={() => setYoutubeModalVisible(true)}>
                                    <Image
                                        source={require('../assets/images/game_detail/tutorial_youtube.png')}
                                        style={styles.infoImage}
                                    />
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
                
                {/* 게임 설명 모달 */}
                <Modal
                    visible={isDescriptionModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setDescriptionModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <ScrollView>
                                <Text style={styles.modalDescriptionText}>{game.description}</Text>
                            </ScrollView>
                            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setDescriptionModalVisible(false)}>
                                <Text style={styles.modalCloseButtonText}>닫기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* 유튜브 영상 모달 */}
                <Modal
                    visible={isYoutubeModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setYoutubeModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <WebView
                                style={styles.youtubeWebView}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                source={{ uri: 'https://www.youtube.com/embed/HDanI-V1iyM?si=eh5Gvz0XHmhmrx3Q' }}
                            />
                            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setYoutubeModalVisible(false)}>
                                <Text style={styles.modalCloseButtonText}>닫기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </ImageBackground>
    );
};

export default GameDetailScreen;
