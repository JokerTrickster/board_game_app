import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, Alert, ImageBackground, Linking } from 'react-native';
import styles from './styles/HomeHeaderStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { gameService } from '../services/GameService';
import { AuthService } from '../services/AuthService';
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import Slider from '@react-native-community/slider'; // ✅ 올바른 방식

const Header: React.FC<{ userData?: any }> = ({ userData }) => {
    const [user, setUser] = useState(userData?.user);
    const [profileImage, setProfileImage] = useState(userData?.profileImage);
    const [isModalVisible, setModalVisible] = useState(false);
    const [effectVolume, setEffectVolume] = useState(0.5);
    const [bgmVolume, setBgmVolume] = useState(0.5);

    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserInfo = async () => {
            const storedUser = await gameService.getUserInfo();
            if (storedUser) {
                setUser(storedUser.user);
                setProfileImage(storedUser.profileImage);
            }
        };

        fetchUserInfo();
    }, [userData]);  // ✅ userData가 변경될 때마다 업데이트

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
    
    return (
        <View style={styles.header}>
                <View style={styles.profileContainer}>
                    {/* 프로필 테두리 이미지를 배경처럼 사용 (ImageBackground) */}
                <ImageBackground
                    source={require('../assets/icons/home/profile.png')}
                    style={styles.profileBorder}
                    imageStyle={styles.profileBorderImg} // ← 추가: 내부 이미지 스타일
                >
                    <Image
                                source={require('../assets/images/home/default_profile.png')}
                                // source={profileImage ? { uri: profileImage } : require('../assets/images/home/default_profile.png')}
                                style={styles.profileImage}
                            />

                        <View style={styles.profileInfo}>
                            <Text style={styles.nickname}>{user?.name || '보린이'}</Text>
                            <Text style={styles.title}>초보자</Text>
                        </View>
                    </ImageBackground>
                </View>

            <View style={styles.coin}>
                <Image
                    source={require('../assets/icons/home/coin.png')}
                    style={styles.coinIcon}
                />
                <Text style={styles.coinCount} numberOfLines={1}>
                    {user?.coin?.toLocaleString() ?? '10000'}
                </Text>
            </View>


            {/* 설정 아이콘 */}
            <TouchableOpacity style={styles.settingsIcon} onPress={toggleModal}>
                <Icon name="bars" size={26} />
            </TouchableOpacity>

            {/* 설정 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={toggleModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>설정</Text>

                        {/* 효과음 조절 */}
                        <View style={styles.settingItem}>
                            <Text>효과음</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={1}
                                step={0.1}
                                value={effectVolume}
                                onValueChange={(value) => setEffectVolume(value)}
                                minimumTrackTintColor="#1E90FF"
                                maximumTrackTintColor="#ddd"
                                thumbTintColor="#1E90FF"
                            />
                        </View>

                        {/* 배경음 조절 */}
                        <View style={styles.settingItem}>
                            <Text>배경음</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={1}
                                step={0.1}
                                value={bgmVolume}
                                onValueChange={(value) => setBgmVolume(value)}
                                minimumTrackTintColor="#1E90FF"
                                maximumTrackTintColor="#ddd"
                                thumbTintColor="#1E90FF"
                            />
                        </View>

                        {/* 약관보기 */}
                        <TouchableOpacity style={styles.modalButton} onPress={() => Linking.openURL('https://www.notion.so/10d2c71ec7c580e1bba8c16dd448a94b?pvs=4')}>
                            <Text>📜 약관보기</Text>
                        </TouchableOpacity>

                        {/* 로그아웃 */}
                        <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
                            <Text>🚪 로그아웃</Text>
                        </TouchableOpacity>
                        {/* 회원 탈퇴 */}
                        <TouchableOpacity style={styles.modalButton} onPress={handleDeleteAccount}>
                            <Text>🚨 회원 탈퇴</Text>
                        </TouchableOpacity>
                        {/* 닫기 버튼 */}
                        <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
                            <Text>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Header;
