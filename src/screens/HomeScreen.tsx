import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import Header from '../components/Header';
import GameCard from '../components/GameCard';
import styles from '../styles/HomeStyles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LoginService } from '../services/LoginService';
import { gameService } from '../services/GameService';
import { AuthService } from '../services/AuthService';

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [userData, setUserData] = useState<{ success: boolean; user: any; profileImage: string | null } | null>(null);
    const [gameList, setGameList] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // ✅ 유저 데이터를 불러오는 함수
    const fetchUserData = async () => {
        const userID = await AuthService.getUserID();
        if (userID === null) {
            Alert.alert('오류', '로그인 정보가 없습니다.');
            return;
        }

        setRefreshing(true);
        const response = await LoginService.fetchUserData(userID);
        if (response.success) {
            await gameService.setUserInfo(response); // ✅ 유저 정보 저장
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
            fetchUserData();
            loadGameList();
        }, [])
    );

    // ✅ 게임 선택 시 실행 여부 확인
    const handleGamePress = (game: any) => {
        if (!game.isEnabled) {
            Alert.alert('게임 준비 중', '해당 게임은 아직 준비 중입니다.');
            return; // 🚨 게임이 비활성화되어 있으면 이동하지 않음
        }
        navigation.navigate('GameDetail', { game });
    };


    return (
        <View style={styles.container}>
            <Header userData={userData} />

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
    );
};

export default HomeScreen;
