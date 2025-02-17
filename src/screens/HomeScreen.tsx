// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/navigationTypes';
import { useNavigation } from '@react-navigation/native';
import { webSocketService } from '../services/WebSocketService'; // ✅ 웹소켓 서비스 추가
import styles from '../styles/HomeStyles'; // ✅ 스타일 적용

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Home'>>();
    const [isMatching, setIsMatching] = useState(false); // ✅ 매칭 상태

    const handleGameStart = () => {
        setIsMatching(true); // ✅ 매칭 시작
        webSocketService.connect(); // ✅ 웹소켓 연결 및 매칭 요청
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>보드게임 앱</Text>

            {isMatching ? (
                <View>
                    <Text style={styles.matchingText}>매칭 중...</Text>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleGameStart}>
                    <Text style={styles.buttonText}>틀린 그림 찾기 시작</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default HomeScreen;
