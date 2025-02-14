import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/navigationTypes';
import { useNavigation } from '@react-navigation/native';
import findItViewModel from '../games/find-it/FindItViewModel';

const GameOverScreen: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'GameOver'>>();
   
    const handleGoHome = () => {
        findItViewModel.resetGame(); // ✅ 게임 정보 리셋
        navigation.navigate('Home'); // ✅ 홈으로 이동
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>게임 종료!</Text>
            <Button title="홈으로 돌아가기" onPress={handleGoHome} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});

export default GameOverScreen;
