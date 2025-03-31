import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import soloFindItViewModel from './services/SoloFindItViewModel';
import styles from './styles/SoloFindItResultStyles'; // 스타일 임포트

const SoloFindItResultScreen: React.FC = observer(() => {
    const navigation = useNavigation(); // navigation 타입을 명확히 지정
    const isSuccess = soloFindItViewModel.roundClearEffect; // 성공 여부

    const goToHome = () => {
        navigation.navigate('Home' as never); // 타입 오류를 피하기 위해 'Home'을 never로 캐스팅
    };

    return (
        <ImageBackground
            source={require('../../assets/images/common/background_basic.png')}
            style={styles.background}
            imageStyle={styles.backgroundImage}
        >
            <View style={styles.container}>
                <Text style={styles.title}>결과</Text>
                    <Text style={styles.clearText}>
                        {isSuccess ? "클리어!" : "게임오버"}
                    </Text>

                    <View style={styles.roundInfo}>
                        <Text style={styles.roundTitle}>최종 라운드</Text>
                        <Text style={styles.roundNumber}>{soloFindItViewModel.round}</Text>
                    </View>

                    {/* 프로필 영역 (1개 정보 표시) */}
                    <View style={styles.profilesContainer}>
                        <View style={styles.profileRow}>
                            <View style={styles.profileImage} />
                            <Text style={styles.profileName}>혜봉이</Text>
                            <Text style={styles.profileScore}>+500</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.mainButton} onPress={goToHome}>
                        <Text style={styles.mainButtonText}>홈으로</Text>
                    </TouchableOpacity>
                </View>
        </ImageBackground>
    );
});

export default SoloFindItResultScreen;
