import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import Header from '../components/Header';
import styles from '../styles/ReactGameDetailStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import ActionCard from './ActionCard';

const GameDetailScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { game } = route.params;
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


    return (
        
        <View style={styles.container}>
            <Header />

            <Text style={styles.gameTitle}>{game}</Text>

            <ScrollView contentContainerStyle={styles.detailContainer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryText}>게임 썸네일</Text>
                </View>

                <View style={styles.infoContainer}>
                    <TouchableOpacity style={styles.infoCard}>
                        <Text style={styles.infoText}>게임설명</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.infoCard}>
                        <Text style={styles.infoText}>튜토리얼 영상 (유튜브)</Text>
                    </TouchableOpacity>
                </View>


                <View style={styles.actionCard}>
                    <ActionCard podiumData={podiumData} />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.aloneButton}
                        onPress={() => Alert.alert('함께하기', '준비 중입니다.')}>
                        <Text style={styles.buttonText}>매칭하기</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.togetherButton}
                        onPress={() => Alert.alert('함께하기', '준비 중입니다.')}>
                        <Text style={styles.buttonText}>함께하기</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default GameDetailScreen;
