import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { styles } from './FindItGameOverStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FindItGameOverScreen: React.FC = observer(() => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'FindItGameOver'>>();
    const [gameResult, setGameResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGameResult = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                const roomID = await AsyncStorage.getItem('roomID');

                const response = await fetch('http://10.0.2.2:8080/find-it/v0.1/game/result', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'tkn': token || '',
                    },
                    body: JSON.stringify({ roomID: Number(roomID) }),
                });

                const result = await response.json();
                setGameResult(result);
            } catch (error) {
                console.error('❌ 게임 결과 가져오기 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGameResult();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.gameOverTitle}>게임 종료!</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                gameResult && (
                    <>
                        <Text style={styles.gameOverText}>총 진행한 라운드: {gameResult.round}</Text>
                        {gameResult.users.map((user: any) => (
                            <Text key={user.name} style={styles.gameOverText}>
                                유저 {user.name} 맞춘 개수: {user.totalCorrectCount}
                            </Text>
                        ))}

                        <TouchableOpacity
                            style={styles.mainButton}
                            onPress={() => navigation.navigate('Home')}>
                            <Text style={styles.mainButtonText}>메인 화면으로</Text>
                        </TouchableOpacity>
                    </>
                )
            )}
        </View>
    );
});

export default FindItGameOverScreen;
