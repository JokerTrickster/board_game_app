import React from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import styles from './SoloFindItResultStyles';
import SoloHeader from '../../components/SoloHeader';

const SoloFindItResultScreen: React.FC = () => {
    // 성공 여부 변수 (실제 로직에 따라 변경)
    const isSuccess = true;
    const navigation = useNavigation<any>();

    const goToHome = () => {
        (navigation as any).navigate("Loading", { nextScreen: 'Home' });
    };

    return (
        // 전체 배경 이미지
        <ImageBackground
            source={require('../../assets/images/common/background_basic.png')}
            style={styles.background}
            imageStyle={styles.backgroundImage}
        >
            <View style={styles.container}>
                <SoloHeader />

                {/* 가운데 카드 이미지 안에 내용 표시 */}
                <ImageBackground
                    source={
                        isSuccess
                            ? require('../../assets/images/game/solo_result_clear.png')
                            : require('../../assets/images/game/solo_result_fail.png')
                    }
                    style={styles.centerCard}
                    imageStyle={styles.centerCardImage}
                >
                    {/* "클리어" 텍스트 */}
                    <Text style={styles.clearText}>클리어</Text>

                    {/* 최종 라운드 정보 */}
                    <View style={styles.roundInfo}>
                        <Text style={styles.roundTitle}>최종 라운드</Text>
                        <Text style={styles.roundNumber}>30</Text>
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

export default SoloFindItResultScreen;
