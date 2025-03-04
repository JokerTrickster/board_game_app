import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import Header from '../components/Header';
import styles from '../styles/GameDetailStyles';
import { useNavigation, useRoute } from '@react-navigation/native';

const GameDetailScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { game } = route.params;

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
                    <Text style={styles.actionText}>
                        매칭하기 또는 함께하기{'\n'}선택해 주세요!
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.matchButton}
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
