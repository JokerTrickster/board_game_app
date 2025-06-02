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

const SlimeWarMultiHeader: React.FC<{ userData?: any; timer: number }> = ({ userData, timer }) => {
    const [users, setUsers] = useState(userData?.users || []);
    const [profileImage, setProfileImage] = useState(userData?.profileImage);
    const [isModalVisible, setModalVisible] = useState(false);
    const [effectVolume, setEffectVolume] = useState(0.5);
    const [bgmVolume, setBgmVolume] = useState(0.5);

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
            </View>
        </View>
    );
};

export default SlimeWarMultiHeader;
