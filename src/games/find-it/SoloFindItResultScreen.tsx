import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity,Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import soloFindItViewModel from './services/SoloFindItViewModel';
import styles from './styles/SoloFindItResultStyles'; // 스타일 임포트
import SoloHeader from '../../components/SoloHeader'; // 헤더 컴포넌트 임포트
import { RootStackParamList } from '../../navigation/navigationTypes';
import { BackHandler } from 'react-native';

const SoloFindItResultScreen: React.FC = observer(() => {
    const navigation = useNavigation(); // navigation 타입을 명확히 지정
    const route = useRoute<RouteProp<RootStackParamList, 'SoloFindItResult'>>(); // 타입을 명확히 지정
    const userName = '임시개굴맨';
    const { isSuccess } = route.params as { isSuccess?: boolean };  // 타입을 명확히 지정하고 기본값 false는 제거

    const goToHome = () => {
        navigation.navigate('Home' as never); // 타입 오류를 피하기 위해 'Home'을 never로 캐스팅
    };
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
        <ImageBackground
            source={require('../../assets/images/common/background_basic.png')}
            style={styles.background}
            imageStyle={styles.backgroundImage}
        >
            <View style={styles.container}>

                <SoloHeader />

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
                                {isSuccess ? '클리어!' : '게임오버'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.roundInfo}>
                        <Text style={styles.roundTitle}>최종 라운드</Text>
                        <Text style={styles.roundNumber}>{soloFindItViewModel.round}</Text>
                    </View>

                    {/* 프로필 영역 (1개 정보 표시) */}
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
                                    source={ require('../../assets/images/home/default_profile.png')}
                                    style={styles.profileImage}
                                />
                            </View>
                            <Text style={styles.profileName}>{userName}</Text>
                            <View style={styles.profileScoreContainer}>
                                <Image
                                    source={require('../../assets/icons/find-it/coin.png')}
                                    style={styles.profileScoreIcon}
                                />
                                <Text style={styles.profileScore}>{isSuccess ? '+300' : '-100'}</Text>
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
});

export default SoloFindItResultScreen;
