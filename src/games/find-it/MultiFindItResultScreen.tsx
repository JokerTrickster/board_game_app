import React from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import styles from './styles/MultiFindItResultStyles';
import MultiHeader from '../../components/MultiHeader';
import { RootStackParamList } from '../../navigation/navigationTypes';
import findItViewModel from './services/FindItViewModel';
type MultiFindItResultRouteProp = RouteProp<RootStackParamList, 'MultiFindItResult'>;


const MultiFindItResultScreen: React.FC = () => {
    // 성공 여부 변수 (실제 로직에 따라 변경)
    const navigation = useNavigation<any>();
    const route = useRoute<MultiFindItResultRouteProp>();
    const goToHome = () => {
        findItViewModel.resetGameState();
        navigation.navigate('Loading', { nextScreen: 'Home' });
    };
    const { isSuccess } = route.params || { isSuccess: false };
    const userName = '임시개굴맨'; // 임시 사용자 이름

    return (
        // 전체 배경 이미지
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

                    <View style={styles.roundInfo}>
                        <Text style={styles.roundTitle}>최종 라운드</Text>
                        <Text style={styles.roundNumber}>{findItViewModel.round}</Text>
                    </View>

                    {/* 프로필 영역 (1개 정보 표시) */}
                    <View style={styles.profilesRootContainer}>
                    <View style={styles.profilesContainer}>
                        <View style={styles.profileRow}>
                            <View style={styles.profileIconContainer} >
                                <Image
                                    source={require('../../assets/icons/find-it/medal.png')}
                                    style={styles.medalIcon}
                                />
                            </View>

                            <View style={styles.profileImageContainer} >
                                <Image
                                    source={require('../../assets/images/home/default_profile.png')}
                                    style={styles.profileImage}
                                />
                            </View>
                            <Text style={styles.profileName}>{userName}</Text>
                            <View style={styles.profileScoreContainer}>
                                <Image
                                    source={require('../../assets/icons/find-it/coin.png')}
                                    style={styles.profileScoreIcon}
                                />
                                <Text style={styles.profileScore}>{isSuccess ? "+ 1" : "- 1"}</Text>
                            </View>
                        </View>
                        </View>
                        <View style={styles.profilesTwoContainer}>
                            <View style={styles.profileRow}>
                                <View style={styles.profileTwoIconContainer} >
                                    <Image
                                        source={require('../../assets/icons/find-it/medal2.png')}
                                        style={styles.medalTwoIcon}
                                    />
                                </View>

                                <View style={styles.profileImageContainer} >
                                    <Image
                                        source={require('../../assets/images/home/default_profile.png')}
                                        style={styles.profileImage}
                                    />
                                </View>
                                <Text style={styles.profileName}>{userName}</Text>
                                <View style={styles.profileTwoScoreContainer}>
                                    <Image
                                        source={require('../../assets/icons/find-it/coin.png')}
                                        style={styles.profileScoreIcon}
                                    />
                                    <Text style={styles.profileScore}>{isSuccess ? "+ 1" : "- 1"}</Text>
                                </View>
                            </View>
                        </View>
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
