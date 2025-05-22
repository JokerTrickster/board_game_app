import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Linking, Share, TextInput, ImageBackground, Modal } from 'react-native';
import Header from '../components/Header';
import styles from '../styles/ReactGameDetailStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { findItWebSocketService } from '../services/FindItWebSocketService';
import { slimeWarWebSocketService } from '../games/slime-war/services/SlimeWarWebsocketService';
import { frogWebSocketService } from '../games/frog/services/FrogWebsocketService';
import { WebView } from 'react-native-webview';
import { gameService } from '../services/GameService';
import ActionCard from '../components/ActionCard';
import { findItService } from '../services/FindItService';
import { slimeWarService } from '../games/slime-war/services/SlimeWarService';
import soloGameViewModel from '../games/find-it/services/SoloFindItViewModel';
import Button from '../components/Button';
import eventEmitter from '../services/EventEmitter';
import { sequenceWebSocketService } from '../games/sequence/services/SequenceWebsocketService';

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
    const [password, setPassword] = useState('');
    const [isWaitingModalVisible, setWaitingModalVisible] = useState(false);
    const [togetherModalBackground, setTogetherModalBackground] = useState(
        require('../assets/images/game_detail/together_start.png')
    );
    // 추가: 모달 텍스트 state 선언 (컴포넌트 상단에 추가)
    const [modalContentText, setModalContentText] = useState("게임 매칭 방식을 선택해주세요.");
    // 추가: 모달 타입 state (기본: "start")
    const [modalType, setModalType] = useState("start");


    // podiumData state를 선언 (초기값은 빈 배열)
    const [podiumData, setPodiumData] = useState<any[]>([]);

    
  
    // 게임 제목이 '틀린그림찾기'일 때만 랭킹 API를 호출하여 podiumData 갱신
    useEffect(() => {
        if (game.title === '틀린그림찾기') {
          (async () => {
            try {
              const ranking = await findItService.fetchRankings();
              const transformedData = ranking.map((item: any) => ({
                rank: item.rank,
                nickname: item.name,
                score: item.score,
                profileImage: require('../assets/images/home/default_profile.png'),
              }));
              setPodiumData(transformedData);
            } catch (error) {
              console.error("Failed to fetch ranking data", error);
            }
          })();
        }else if(game.title === '슬라임전쟁'){
            (async () => {
                try {
                    const ranking = await slimeWarService.fetchRankings();
                    const transformedData = ranking.map((item: any) => ({
                        rank: item.rank,
                        nickname: item.name,
                        score: item.score,
                        profileImage: require('../assets/images/home/default_profile.png'),
                    }));
                    setPodiumData(transformedData);
                } catch (error) {
                    console.error("Failed to fetch ranking data", error);
                }
            })();
        }else {
          setPodiumData([]);
        }
      }, [game.title]);


    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = await gameService.getUserInfo();
            if (storedUser) {
                setUserData(storedUser);
            }
        };
        setTogetherModalVisible(false);
        setModalType("start");
        fetchUserData();
    }, []);
    // ✅ GameDetailScreen에서 Header 설정 (navigation.setOptions 사용)
    useEffect(() => {
        navigation.setOptions({
            header: () => <Header userData={userData} />,
        });
    }, [userData]);

    // 게임 비밀번호 변경이되면 모달 타입 변경
    useEffect(() => {
        // Listen for password change events
        const handlePasswordChange = (newPassword: string) => {
            console.log("Password change event received:", newPassword);
            setPassword(newPassword);
            setModalType("together_create");
        };
        
        // Subscribe to the event
        eventEmitter.on('passwordChanged', handlePasswordChange);
        console.log("Event listener registered for passwordChanged");
        
        // Clean up the event listener when component unmounts
        return () => {
            eventEmitter.off('passwordChanged', handlePasswordChange);
            console.log("Event listener cleaned up");
        };
    }, []);

    const handleMatching = () => {
        switch (game.title) {
            case '틀린그림찾기':
                findItWebSocketService.connect();
                break;
            case '슬라임전쟁':
                slimeWarWebSocketService.connect();
                break;
            case '시퀀스':
                sequenceWebSocketService.connect();
                break;
            case '개굴작':
                frogWebSocketService.connect();
                break;
            default:
                Alert.alert('오류', '게임 매칭을 시작할 수 없습니다.');
                return;
        }
        setIsMatching(true);
        setMatchMessage("매칭 중입니다...");
    };
    const handleTogetherMatching = async () => {
        switch (game.title) {
            case '틀린그림찾기':
                await findItWebSocketService.togetherConnect();
                break;
            case '슬라임전쟁':
                await slimeWarWebSocketService.togetherConnect();
                break;
            case '시퀀스':
                await sequenceWebSocketService.togetherConnect();
                break;
            case '개굴작':
                await frogWebSocketService.togetherConnect();
                break;
            default:
                Alert.alert('오류', '게임 매칭을 시작할 수 없습니다.');
                return;
        }
        setIsMatching(true);
        setMatchMessage("매칭 중입니다...");
    };
    const handleJoinMatching = async (authCode: string) => {
        try {
            const isValid = await findItService.verifyPassword(authCodeInput);
            
            if (!isValid) {
                Alert.alert('오류', '인증코드가 잘못되었습니다.');
                return;
            }
            
            switch (game.title) {
                case '틀린그림찾기':
                    findItWebSocketService.joinConnect(authCode);
                    break;
                case '슬라임전쟁':
                    slimeWarWebSocketService.joinConnect(authCode);
                    break;
                case '시퀀스':
                    sequenceWebSocketService.joinConnect(authCode);
                    break;
                case '개굴작':
                    frogWebSocketService.joinConnect(authCode);
                    break;
                default:
                    Alert.alert('오류', '게임 매칭을 시작할 수 없습니다.');
                    return;
            }
            
            setTogetherModalBackground(require('../assets/images/game_detail/random_match.png'));
            setModalType("random");
            
        } catch (error) {
            console.error('게임 참가 중 오류 발생:', error);
            Alert.alert('오류', '게임 참가 중 문제가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleSoloPlay = async () => {
        try {
            const deductResult = await findItService.deductCoin(-100);
            console.log("코인 차감 결과:", deductResult);

            soloGameViewModel.resetGameState();
            const gameInfoList = await findItService.fetchSoloPlayGameInfo(10);
            (navigation as any).navigate("Loading", { nextScreen: 'SoloFindIt', params: { gameInfoList } });

        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };
   
    const handleCancelMatching = () => {
        // ✅ 매칭 취소 이벤트 전송
        findItWebSocketService.sendMatchCancelEvent();

        // ✅ UI 상태 업데이트
        setIsMatching(false);
        setModalType("start");
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
                    ) : game.title === '슬라임전쟁' ? (
                        <Image
                            source={require('../assets/images/game_detail/slime_war_title.png')}
                            style={styles.gameTitleImage}
                        />
                    ) : game.title === '시퀀스' ? (
                        <Image
                            source={require('../assets/images/game_detail/sequence_title.png')}
                            style={styles.gameTitleImage}
                        />
                    ) : game.title === '개굴작' ? (
                        <Image
                            source={require('../assets/images/game_detail/sequence_title.png')}
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
                                        : game.title === '슬라임전쟁'
                                            ? require('../assets/images/common/slime-war.png')
                                        : game.title === '시퀀스'
                                            ? require('../assets/images/common/sequence.png')
                                            : game.title === '개굴작'
                                                ? require('../assets/images/common/sequence.png')
                                                : require('../assets/images/common/default.png')
                                }
                                style={styles.gameImage}
                            />
                            <View style={styles.rightColumn}>
                                <TouchableOpacity style={styles.infoCard} onPress={() => setDescriptionModalVisible(true)}>
                                    <Image
                                        source={require('../assets/images/game_detail/tutorial_image.png')}
                                        style={styles.infoTutorialImage}
                                    />
                                    <Text style={[styles.buttonText, { position: 'absolute', bottom: 5, right: 15 }]}>게임방법</Text>
                                </TouchableOpacity>
                                {game.youtubeUrl && (
                                    <TouchableOpacity style={styles.infoCard} onPress={() => setYoutubeModalVisible(true)}>
                                        <Image
                                            source={require('../assets/images/game_detail/tutorial_youtube.png')}
                                            style={styles.infoYoutubeImage}
                                        />
                                        <Text style={[styles.buttonText, { position: 'absolute', bottom: 15, right: 15 }]}>게임영상</Text>
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
                    <Button
                        onPress={handleSoloPlay}
                        disabled={game.title === '슬라임전쟁'} // 슬라임전쟁이면 비활성화
                        text="혼자하기"
                        containerStyle={styles.aloneButton}
                        textStyle={styles.soloButtonText}
                    />
                    {/* 함께하기 버튼 (이미지 + 텍스트) */}
                    <Button
                        onPress={() => setTogetherModalVisible(true)}
                        disabled={false} // 항상 활성화
                        text="함께하기"
                        containerStyle={styles.togetherButton}
                        textStyle={styles.togetherButtonText}
                    />
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
                            {/* 오른쪽 상단 닫기 아이콘 */}
                            <TouchableOpacity
                                style={styles.modalCloseIcon}
                                onPress={() => setDescriptionModalVisible(false)}
                            >
                                <Image
                                    source={require('../assets/images/game_detail/close.png')}
                                    style={styles.modalCloseIconImage}
                                />
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
                                source={{ uri: 'https://www.youtube.com/embed/xvqMWEfSgbY?si=H7qpoTWl4X5gKMUJ' }}
                            />
                            {/* 오른쪽 상단 닫기 아이콘 */}
                            <TouchableOpacity
                                style={styles.modalCloseIcon}
                                onPress={() => setYoutubeModalVisible(false)}
                            >
                                <Image
                                    source={require('../assets/images/game_detail/close.png')}
                                    style={styles.modalCloseIconImage}
                                />
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
                                <>
                                    <Text style={styles.modalTitleStart}>게임 매칭 방식을 선택해주세요.</Text>
                                    <TouchableOpacity
                                        style={styles.modalButton}
                                        onPress={() => {
                                            setTogetherModalBackground(require('../assets/images/game_detail/random_match.png'));
                                            setModalType("random");
                                            handleMatching();
                                        }}
                                    >
                                        <Text style={styles.modalRandomButtonText}>랜덤으로 매칭</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalButton}
                                        onPress={() => {
                                            setTogetherModalBackground(require('../assets/images/game_detail/together_join.png'));
                                            setModalType("together");
                                        }}
                                    >
                                        <Text style={styles.modalTogetherButtonText}>친구와 함께</Text>
                                    </TouchableOpacity>
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
                            {modalType === "together" && (
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <TouchableOpacity
                                        style={styles.createRoomButton}
                                        onPress={async () => {
                                            setTogetherModalBackground(require('../assets/images/game_detail/random_match.png'));
                                            handleTogetherMatching();
                                            const receivedPassword = await gameService.getPassword();
                                            setPassword(receivedPassword || '');
                                        }}
                                    >
                                        <Text style={styles.createRoomButtonText}>방만들기 100</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.joinPromptText}>코드를 전달 받아 입력하세요.</Text>
                                    <View style={styles.joinSection}>
                                        <TextInput
                                            style={styles.codeInput}
                                            placeholder="초대코드 입력"
                                            value={authCodeInput}
                                            onChangeText={setAuthCodeInput}
                                        />
                                        <TouchableOpacity
                                            style={styles.joinButton}
                                            onPress={async () => {
                                                handleJoinMatching(authCodeInput); // Pass authCodeInput as a parameter
                                            }}
                                        >
                                            <Text style={styles.joinButtonText}>참가하기</Text>
                                        </TouchableOpacity>
                                    </View>
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
                                    <Text style={styles.modalTitleRandom}>초대 코드: {password}</Text>
                                    <Text style={styles.modalSubtitleRandom}>친구를 기다리는 중...</Text>
                                    <TouchableOpacity
                                        style={styles.modalCancelButton}
                                        onPress={() => {
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