import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, Alert, ImageBackground, Linking } from 'react-native';
import styles from './styles/MultiHeaderStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { gameService } from '../services/GameService';
import { AuthService } from '../services/AuthService';
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import Slider from '@react-native-community/slider'; // ✅ 올바른 방식
import { slimeWarViewModel } from '../games/slime-war/services/SlimeWarViewModel';

const TURN_TIME = 30;

// 카드 이미지 매핑 (id: require)
const cardImageMap: { [key: number]: any } = {
    1: require('../assets/icons/slime-war/card/card01.png'),
    2: require('../assets/icons/slime-war/card/card01.png'),
    3: require('../assets/icons/slime-war/card/card02.png'),
    4: require('../assets/icons/slime-war/card/card02.png'),
    5: require('../assets/icons/slime-war/card/card03.png'),
    6: require('../assets/icons/slime-war/card/card03.png'),
    7: require('../assets/icons/slime-war/card/card11.png'),
    8: require('../assets/icons/slime-war/card/card11.png'),
    9: require('../assets/icons/slime-war/card/card12.png'),
    10: require('../assets/icons/slime-war/card/card12.png'),
    11: require('../assets/icons/slime-war/card/card13.png'),
    12: require('../assets/icons/slime-war/card/card13.png'),
    13: require('../assets/icons/slime-war/card/card21.png'),
    14: require('../assets/icons/slime-war/card/card21.png'),
    15: require('../assets/icons/slime-war/card/card22.png'),
    16: require('../assets/icons/slime-war/card/card22.png'),
    17: require('../assets/icons/slime-war/card/card23.png'),
    18: require('../assets/icons/slime-war/card/card23.png'),
    19: require('../assets/icons/slime-war/card/card31.png'),
    20: require('../assets/icons/slime-war/card/card31.png'),
    21: require('../assets/icons/slime-war/card/card32.png'),
    22: require('../assets/icons/slime-war/card/card32.png'),
    23: require('../assets/icons/slime-war/card/card33.png'),
    24: require('../assets/icons/slime-war/card/card33.png'),
    25: require('../assets/icons/slime-war/card/card41.png'),
    26: require('../assets/icons/slime-war/card/card41.png'),
    27: require('../assets/icons/slime-war/card/card42.png'),
    28: require('../assets/icons/slime-war/card/card42.png'),
    29: require('../assets/icons/slime-war/card/card43.png'),
    30: require('../assets/icons/slime-war/card/card43.png'),
    31: require('../assets/icons/slime-war/card/card51.png'),
    32: require('../assets/icons/slime-war/card/card51.png'),
    33: require('../assets/icons/slime-war/card/card52.png'),
    34: require('../assets/icons/slime-war/card/card52.png'),
    35: require('../assets/icons/slime-war/card/card53.png'),
    36: require('../assets/icons/slime-war/card/card53.png'),
    37: require('../assets/icons/slime-war/card/card61.png'),
    38: require('../assets/icons/slime-war/card/card61.png'),
    39: require('../assets/icons/slime-war/card/card62.png'),
    40: require('../assets/icons/slime-war/card/card62.png'),
    41: require('../assets/icons/slime-war/card/card63.png'),
    42: require('../assets/icons/slime-war/card/card63.png'),
    43: require('../assets/icons/slime-war/card/card71.png'),
    44: require('../assets/icons/slime-war/card/card71.png'),
    45: require('../assets/icons/slime-war/card/card72.png'),
    46: require('../assets/icons/slime-war/card/card72.png'),
    47: require('../assets/icons/slime-war/card/card73.png'),
    48: require('../assets/icons/slime-war/card/card73.png'),
};

// 카드 ID로 이미지 경로 반환
const getCardImageSource = (cardId: number) => {
    return cardImageMap[cardId] ?? null;
};

