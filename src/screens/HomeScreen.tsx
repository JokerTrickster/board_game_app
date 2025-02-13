import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/navigationTypes'; // ✅ 타입 import

type MainScreenProps = {
    navigation: StackNavigationProp<RootStackParamList, 'Main'>;
};

const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>틀린 그림 찾기</Text>
            <Button title="게임 시작" onPress={() => navigation.navigate('Game')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});

export default MainScreen;
