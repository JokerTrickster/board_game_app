import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, ScrollView, Alert,ImageBackground,AppState} from 'react-native';
import Header from '../components/Header';
import GameCard from '../components/GameCard';
import styles from '../styles/ReactHomeStyles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LoginService } from '../services/LoginService';
import { gameService } from '../services/GameService';
import { AuthService } from '../services/AuthService';
import { CommonAudioManager } from '../services/CommonAudioManager'; // Global Audio Manager import

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [userData, setUserData] = useState<{ success: boolean; user: any; profileImage: string | null } | null>(null);
    const [gameList, setGameList] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
  
    // ✅ 유저 데이터를 서버에서 받아와 저장한 후, 최신 데이터를 state에 반영합니다.
    const fetchAndSetUserData = async () => {
        const userID = await AuthService.getUserID();
        if (userID === null) {
            Alert.alert('오류', '로그인 정보가 없습니다.');
            return;
        }
        setRefreshing(true);
        const response = await LoginService.fetchUserData(userID);
        if (response.success) {
            // gameService에 최신 유저 정보 저장
            await gameService.setUserInfo(response);
            // 저장된 최신 유저 정보를 다시 불러와 state 업데이트
            const storedUser = await gameService.getUserInfo();
            if (storedUser) {
                setUserData(storedUser);
            }
        }
        setRefreshing(false);
    };

    // ✅ 게임 목록 불러오기
    const loadGameList = async () => {
        const games = await gameService.fetchGameList();
        setGameList(games);
    };

    useFocusEffect(
        useCallback(() => {
            fetchAndSetUserData();
            loadGameList();
        }, [])
    );
    useEffect(() => {
        // 초기 배경음악 설정
        CommonAudioManager.initBackgroundMusic();
        CommonAudioManager.playBackgroundMusic();

        // 앱 상태 변경 감지
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                // 앱이 백그라운드 또는 비활성화 상태일 때 배경음악 정지
                CommonAudioManager.initBackgroundMusic();
            } else if (nextAppState === 'active') {
                // 앱이 포그라운드로 돌아올 때 배경음악 재생
                CommonAudioManager.playBackgroundMusic();
            }
        });

        // 컴포넌트 언마운트 시 정리
        return () => {
            CommonAudioManager.stopBackgroundMusic();
            subscription.remove();
        };
    }, []);

    // ✅ 게임 선택 시 실행 여부 확인
    const handleGamePress = (game: any) => {
        if (!game.isEnabled) {
            Alert.alert('게임 준비 중', '해당 게임은 아직 준비 중입니다.!');
            return; // 🚨 게임이 비활성화되어 있으면 이동하지 않음
        }
        navigation.navigate('GameDetail', { game });
    };

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

    return (
        <ImageBackground
            source={require('../assets/images/common/background_basic.png')}
            style={styles.background}
        >
        <Header userData={userData} />

        <View style={styles.container}>

            <ScrollView contentContainerStyle={styles.gameContainer}>
                {gameList.map((game, index) => (
                    <GameCard
                        key={index}
                        title={game.title}
                        hashtag={game.hashTag}
                        category={game.category}
                        image={game.image}
                        onPress={() => handleGamePress(game)}
                    />
                ))}
            </ScrollView>
        </View>
        </ImageBackground>
    );
};

export default HomeScreen;
