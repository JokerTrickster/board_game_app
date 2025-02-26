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

    // ✅ 홈 화면이 포커스를 받을 때마다 유저 데이터를 다시 가져옴
    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [])
    );

    const handleGamePress = (game: string) => {
        if (game === '틀린그림찾기') {
            navigation.navigate('GameDetail', { game});
        } else {
            Alert.alert('준비 중입니다.', `${game} 게임은 준비 중입니다.`);
        }
    };

    return (
        <View style={styles.container}>
            <Header userData={userData} />

            <ScrollView contentContainerStyle={styles.gameContainer}>
                <GameCard
                    title="틀린그림찾기"
                    hashtags={['퍼즐', '관찰력']}
                    onPress={() => handleGamePress('틀린그림찾기')}
                />
                <GameCard
                    title="장미의전쟁"
                    hashtags={['퍼즐', '관찰력']}
                    onPress={() => handleGamePress('장미의전쟁')}
                />
                <GameCard
                    title="카르카손"
                    hashtags={['퍼즐', '관찰력']}
                    onPress={() => handleGamePress('카르카손')}
                />
                <GameCard
                    title="카후나"
                    hashtags={['퍼즐', '관찰력']}
                    onPress={() => handleGamePress('카후나')}
                />
            </ScrollView>
        </View>
    );
};

export default HomeScreen;
