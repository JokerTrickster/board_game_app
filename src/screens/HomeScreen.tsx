import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import Header from '../components/Header';
import GameCard from '../components/GameCard';
import styles from '../styles/HomeStyles';
import { useNavigation } from '@react-navigation/native';

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    const handleGamePress = (game: string) => {
        if (game === '틀린그림찾기') {
            navigation.navigate('GameDetail', { game });
        } else {
            Alert.alert('준비 중입니다.', `${game} 게임은 준비 중입니다.`);
        }
    };

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView contentContainerStyle={styles.gameContainer}>
                <GameCard
                    title="틀린그림찾기"
                    hashtags={['퍼즐', '관찰력']}
                    image={require('../assets/images/find_differences.png')}
                    onPress={() => handleGamePress('틀린그림찾기')}
                />
                <GameCard
                    title="장미의전쟁"
                    hashtags={['퍼즐', '관찰력']}
                    image={require('../assets/images/war_of_roses.png')}
                    onPress={() => handleGamePress('장미의전쟁')}
                />
                <GameCard
                    title="카르카손"
                    hashtags={['퍼즐', '관찰력']}
                    image={require('../assets/images/carcassonne.png')}
                    onPress={() => handleGamePress('카르카손')}
                />
                <GameCard
                    title="카후나"
                    hashtags={['퍼즐', '관찰력']}
                    image={require('../assets/images/kahuna.png')}
                    onPress={() => handleGamePress('카후나')}
                />
            </ScrollView>
        </View>
    );
};

export default HomeScreen;
