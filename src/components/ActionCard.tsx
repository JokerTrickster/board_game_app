import React from 'react';
import { View, Text, Image, ImageBackground } from 'react-native';
import styles from './styles/ActionCardStyles';

interface PodiumItem {
    rank: number;           // 1, 2, 3
    profileImage: any;      // 예: require(...) 또는 { uri: 'https://...' }
    nickname: string;
    title: string;
    score: number;
}

interface ActionCardProps {
    // 배열 순서는 [2등, 1등, 3등] 으로 들어올 수도 있지만
    // rank를 찾아서 1등/2등/3등을 구분해서 사용
    podiumData: PodiumItem[];
}

const ActionCard: React.FC<ActionCardProps> = ({ podiumData }) => {
    // rank 값으로 1,2,3을 찾아서 변수에 할당
    const first = podiumData.find(item => item.rank === 1);
    const second = podiumData.find(item => item.rank === 2);
    const third = podiumData.find(item => item.rank === 3);

    return (
        <View style={styles.cardOuterContainer}>
            {/* 전체 랭킹 배경 (이미 하나의 이미지로 통합) */}
            <ImageBackground
                source={require('../assets/images/game_detail/ranking_background.png')}
                style={styles.actionCardBackground}
                imageStyle={styles.actionCardBackgroundImage}
            >
                {/* 상단 Ranking 텍스트 */}
                <Text style={styles.rankingText}>Ranking</Text>

                {/* 1등: Gold 영역 */}
                {first && (
                    <View style={styles.goldContainer}>
                        <Image
                            source={first.profileImage}
                            style={styles.goldProfileImage}
                        />
                        <Text style={styles.goldNickname}>{first.nickname}</Text>
                        <Text style={styles.goldScore}>{first.score}</Text>
                    </View>
                )}

                {/* 2등: Silver 영역 */}
                {second && (
                    <View style={styles.silverContainer}>
                        <Image
                            source={second.profileImage}
                            style={styles.silverProfileImage}
                        />
                        <Text style={styles.silverNickname}>{second.nickname}</Text>
                        <Text style={styles.silverScore}>{second.score}</Text>
                    </View>
                )}

                {/* 3등: Bronze 영역 */}
                {third && (
                    <View style={styles.bronzeContainer}>
                        <Image
                            source={third.profileImage}
                            style={styles.bronzeProfileImage}
                        />
                        <Text style={styles.bronzeNickname}>{third.nickname}</Text>
                        <Text style={styles.bronzeScore}>{third.score}</Text>
                    </View>
                )}
                </ImageBackground>
        </View>
    );
};

export default ActionCard;
