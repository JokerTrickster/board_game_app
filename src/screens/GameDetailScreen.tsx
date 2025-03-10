import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Linking, Share, TextInput, ImageBackground, Modal } from 'react-native';
import Header from '../components/Header';
import styles from '../styles/ReactGameDetailStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { findItWebSocketService } from '../services/FindItWebSocketService';
import { WebView } from 'react-native-webview';
import { gameService } from '../services/GameService';
import ActionCard from '../components/ActionCard';
import { findItService } from '../services/FindItService';

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
    // 함께하기 옵션 모달 상태 추가
    const [isTogetherModalVisible, setTogetherModalVisible] = useState(false);
    const [isFriendMode, setFriendMode] = useState(false);
    const [authCodeInput, setAuthCodeInput] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isWaitingModalVisible, setWaitingModalVisible] = useState(false);
    const podiumData = [
        {
            rank: 2,
            profileImage: require('../assets/images/home/default_profile.png'),
            nickname: '라이언',
            title: '보드게임 초보자',
            score: 75,
        },
        {
            rank: 1,
            profileImage: require('../assets/images/home/default_profile.png'),
            nickname: '조커',
            title: '보드게임 매니아',
            score: 95,
        },
        {
            rank: 3,
            profileImage: require('../assets/images/home/default_profile.png'),
            nickname: '혜봉',
            title: '보드게임 중급자',
            score: 65,
        },
    ];

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
    const handleSoloPlay = async () => {
        try {
            const gameInfoList = await findItService.fetchSoloPlayGameInfo(10);
            (navigation as any).navigate("SoloFindIt", { gameInfoList });
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
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

                {/* 뒤로가기 및 제목 영역 */}
                <View style={styles.titleRow}>
                    {game.title === '틀린그림찾기' ? (
                        <Image
                            source={require('../assets/images/game_detail/find_it_title.png')}
                            style={styles.gameTitleImage}
                        />
                    ) : (
                        <Text style={styles.gameTitle}>{game.title || '게임 제목 없음'}</Text>
                    )}
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="angle-left" size={50} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* 콘텐츠 영역: ScrollView로 스크롤 가능 */}
                <View style={styles.content}>
                    <ScrollView contentContainerStyle={styles.detailContainer}>
                        {/* 상단 영역: 게임 이미지와 오른쪽 카드 */}
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
                                <TouchableOpacity style={styles.infoCard} onPress={() => setDescriptionModalVisible(true)}>
                                    <Image
                                        source={require('../assets/images/game_detail/tutorial_image.png')}
                                        style={styles.infoImage}
                                    />
                                </TouchableOpacity>
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

                        {/* 안내 메시지 */}
                        <ActionCard podiumData={podiumData} />
                    </ScrollView>
                </View>

            {/* 하단 버튼 영역: 항상 화면 하단에 고정 */}
            <View style={styles.buttonContainer}>
                {/* 혼자하기 버튼 (이미지 + 텍스트) */}
                <TouchableOpacity
                    style={styles.aloneButton}
                    onPress={handleSoloPlay}
                >
                    <ImageBackground
                        source={require('../assets/images/game_detail/alone_button.png')}
                        style={styles.aloneButtonImage}
                        imageStyle={{ resizeMode: 'contain' }}
                    >
                        <Text style={styles.soloButtonText}>혼자하기</Text>
                    </ImageBackground>
                </TouchableOpacity>

                {/* 함께하기 버튼 (이미지 + 텍스트) */}
                    <TouchableOpacity
                        style={styles.togetherButton}
                        onPress={() => {
                            if (!isMatching) {
                                setTogetherModalVisible(true);
                            }
                        }}
                        disabled={isMatching}
                    >
                    <ImageBackground
                        source={require('../assets/images/game_detail/match_button.png')}
                        style={styles.togetherButtonImage}
                        imageStyle={{ resizeMode: 'contain' }}
                    >
                        <Text style={styles.togetherButtonText}>함께하기</Text>
                    </ImageBackground>
                </TouchableOpacity>
            </View>

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
                
                {/* 함께하기 옵션 모달 */}
                <Modal
                    visible={isTogetherModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => {
                        setTogetherModalVisible(false);
                        setFriendMode(false);
                        setAuthCodeInput('');
                        setGeneratedCode('');
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.togetherModalContent}>
                            {!isFriendMode ? (
                                <>
                                    <Text style={styles.modalTitle}>게임 매칭 방식을 선택해주세요.</Text>
                                    <TouchableOpacity
                                        style={styles.modalButton}
                                        onPress={() => {
                                            handleMatching();
                                            setTogetherModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.modalButtonText}>랜덤 매칭</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalButton}
                                        onPress={() => setFriendMode(true)}
                                    >
                                        <Text style={styles.modalButtonText}>친구와 함께</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalCloseButton}
                                        onPress={() => setTogetherModalVisible(false)}
                                    >
                                        <Text style={styles.modalCloseButtonText}>닫기</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.modalTitle}>친구와 함께 하시겠습니까?</Text>
                                    <TextInput
                                        style={styles.friendInput}
                                        placeholder="인증 코드 입력"
                                        value={authCodeInput}
                                        onChangeText={setAuthCodeInput}
                                        keyboardType="numeric"
                                    />
                                    <TouchableOpacity
                                        style={styles.modalButton}
                                        onPress={() => {
                                            Alert.alert('방 참여 준비중입니다.', `입력한 코드: ${authCodeInput}`);
                                            setTogetherModalVisible(false);
                                            setFriendMode(false);
                                            setAuthCodeInput('');
                                            setGeneratedCode('');
                                        }}
                                    >
                                        <Text style={styles.modalButtonText}>방 참여</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalButton}
                                        onPress={() => {
                                            const code = Math.floor(1000 + Math.random() * 9000).toString();
                                            setGeneratedCode(code);
                                            setTogetherModalVisible(false);
                                            setWaitingModalVisible(true);
                                        }}
                                    >
                                        <Text style={styles.modalButtonText}>방 생성</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalButton}
                                        onPress={() => {
                                            setFriendMode(false);
                                            setAuthCodeInput('');
                                            setGeneratedCode('');
                                        }}
                                    >
                                        <Text style={styles.modalButtonText}>뒤로가기</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>

                {/* 방 생성 후 대기 모달 */}
                <Modal
                    visible={isWaitingModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setWaitingModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.waitingModalContent}>
                            <Text style={styles.modalTitle}>인증 코드와 참여자를 기다리는 중입니다.</Text>
                            <View style={styles.codeContainer}>
                                <Text style={styles.generatedCodeText}>{generatedCode}</Text>
                                <TouchableOpacity
                                    style={styles.copyButton}
                                    onPress={async () => {
                                        try {
                                            await Share.share({ message: generatedCode });
                                        } catch (error: any) {
                                            Alert.alert('공유 실패', error.message);
                                        }
                                    }}
                                >
                                    <Text style={styles.copyButtonText}>복사하기</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setWaitingModalVisible(false)}
                            >
                                <Text style={styles.modalCloseButtonText}>닫기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

        </View>
        </ImageBackground >
    );
};

export default GameDetailScreen;
