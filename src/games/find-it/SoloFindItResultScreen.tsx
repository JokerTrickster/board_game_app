import React,{ useEffect, useState }  from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import styles from './styles/SoloFindItResultStyles';
import SoloHeader from '../../components/SoloHeader';
import soloGameViewModel from './services/SoloFindItViewModel';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { gameService } from '../../services/GameService'; // gameService import

type SoloFindItResultRouteProp = RouteProp<RootStackParamList, 'SoloFindItResult'>;

  
const SoloFindItResultScreen: React.FC = () => {
    // 성공 여부 변수 (실제 로직에 따라 변경)
    const navigation = useNavigation<any>();
    const route = useRoute<SoloFindItResultRouteProp>();
    const goToHome = () => {
        soloGameViewModel.resetGameState();
        (navigation as any).navigate("Loading", { nextScreen: 'Home' });
    };
    // route 파라미터로부터 isSuccess와 gameInfoList를 받음
    const { isSuccess, gameInfoList } = route.params || { isSuccess: false, gameInfoList: [] };

    // 유저 정보를 저장할 상태
    const [userInfo, setUserInfo] = useState<any>(null);
    // 컴포넌트 마운트 시 gameService로부터 유저 정보 불러오기
    useEffect(() => {
        async function loadUserInfo() {
            const fetchedUserInfo = await gameService.getUserInfo();
            setUserInfo(fetchedUserInfo);
        }
        loadUserInfo();
    }, []);

    return (
        // 전체 배경 이미지
        <ImageBackground
            source={require('../../assets/images/common/background_basic.png')}
            style={styles.background}
            imageStyle={styles.backgroundImage}
        >
            <View style={styles.container}>
                <SoloHeader showRound={false} />

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
                    <Text style={styles.clearText}>
                        {isSuccess ? "클리어!" : "게임오버"}
                    </Text>

                    {/* 최종 라운드 정보 */}
                    <View style={styles.roundInfo}>
                        <Text style={styles.roundTitle}>최종 라운드</Text>
                        <Text style={styles.roundNumber}>{soloGameViewModel.round}</Text>
                    </View>

                    {/* 프로필 영역 (2개 정보 표시) */}
                    <View style={styles.profilesContainer}>
                        {/* 첫번째 프로필 */}
                        <View style={styles.profileRow}>
                            <Image
                                source={require('../../assets/images/home/default_profile.png')}
                                style={styles.profileImage}
                            />
                            <Text style={styles.profileName}>  {userInfo ? userInfo.name : '유저'}</Text>
                            <Text style={styles.plusScore}>{isSuccess ? "+1" : "0"}</Text>
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
