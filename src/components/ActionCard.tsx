import React from 'react';
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import styles from '../styles/ReactActionCardStyles';


interface PodiumItem {
    rank: number;           // 1, 2, 3
    profileImage: any;      // 예: require('../assets/images/user1.png') 또는 { uri: 'https://example.com/user1.png' }
    nickname: string;
    title: string;
    score: number;
}

interface ActionCardProps {
    podiumData: PodiumItem[]; // 배열 순서는 [2등, 1등, 3등]로 전달 (왼쪽, 중앙, 오른쪽)
}

const ActionCard: React.FC<ActionCardProps> = ({ podiumData }) => {
    // 순위에 따른 이미지 소스 결정 함수
    const getRankImageSource = (rank: number) => {
        switch (rank) {
            case 1:
                return require('../assets/images/game_detail/gold.png'); // 1등 이미지
            case 2:
                return require('../assets/images/game_detail/silver.png'); // 2등 이미지
            case 3:
                return require('../assets/images/game_detail/bronze.png'); // 3등 이미지
            default:
                return null;
        }
    };
    return (
        <ImageBackground
            source={require('../assets/images/game_detail/background.png')} // 배경 이미지 경로 수정
            style={styles.actionCardBackground}
        >
            <View style={styles.podiumContainer}>
                {podiumData.map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.podiumItem,
                            item.rank === 1 && styles.firstPlace, // 1등에 특별한 스타일 적용 (예: 더 크게)
                        ]}
                    >
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={item.profileImage}
                                style={styles.profileImage}
                            />
                            <Image
                                source={getRankImageSource(item.rank)}
                                style={styles.rankBadge}
                            />
                        </View>
                        <Text style={[styles.nickname,
                            item.rank === 1 && styles.firstNickname]}>{item.nickname}</Text>

                    </View>
                ))}
            </View>
        </ImageBackground>
    );
};
export default ActionCard;