const SlimeWarMultiHeader: React.FC<{ userData?: any; timer: number }> = ({ userData, timer }) => {
    const [users, setUsers] = useState(userData?.users || []);
    const [profileImage, setProfileImage] = useState(userData?.profileImage);
    const [isModalVisible, setModalVisible] = useState(false);
    const [effectVolume, setEffectVolume] = useState(0.5);
    const [bgmVolume, setBgmVolume] = useState(0.5);
    const [myLastCard, setMyLastCard] = useState<any>(null);
    const [opponentLastCard, setOpponentLastCard] = useState<any>(null);

    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserInfo = async () => {
            const storedData = await gameService.getUserInfo();
            if (storedData) {
                // storedData.users가 존재하면 두 명 이상의 정보를 세팅
                setUsers(storedData.users || [storedData.user]);
            }
        };

        fetchUserInfo();
    }, [userData]);

    useEffect(() => {
        const currentMyCard = slimeWarViewModel.myLastPlacedCard;
        const currentOpponentCard = slimeWarViewModel.opponentLastPlacedCard;

        // null이 아닐 때만 카드 정보 업데이트
        if (currentMyCard !== 0) {
            setMyLastCard(currentMyCard);
        }
        if (currentOpponentCard !== 0) {
            setOpponentLastCard(currentOpponentCard);
        }
    }, [slimeWarViewModel.round]);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    // ✅ 회원 탈퇴 처리
    const handleDeleteAccount = async () => {
        Alert.alert('회원 탈퇴', '정말로 탈퇴하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '확인',
                onPress: async () => {
                    await AuthService.logout(); // ✅ API 추가 필요
                    navigation.dispatch(StackActions.replace('Login'));

                    Alert.alert('탈퇴 완료', '회원 탈퇴가 정상적으로 처리되었습니다.');
                },
            },
        ]);
    };

    // ✅ 로그아웃 처리
    const handleLogout = async () => {
        await AuthService.logout();
        navigation.dispatch(StackActions.replace('Login'));

    };
    // 두 유저 정보 추출 (존재하지 않을 경우 기본값 사용)
    const profile1 = users[0] || { name: '유저1', profileImage: null };
    const profile2 = users[1] || { name: '유저2', profileImage: null };

    return (
        <View style={styles.multiHeader}>
            {/* 프로필 1 */}
            <View style={styles.profileContainer}>
                <Image
                    source={
                        profile1.profileImage
                            ? { uri: profile1.profileImage }
                            : require('../assets/images/home/default_profile.png')
                    }
                    style={styles.profileImage}
                />
                <View style={styles.profileInfo}>
                    <Text style={[
                        styles.nickname,
                        slimeWarViewModel.isMyTurn && profile1.name === '나' && styles.activePlayerName,
                        !slimeWarViewModel.isMyTurn && profile2.name === '상대' && styles.activePlayerName
                    ]}>
                        {profile1.name || '보린이'}
                    </Text>
                </View>
                {/* 마지막 사용 카드 표시 */}
                {myLastCard && (
                    <View style={styles.lastCardContainer}>
                        <Image
                            source={getCardImageSource(myLastCard)}
                            style={styles.lastCardImage}
                            resizeMode="contain"
                        />
                    </View>
                )}
            </View>

            {/* 가운데: 타이머만 표시 */}
            <View style={styles.centerContainer}>
                <View style={styles.timerWrapper}>
                    <View style={styles.timerContainer}>
                        <View style={styles.timerBar}>
                            <View
                                style={[
                                    styles.timerProgress,
                                    { width: `${(timer / TURN_TIME) * 100}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.timerText}>{timer}초</Text>
                    </View>
                </View>
            </View>

            {/* 프로필 2 */}
            <View style={styles.profileContainer}>
                <Image
                    source={
                        profile2.profileImage
                            ? { uri: profile2.profileImage }
                            : require('../assets/images/home/default_profile.png')
                    }
                    style={styles.profileImage}
                />
                <View style={styles.profileInfo}>
                    <Text style={[
                        styles.nickname,
                        slimeWarViewModel.isMyTurn && profile2.name === '상대' && styles.activePlayerName,
                        !slimeWarViewModel.isMyTurn && profile1.name === '나' && styles.activePlayerName
                    ]}>
                        {profile2.name || '보린이'}
                    </Text>
                </View>
                {/* 마지막 사용 카드 표시 */}
                {opponentLastCard && (
                    <View style={styles.lastCardContainer}>
                        <Image
                            source={getCardImageSource(opponentLastCard)}
                            style={styles.lastCardImage}
                            resizeMode="contain"
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

export default SlimeWarMultiHeader;
