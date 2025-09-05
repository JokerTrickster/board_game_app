import React, { useEffect, useRef } from 'react';
import { View, Text, ImageBackground, Animated } from 'react-native';
import { useNavigation, useRoute, StackActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/navigationTypes';
import { LoadingScreenStyles } from '../styles/LoadingStyles';
import Sound from 'react-native-sound';
import { CommonAudioManager } from '../services/CommonAudioManager'; // AudioManager import


type LoadingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Loading'>;

const LoadingScreen: React.FC = () => {
    const navigation = useNavigation<LoadingScreenNavigationProp>();
    const route = useRoute();
    const { nextScreen, params } = route.params as { nextScreen: keyof RootStackParamList; params?: any };

    // 메시지와 로딩 시간을 컨텍스트별로 결정
    const getLoadingConfig = (screen: keyof RootStackParamList) => {
        switch (screen) {
            case 'FindIt':
            case 'SlimeWar':
            case 'Sequence':
            case 'Frog':
            case 'SoloFindIt':
                return {
                    message: '게임 준비 중...',
                    duration: 1500, // 게임은 약간 더 긴 로딩 시간
                };
            case 'Home':
                return {
                    message: '홈 화면으로 이동 중...',
                    duration: 800, // 홈으로 이동은 빠르게
                };
            case 'Login':
                return {
                    message: '로그인 화면으로 이동 중...',
                    duration: 600, // 로그인은 매우 빠르게
                };
            default:
                return {
                    message: '로딩 중...',
                    duration: 1000, // 기본값도 기존보다 빠르게
                };
        }
    };

    const { message, duration } = getLoadingConfig(nextScreen);
    const progress = useRef(new Animated.Value(0)).current;
    
    // 로딩 화면 마운트 시 배경음악 초기화
    useEffect(() => {
        CommonAudioManager.initBackgroundMusic();
    }, []);
    
    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: duration, // 컨텍스트별 동적 duration 사용
            useNativeDriver: false,
        }).start(() => {
            navigation.dispatch(StackActions.replace(nextScreen, params));
        });
    }, [progress, navigation, nextScreen, duration]);

    const progressBarWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <ImageBackground
            source={require('../assets/images/common/background_couple.png')} // 경로에 맞게 수정
            style={LoadingScreenStyles.background}
        >
            <View style={LoadingScreenStyles.container}>
                <View style={LoadingScreenStyles.progressBarContainer}>
                    <Animated.View
                        style={[LoadingScreenStyles.progressBar, { width: progressBarWidth }]}
                    />
                </View>
                <Text style={LoadingScreenStyles.messageText}>{message}</Text>
            </View>
        </ImageBackground>
    );
};

export default LoadingScreen;
