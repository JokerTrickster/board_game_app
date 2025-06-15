import React, { useEffect } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import styles from '../styles/SlimeWarResultStyles';
import MultiHeader from '../../../components/MultiHeader';
import { RootStackParamList } from '../../../navigation/navigationTypes';
import SlimeWarGameViewModel from '../services/SlimeWarViewModel';
import { BackHandler } from 'react-native';
type SlimeWarResultRouteProp = RouteProp<RootStackParamList, 'SlimeWarResult'>;


const SlimeWarResultScreen: React.FC = () => {
    // 성공 여부 변수 (실제 로직에 따라 변경)
    const navigation = useNavigation<any>();
    const route = useRoute<SlimeWarResultRouteProp>();
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
        const backAction = () => {
            // 여기서 특별한 동작 없이 그냥 true를 반환하면, 
            // 시스템의 기본 백 버튼 동작(예: 앱 종료, 화면 이동 등)을 차단합니다.
            return true;
        };

        // 백 버튼 이벤트 리스너 추가
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        // 컴포넌트가 언마운트될 때 리스너 제거
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


                    {/* 결과 텍스트 컨테이너 */}
                    <View style={styles.resultScoreContainer}>
                      <Text style={styles.resultScoreTitle}>
                        최종 점수 및 승패
                      </Text>
                      <View style={styles.resultScoreRow}>
                        <Text style={styles.resultScoreName}>{myName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.resultScoreValue}>{myScore}점</Text>
                          <Text style={[
                            styles.resultScoreStatus,
                            myResult === 'Winner' ? styles.winnerText : styles.loserText
                          ]}>
                            {myResult}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.resultScoreRow}>
                        <Text style={styles.resultScoreName}>{opponentName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.resultScoreValue}>{opponentScore}점</Text>
                          <Text style={[
                            styles.resultScoreStatus,
                            opponentResult === 'Winner' ? styles.winnerText : styles.loserText
                          ]}>
                            {opponentResult}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* 두 유저의 점수 및 승패 표시 */}
                    <View style={styles.profilesRootContainer}>
                      <View style={styles.profilesContainer}>
                        {/* 내 정보 */}
                        <View style={styles.profileRow}>
                          <View style={styles.profileIconContainer}>
                            <Image
                              source={require('../../../assets/icons/find-it/medal.png')}
                              style={styles.medalIcon}
                            />
                          </View>
                          <View style={styles.profileImageContainer}>
                            <Image
                              source={require('../../../assets/images/home/default_profile.png')}
                              style={styles.profileImage}
                            />
                          </View>
                          <Text style={styles.profileName}>{myName}</Text>
                          <View style={styles.profileScoreContainer}>
                            <Image
                              source={require('../../../assets/icons/find-it/coin.png')}
                              style={styles.coinIcon}
                            />
                            <Text style={[styles.profileScore, { color: myResult === 'Winner' ? '#2ecc40' : '#e74c3c' }]}>
                              {myScore}점
                            </Text>
                          </View>
                        </View>
                        {/* 상대 정보 */}
                        <View style={styles.profileRow}>
                          <View style={styles.profileTwoIconContainer}>
                            <Image
                              source={require('../../../assets/icons/find-it/medal2.png')}
                              style={styles.medalTwoIcon}
                            />
                          </View>
                          <View style={styles.profileImageContainer}>
                            <Image
                              source={require('../../../assets/images/home/default_profile.png')}
                              style={styles.profileImage}
                            />
                          </View>
                          <Text style={styles.profileName}>{opponentName}</Text>
                          <View style={styles.profileTwoScoreContainer}>
                            <Image
                              source={require('../../../assets/icons/find-it/coin.png')}
                              style={styles.coinIcon}
                            />
                            <Text style={[styles.profileScore, { color: opponentResult === 'Winner' ? '#2ecc40' : '#e74c3c' }]}>
                              {opponentScore}점
                            </Text>
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

export default SlimeWarResultScreen;
