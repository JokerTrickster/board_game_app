import React, { useEffect } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import styles from '../styles/FrogResultStyles';
import MultiHeader from '../../../components/MultiHeader';
import { RootStackParamList } from '../../../navigation/navigationTypes';
import { BackHandler } from 'react-native';
type FrogResultRouteProp = RouteProp<RootStackParamList, 'FrogResult'>;


const FrogResultScreen: React.FC = () => {
    // 성공 여부 변수 (실제 로직에 따라 변경)
    const navigation = useNavigation<any>();
    const route = useRoute<FrogResultRouteProp>();
    const goToHome = () => {
        navigation.navigate('Home');
    };
    const { isSuccess } = route.params || { isSuccess: false };

    const userName = '임시개굴맨'; // 임시 사용자 이름
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
                                {isSuccess ? '클리어!' : '게임오버'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.roundInfo}>
                        <Text style={styles.roundTitle}>최종 라운드</Text>
                    </View>

                    {/* 프로필 영역 (1개 정보 표시) */}
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
                            <Text style={styles.profileName}>{userName}</Text>
                            <View style={styles.profileScoreContainer}>
                                <Image
                                    source={require('../../../assets/icons/find-it/coin.png')}
                                    style={styles.profileScoreIcon}
                                />
                                <Text style={styles.profileScore}>{isSuccess ? '+500' : '-100'}</Text>
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
                                <Text style={styles.profileName}>{userName}</Text>
                                <View style={styles.profileTwoScoreContainer}>
                                    <Image
                                        source={require('../../../assets/icons/find-it/coin.png')}
                                        style={styles.profileScoreIcon}
                                    />
                                    <Text style={styles.profileScore}>{isSuccess ? '+500' : '-100'}</Text>
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

export default FrogResultScreen;
