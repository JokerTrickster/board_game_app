import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, Alert, ImageBackground, Linking } from 'react-native';
import styles from './styles/MultiHeaderStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { gameService } from '../services/GameService';
import { AuthService } from '../services/AuthService';
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import Slider from '@react-native-community/slider'; // ✅ 올바른 방식
import { sequenceViewModel } from '../games/sequence/services/SequenceViewModel';
import { sequenceWebSocketService } from '../games/sequence/services/SequenceWebsocketService';
import sequenceCards from '../assets/data/sequnce_cards.json';

const TURN_TIME = 30; // 타이머 시간 상수

// 카드 이미지 매핑 객체 (SequenceScreen에서 사용한 것과 동일하게)
const cardImageMap: { [key: string]: any } = {
'all.png': require('../assets/icons/sequence/cards/all.png'),
  'clovaa.png': require('../assets/icons/sequence/cards/clovaa.png'),
  'clova2.png': require('../assets/icons/sequence/cards/clova2.png'),
  'clova3.png': require('../assets/icons/sequence/cards/clova3.png'),
  'clova4.png': require('../assets/icons/sequence/cards/clova4.png'),
  'clova5.png': require('../assets/icons/sequence/cards/clova5.png'),
  'clova6.png': require('../assets/icons/sequence/cards/clova6.png'),
  'clova7.png': require('../assets/icons/sequence/cards/clova7.png'),
  'clova8.png': require('../assets/icons/sequence/cards/clova8.png'),
  'clova9.png': require('../assets/icons/sequence/cards/clova9.png'),
  'clova10.png': require('../assets/icons/sequence/cards/clova10.png'),
  'clovak.png': require('../assets/icons/sequence/cards/clovak.png'),
  'clovaq.png': require('../assets/icons/sequence/cards/clovaq.png'),
  'diamonda.png': require('../assets/icons/sequence/cards/diamonda.png'),
  'diamond2.png': require('../assets/icons/sequence/cards/diamond2.png'),
  'diamond3.png': require('../assets/icons/sequence/cards/diamond3.png'),
  'diamond4.png': require('../assets/icons/sequence/cards/diamond4.png'),
  'diamond5.png': require('../assets/icons/sequence/cards/diamond5.png'),
  'diamond6.png': require('../assets/icons/sequence/cards/diamond6.png'),
  'diamond7.png': require('../assets/icons/sequence/cards/diamond7.png'),
  'diamond8.png': require('../assets/icons/sequence/cards/diamond8.png'),
  'diamond9.png': require('../assets/icons/sequence/cards/diamond9.png'),
  'diamond10.png': require('../assets/icons/sequence/cards/diamond10.png'),
  'diamondk.png': require('../assets/icons/sequence/cards/diamondk.png'),
  'diamondq.png': require('../assets/icons/sequence/cards/diamondq.png'),
  'hearta.png': require('../assets/icons/sequence/cards/hearta.png'),
  'heart2.png': require('../assets/icons/sequence/cards/heart2.png'),
  'heart3.png': require('../assets/icons/sequence/cards/heart3.png'),
  'heart4.png': require('../assets/icons/sequence/cards/heart4.png'),
  'heart5.png': require('../assets/icons/sequence/cards/heart5.png'),
  'heart6.png': require('../assets/icons/sequence/cards/heart6.png'),
  'heart7.png': require('../assets/icons/sequence/cards/heart7.png'),
  'heart8.png': require('../assets/icons/sequence/cards/heart8.png'),
  'heart9.png': require('../assets/icons/sequence/cards/heart9.png'),
  'heart10.png': require('../assets/icons/sequence/cards/heart10.png'),
  'heartk.png': require('../assets/icons/sequence/cards/heartk.png'),
  'heartq.png': require('../assets/icons/sequence/cards/heartq.png'),
  'spacea.png': require('../assets/icons/sequence/cards/spacea.png'),
  'space2.png': require('../assets/icons/sequence/cards/space2.png'),
  'space3.png': require('../assets/icons/sequence/cards/space3.png'),
  'space4.png': require('../assets/icons/sequence/cards/space4.png'),
  'space5.png': require('../assets/icons/sequence/cards/space5.png'),
  'space6.png': require('../assets/icons/sequence/cards/space6.png'),
  'space7.png': require('../assets/icons/sequence/cards/space7.png'),
  'space8.png': require('../assets/icons/sequence/cards/space8.png'),
  'space9.png': require('../assets/icons/sequence/cards/space9.png'),
  'space10.png': require('../assets/icons/sequence/cards/space10.png'),
  'spacek.png': require('../assets/icons/sequence/cards/spacek.png'),
  'spaceq.png': require('../assets/icons/sequence/cards/spaceq.png'),
  'joker1.png': require('../assets/icons/sequence/cards/joker1.png'),
  'joker2.png': require('../assets/icons/sequence/cards/joker2.png'),
};

