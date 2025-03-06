import React, { useEffect, useRef } from 'react';
import { View, Text, ImageBackground, Animated } from 'react-native';
import { useNavigation, useRoute, StackActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/navigationTypes';
import { LoadingScreenStyles } from '../styles/LoadingStyles';

type LoadingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Loading'>;

const LoadingScreen: React.FC = () => {
    const navigation = useNavigation<LoadingScreenNavigationProp>();
    const route = useRoute();
    const { nextScreen } = route.params as { nextScreen: keyof RootStackParamList };

    // 메시지 결정: 게임 시작 시(예: FindIt)와 게임 종료 시(Home)
    const message =
        nextScreen === 'FindIt'
            ? '게임 준비 중...'
            : nextScreen === 'Home'
                ? '홈 화면으로 이동 중...'
                : '로딩 중...';

    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
        }).start(() => {
            navigation.dispatch(StackActions.replace(nextScreen));
        });
    }, [progress, navigation, nextScreen]);

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
