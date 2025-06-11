import React, { useEffect } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import styles from './styles/MultiFindItResultStyles';
import MultiHeader from '../../components/MultiHeader';
import { RootStackParamList } from '../../navigation/navigationTypes';
import findItViewModel from './services/FindItViewModel';
import { BackHandler } from 'react-native';

type MultiFindItResultRouteProp = RouteProp<RootStackParamList, 'MultiFindItResult'>;

interface GameResult {
    round: number;
    users: {
        name: string;
        totalCorrectCount: number;
    }[];
}

const MultiFindItResultScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<MultiFindItResultRouteProp>();
    const { isSuccess, gameResult } = route.params || { isSuccess: false, gameResult: null };

    const goToHome = () => {
        findItViewModel.resetGameState();
        navigation.navigate('Loading', { nextScreen: 'Home' });
    };

    // 백 버튼 처리
    useEffect(() => {
        const backAction = () => true;
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    // 승자 결정
    const getWinner = () => {
        if (!gameResult?.users) return null;
        return gameResult.users.reduce((prev: GameResult['users'][0], current: GameResult['users'][0]) => 
            (prev.totalCorrectCount > current.totalCorrectCount) ? prev : current
        );
    };

    const winner = getWinner();

    return (
        <ImageBackground
            source={require('../../assets/images/common/background_basic.png')}
            style={styles.background}
            imageStyle={styles.backgroundImage}
        >
            <View style={styles.container}>
                <MultiHeader />

                <View style={styles.resultContainer}>
                    <View style={styles.clearConatiner}>
                        <Image
                            source={isSuccess ?
                                require('../../assets/icons/find-it/clear_star.png') :
                                require('../../assets/icons/find-it/fail_star.png')
                            }
                            style={styles.clearIcon}
                        />
                        <View style={styles.clearTextContainer}>
                            <Text style={styles.clearText}>
                                {isSuccess ? "클리어!" : "게임오버"}
                            </Text>
                        </View>
                    </View>

                    {/* 결과 점수 표시 */}
                    <View style={styles.resultScoreContainer}>
                        <Text style={styles.resultScoreTitle}>최종 점수</Text>
                        {gameResult?.users.map((user: GameResult['users'][0], index: number) => (
                            <View key={index} style={styles.resultScoreRow}>
                                <Text style={styles.resultScoreName}>{user.name}</Text>
                                <View style={styles.resultScoreValueContainer}>
                                    <Text style={styles.resultScoreValue}>
                                        {user.totalCorrectCount}개
                                    </Text>
                                    {winner?.name === user.name && (
                                        <Text style={styles.winnerText}>Winner!</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* 프로필 영역 */}
                    <View style={styles.profilesRootContainer}>
                        {gameResult?.users.map((user: GameResult['users'][0], index: number) => (
                            <View 
                                key={index} 
                                style={[
                                    styles.profilesContainer,
                                    index === 1 && styles.profilesTwoContainer
                                ]}
                            >
                                <View style={styles.profileRow}>
                                    <View style={[
                                        styles.profileIconContainer,
                                        index === 1 && styles.profileTwoIconContainer
                                    ]}>
                                        <Image
                                            source={require('../../assets/icons/find-it/medal.png')}
                                            style={[
                                                styles.medalIcon,
                                                index === 1 && styles.medalTwoIcon
                                            ]}
                                        />
                                    </View>
                                    <View style={styles.profileImageContainer}>
                                        <Image
                                            source={require('../../assets/images/home/default_profile.png')}
                                            style={styles.profileImage}
                                        />
                                    </View>
                                    <Text style={styles.profileName}>{user.name}</Text>
                                    <View style={[
                                        styles.profileScoreContainer,
                                        index === 1 && styles.profileTwoScoreContainer
                                    ]}>
                                        <Image
                                            source={require('../../assets/icons/find-it/coin.png')}
                                            style={styles.profileScoreIcon}
                                        />
                                        <Text style={styles.profileScore}>
                                            {user.totalCorrectCount}개
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.ResultButtonContainer}>
                    <TouchableOpacity
                        style={styles.resultButton}
                        onPress={goToHome}
                    >
                        <Text style={styles.resultButtonText}>홈으로</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};

export default MultiFindItResultScreen;