// 카드ID로 카드 정보 조회
const getCardInfoById = (cardID: number) => {
  return sequenceCards.find(card => card.id === cardID);
};

// 카드 정보로 이미지 반환
const getCardImage = (cardInfo: any) => {
  if (!cardInfo || !cardInfo.image) return null;
  return cardImageMap[cardInfo.image] || null;
};

const SequenceMultiHeader: React.FC<{ userData?: any }> = ({ userData }) => {
    const [users, setUsers] = useState(userData?.users || []);
    const [profileImage, setProfileImage] = useState(userData?.profileImage);
    const [isModalVisible, setModalVisible] = useState(false);
    const [effectVolume, setEffectVolume] = useState(0.5);
    const [bgmVolume, setBgmVolume] = useState(0.5);
    const [timer, setTimer] = useState(TURN_TIME);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const [myLastCard, setMyLastCard] = useState<number | null>(null);
    const [opponentLastCard, setOpponentLastCard] = useState<number | null>(null);

    const navigation = useNavigation();

    // 타이머 설정
    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setTimer(TURN_TIME);

        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    timerRef.current = null;
                    if (sequenceViewModel.isMyTurn) {
                        sequenceWebSocketService.sendTimeoutEvent();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [sequenceViewModel.isMyTurn]);

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

    // 마지막 사용 카드 추적
    useEffect(() => {
        // 내 마지막 사용 mapID → 카드ID
        if (sequenceViewModel.ownedMapIDs.length > 0) {
            const lastMapID = sequenceViewModel.ownedMapIDs[sequenceViewModel.ownedMapIDs.length - 1];
            const cardInfo = sequenceCards.find(card => card.mapID === lastMapID);
            setMyLastCard(cardInfo?.id ?? null);
        }
        // 상대 마지막 사용 mapID → 카드ID
        if (sequenceViewModel.opponentOwnedMapIDs.length > 0) {
            const lastMapID = sequenceViewModel.opponentOwnedMapIDs[sequenceViewModel.opponentOwnedMapIDs.length - 1];
            const cardInfo = sequenceCards.find(card => card.mapID === lastMapID);
            setOpponentLastCard(cardInfo?.id ?? null);
        }
    }, [sequenceViewModel.ownedMapIDs, sequenceViewModel.opponentOwnedMapIDs]);

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
                    <Text style={styles.nickname}>{profile1.name || '보린이'}</Text>
                </View>
                {/* 마지막 사용 카드 표시 */}
                {myLastCard && (
                    <View style={styles.lastCardContainer}>
                        <Image
                            source={getCardImage(getCardInfoById(myLastCard))}
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
                    <Text style={styles.nickname}>{profile2.name || '보린이'}</Text>
                </View>
                {/* 마지막 사용 카드 표시 */}
                {opponentLastCard && (
                    <View style={styles.lastCardContainer}>
                        <Image
                            source={getCardImage(getCardInfoById(opponentLastCard))}
                            style={styles.lastCardImage}
                            resizeMode="contain"
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

export default SequenceMultiHeader;
