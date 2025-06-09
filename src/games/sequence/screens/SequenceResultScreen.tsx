import React, { useEffect } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import styles from '../styles/SequenceResultStyles';
import MultiHeader from '../../../components/MultiHeader';
import { RootStackParamList } from '../../../navigation/navigationTypes';
import { BackHandler } from 'react-native';
type SequenceResultRouteProp = RouteProp<RootStackParamList, 'SequenceResult'>;


const SequenceResultScreen: React.FC = () => {
    // 성공 여부 변수 (실제 로직에 따라 변경)
    const navigation = useNavigation<any>();
    const route = useRoute<SequenceResultRouteProp>();
    const goToHome = () => {
        navigation.navigate('Loading', { nextScreen: 'Home' });
    };
    const { isSuccess, myScore, opponentScore } = route.params || { isSuccess: false, myScore: 0, opponentScore: 0 };

    // 임시 유저명, 실제 유저명으로 교체 가능
    const myName = '나';
    const opponentName = '상대';

    // 승패 텍스트
    const myResult = myScore > opponentScore ? 'Winner' : 'Loser';
    const opponentResult = myScore < opponentScore ? 'Winner' : 'Loser';

    useEffect(() => {
        const backAction = () => true;
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );
        return () => backHandler.remove();
    }, []);
    return (
        // 전체 배경 이미지
        <ImageBackground
            source={require('../../../assets/images/common/background_basic.png')}
            style={styles.background}
            imageStyle={styles.backgroundImage}
        >
            <View style={styles.container}>
                <MultiHeader />

                <View style={styles.resultContainer}>
                    <View style={styles.clearConatiner}>
                        <Image
                            source={isSuccess ?
                                require('../../../assets/icons/find-it/clear_star.png') :
                                require('../../../assets/icons/find-it/fail_star.png')
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
                        <Text style={styles.roundTitle}>결 과</Text>
                    </View>

                    {/* 기존 프로필 영역 등 기존 UI 유지 */}
                    <View style={styles.profilesRootContainer}>
                      <View style={styles.profilesContainer}>
                        <View style={styles.profileRow}>
                            <View style={styles.profileIconContainer} >
                                <Image
                                    source={require('../../../assets/icons/find-it/medal.png')}
                                    style={styles.medalIcon}
                                />
                            </View>
                            <View style={styles.profileImageContainer} >
                                <Image
                                    source={require('../../../assets/images/home/default_profile.png')}
                                    style={styles.profileImage}
                                />
                            </View>
                            <Text style={styles.profileName}>{myName}</Text>
                            <View style={styles.profileScoreContainer}>
                                <Image
                                    source={require('../../../assets/icons/find-it/coin.png')}
                                    style={styles.profileScoreIcon}
                                />
                                <Text style={styles.profileScore}>{isSuccess ? "+500" : "-100"}</Text>
                            </View>
                        </View>
                      </View>
                      <View style={styles.profilesTwoContainer}>
                        <View style={styles.profileRow}>
                            <View style={styles.profileTwoIconContainer} >
                                <Image
                                    source={require('../../../assets/icons/find-it/medal2.png')}
                                    style={styles.medalTwoIcon}
                                />
                            </View>
                            <View style={styles.profileImageContainer} >
                                <Image
                                    source={require('../../../assets/images/home/default_profile.png')}
                                    style={styles.profileImage}
                                />
                            </View>
                            <Text style={styles.profileName}>{opponentName}</Text>
                            <View style={styles.profileTwoScoreContainer}>
                                <Image
                                    source={require('../../../assets/icons/find-it/coin.png')}
                                    style={styles.profileScoreIcon}
                                />
                                <Text style={styles.profileScore}>{isSuccess ? "+500" : "-100"}</Text>
                            </View>
                        </View>
                      </View>
                    </View>

                    {/* 결과 바로 밑에 추가되는 영역 */}
                    <View style={{ marginTop: 24, padding: 12, backgroundColor: '#fff2', borderRadius: 12 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#333' }}>
                        최종 점수 및 승패
                      </Text>
                      <Text style={{ fontSize: 15, marginBottom: 2 }}>
                        {myName} : {myScore} / <Text style={{ fontWeight: 'bold', color: myResult === 'Winner' ? '#2ecc40' : '#e74c3c' }}>{myResult}</Text>
                      </Text>
                      <Text style={{ fontSize: 15 }}>
                        {opponentName} : {opponentScore} / <Text style={{ fontWeight: 'bold', color: opponentResult === 'Winner' ? '#2ecc40' : '#e74c3c' }}>{opponentResult}</Text>
                      </Text>
                    </View>
                </View>
                <View style={styles.ResultButtonContainer}>
                    <TouchableOpacity
                        style={styles.resultButton}
                        onPress={goToHome}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.resultButtonText}>홈으로</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};

export default SequenceResultScreen;
