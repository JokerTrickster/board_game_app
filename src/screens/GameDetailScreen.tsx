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
import soloGameViewModel from '../games/find-it/SoloFindItViewModel';

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
    const [togetherModalBackground, setTogetherModalBackground] = useState(
        require('../assets/images/game_detail/together_start.png')
    );
    // 추가: 모달 텍스트 state 선언 (컴포넌트 상단에 추가)
    const [modalContentText, setModalContentText] = useState("게임 매칭 방식을 선택해주세요.");
    // 추가: 모달 타입 state (기본: "start")
    const [modalType, setModalType] = useState("start");

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

    };
    const handleSoloPlay = async () => {
        try {
            soloGameViewModel.resetGameState();
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

    };

    return (
        <ImageBackground
            source={require('../assets/images/common/background_basic.png')}
            style={styles.background}
        >
            <Header userData={userData} />

            <View style={styles.container}>

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

                <View style={styles.content}>
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
                        onPress={() => setTogetherModalVisible(true)}
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
                        setTogetherModalBackground(require('../assets/images/game_detail/together_start.png'));
                        setModalType("start");
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <ImageBackground
                            source={togetherModalBackground}
                            style={styles.togetherModalContent}
                            imageStyle={styles.togetherModalImage}
                        >
                            {/* 조건부로 모달 타입에 따라 다른 텍스트와 위치 렌더링 */}
                            {modalType === "start" && (
                                <><Text style={styles.modalTitleStart}>게임 매칭 방식을 선택해주세요.</Text><TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => {
                                        // 랜덤 매칭 버튼: 배경 및 텍스트 타입 변경
                                        setTogetherModalBackground(require('../assets/images/game_detail/random_match.png'));
                                        setModalType("random");
                                        handleMatching();
                                    } }
                                >
                                    <Text style={styles.modalButtonText}>랜덤 매칭</Text>
                                </TouchableOpacity><TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => {
                                        // 친구와 함께 버튼: 배경 및 텍스트 타입 변경
                                        setTogetherModalBackground(require('../assets/images/game_detail/together_join.png'));
                                        setModalType("together");
                                    } }
                                >
                                        <Text style={styles.modalButtonText}>친구와 함께</Text>
                                    </TouchableOpacity>
                                    {/* 닫기 버튼 */}
                                    <TouchableOpacity
                                        style={styles.modalCloseIcon}
                                        onPress={() => {
                                            setTogetherModalVisible(false);
                                            setTogetherModalBackground(require('../assets/images/game_detail/together_start.png'));
                                            setModalType("start");
                                        }}
                                    >
                                        <Image
                                            source={require('../assets/images/game_detail/close.png')}
                                            style={styles.modalCloseIconImage}
                                        />
                                    </TouchableOpacity>
                                </>
                            )}
                            {modalType === "random" && (
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={styles.modalTitleRandom}>상대를 찾는 중....</Text>
                                    <Text style={styles.modalSubtitleRandom}>잠시만 기다려주세요.</Text>
                                    <TouchableOpacity
                                        style={styles.modalCancelButton}
                                        onPress={() => {
                                            // 매칭 취소 로직 실행 (예시)
                                            handleCancelMatching();
                                            setTogetherModalVisible(false);
                                            setTogetherModalBackground(require('../assets/images/game_detail/together_start.png'));
                                            setModalType("start");
                                        }}
                                    >
                                        <Text style={styles.modalCancelButtonText}>매칭 취소</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {modalType === "together" && (
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    {/* 방만들기 버튼 */}
                                    <TouchableOpacity
                                        style={styles.createRoomButton}
                                        onPress={() => {
                                            // 랜덤 매칭 버튼: 배경 및 텍스트 타입 변경
                                            setTogetherModalBackground(require('../assets/images/game_detail/random_match.png'));
                                            setModalType("together_create");
                                            const code = Math.floor(1000 + Math.random() * 9000).toString();
                                            setGeneratedCode(code);
                                        }}
                                    >
                                        <Text style={styles.createRoomButtonText}>방만들기 -100</Text>
                                    </TouchableOpacity>
                                    {/* 참여코드 입력하기 텍스트 */}
                                    <Text style={styles.joinPromptText}>참여코드 입력하기</Text>


                                    {/* 참여코드 입력칸 + 참가하기 버튼 */}
                                    <View style={styles.joinSection}>
                                        <TextInput
                                            style={styles.codeInput}
                                            placeholder="초대코드 입력"
                                            value={authCodeInput}
                                            onChangeText={setAuthCodeInput}
                                        />
                                        <TouchableOpacity
                                            style={styles.joinButton}
                                            onPress={() => {
                                                Alert.alert("참가하기", `입력한 초대코드: ${authCodeInput}`);
                                                // 참가 로직 실행
                                            }}
                                        >
                                            <Text style={styles.joinButtonText}>참가하기</Text>
                                        </TouchableOpacity>
                                    </View>


                                    {/* 닫기 버튼 */}
                                    <TouchableOpacity
                                        style={styles.modalCloseIcon}
                                        onPress={() => {
                                            setTogetherModalVisible(false);
                                            setTogetherModalBackground(require('../assets/images/game_detail/together_start.png'));
                                            setModalType("start");
                                        }}
                                    >
                                        <Image
                                            source={require('../assets/images/game_detail/close.png')}
                                             style={styles.modalCloseIconImage}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {modalType === "together_create" && (
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={styles.modalTitleRandom}>초대 코드 1234</Text>
                                    <Text style={styles.modalSubtitleRandom}>친구를 기다리는 중...</Text>
                                    <TouchableOpacity
                                        style={styles.modalCancelButton}
                                        onPress={() => {
                                            // 매칭 취소 로직 실행 (예시)
                                            handleCancelMatching();
                                            setTogetherModalVisible(false);
                                            setTogetherModalBackground(require('../assets/images/game_detail/together_start.png'));
                                            setModalType("start");
                                        }}
                                    >
                                        <Text style={styles.modalCancelButtonText}>취소</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ImageBackground>
                    </View>
                </Modal>
            </View>
        </ImageBackground >
    );
};

export default GameDetailScreen;