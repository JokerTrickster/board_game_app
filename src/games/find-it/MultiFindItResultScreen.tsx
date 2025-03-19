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

    return (
        // 전체 배경 이미지
        <ImageBackground
            source={require('../../assets/images/common/background_basic.png')}
            style={styles.background}
            imageStyle={styles.backgroundImage}
        >
            <View style={styles.container}>
                <MultiHeader />

                {/* 가운데 카드 이미지 안에 내용 표시 */}
                {/* 가운데 카드 이미지 안에 내용 표시 */}
                <ImageBackground
                    source={
                        isSuccess
                            ? require('../../assets/images/game/multi_result_clear.png')
                            : require('../../assets/images/game/multi_result_fail.png')
                    }
                    style={styles.centerCard}
                    imageStyle={styles.centerCardImage}
                >
                    {/* "클리어" 텍스트 */}
                    <Text style={styles.clearText}>
                        {isSuccess ? "클리어!" : "게임오버"}
                    </Text>

                    {/* 최종 라운드 정보 */}
                    <View style={styles.roundInfo}>
                        <Text style={styles.roundTitle}>최종 라운드</Text>
                        <Text style={styles.roundNumber}>{findItViewModel.round}</Text>
                    </View>

                    {/* 프로필 영역 (2개 정보 표시) */}
                    <View style={styles.profilesContainer}>
                        {/* 첫번째 프로필 */}
                        <View style={styles.profileRow}>
                            <Image
                                source={require('../../assets/images/home/default_profile.png')}
                                style={styles.profileImage}
                            />
                            <Text style={styles.profileName}>프로필 명</Text>
                            <Text style={styles.plusScore}>+200</Text>
                        </View>

                        {/* 두번째 프로필 */}
                        <View style={styles.profileRow}>
                            <Image
                                source={require('../../assets/images/home/default_profile.png')}
                                style={styles.profileImage}
                            />
                            <Text style={styles.profileName}>프로필 명 2</Text>
                            <Text style={styles.plusScore}>+200</Text>
                        </View>
                    </View>
                </ImageBackground>

                {/* 홈으로 이동하는 버튼 */}
                <TouchableOpacity style={styles.homeButton} onPress={goToHome}>
                    <Text style={styles.homeButtonText}>홈으로 이동</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

export default MultiFindItResultScreen;
