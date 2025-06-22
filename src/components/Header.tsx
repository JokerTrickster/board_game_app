import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, Alert, ImageBackground, Linking, Switch } from 'react-native';
import styles from './styles/HomeHeaderStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { gameService } from '../services/GameService';
import { AuthService } from '../services/AuthService';
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import Sound from 'react-native-sound'; // 음량 제어를 위한 라이브러리

const Header: React.FC<{ userData?: any }> = ({ userData }) => {
    const [user, setUser] = useState(userData?.user);
    const [profileImage, setProfileImage] = useState(userData?.profileImage);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isEffectSoundOn, setIsEffectSoundOn] = useState(true);
    const [isBgmOn, setIsBgmOn] = useState(true);

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
    }, [userData]);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    // 효과음 on/off 처리
    const handleEffectSoundToggle = (value: boolean) => {
        setIsEffectSoundOn(value);
        // 효과음 음량 설정 (0 또는 1)
        Sound.setCategory('Playback');
        if (value) {
            // 효과음 켜기
            console.log('효과음 켜짐');
        } else {
            // 효과음 끄기
            console.log('효과음 꺼짐');
        }
    };

    // 배경음 on/off 처리
    const handleBgmToggle = (value: boolean) => {
        setIsBgmOn(value);
        // 배경음 음량 설정 (0 또는 1)
        if (value) {
            // 배경음 켜기
            console.log('배경음 켜짐');
        } else {
            // 배경음 끄기
            console.log('배경음 꺼짐');
        }
    };

    // ✅ 회원 탈퇴 처리
    const handleDeleteAccount = async () => {
        Alert.alert('회원 탈퇴', '정말로 탈퇴하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '확인',
                onPress: async () => {
                    await AuthService.logout();
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
                <ImageBackground
                    source={require('../assets/icons/home/profile.png')}
                    style={styles.profileBorder}
                    imageStyle={styles.profileBorderImg}
                >
                    <Image
                        source={require('../assets/images/home/default_profile.png')}
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

            <TouchableOpacity style={styles.settingsIcon} onPress={toggleModal}>
                <Icon name="bars" size={26} />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={toggleModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>설정</Text>

                        {/* 효과음 on/off */}
                        <View style={styles.settingItem}>
                            <Text style={styles.settingText}>효과음</Text>
                            <Switch
                                value={isEffectSoundOn}
                                onValueChange={handleEffectSoundToggle}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={isEffectSoundOn ? '#f5dd4b' : '#f4f3f4'}
                            />
                        </View>

                        {/* 배경음 on/off */}
                        <View style={styles.settingItem}>
                            <Text style={styles.settingText}>배경음</Text>
                            <Switch
                                value={isBgmOn}
                                onValueChange={handleBgmToggle}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={isBgmOn ? '#f5dd4b' : '#f4f3f4'}
                            />
                        </View>

                        <TouchableOpacity style={styles.modalButton} onPress={() => Linking.openURL('https://www.notion.so/10d2c71ec7c580e1bba8c16dd448a94b?pvs=4')}>
                            <Text>📜 약관보기</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
                            <Text>🚪 로그아웃</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalButton} onPress={handleDeleteAccount}>
                            <Text>🚨 회원 탈퇴</Text>
                        </TouchableOpacity>

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
