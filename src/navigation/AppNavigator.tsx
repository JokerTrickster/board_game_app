import React, { useEffect, useRef, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import FindItScreen from '../games/find-it/FindItScreen';
import FindItGameOverScreen from '../games/find-it/FindItGameOverScreen';
import GameDetailScreen from '../screens/GameDetailScreen';
import PasswordScreen from '../screens/PasswordScreen';
import { RootStackParamList } from './navigationTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { webSocketService } from '../services/WebSocketService';

const Stack = createStackNavigator<RootStackParamList>();

// ✅ NavigationContainerRef 생성 (React Navigation 공식 방법)
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const AppNavigator: React.FC = () => {
    const [initialRoute, setInitialRoute] = useState<'Login' | 'Home'>('Login');

    // ✅ 저장된 토큰 확인 후 초기 화면 설정
    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            setInitialRoute(token ? 'Home' : 'Login');
        };

        checkAuthStatus();
    }, []);

    // ✅ 웹소켓 서비스에 네비게이션 설정
    useEffect(() => {
        if (navigationRef.isReady()) {
            webSocketService.setNavigation(navigationRef);
        }
    }, []);

    return (
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="SignUp" component={SignUpScreen} />
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="FindIt" component={FindItScreen} />
                    <Stack.Screen name="FindItGameOver" component={FindItGameOverScreen} />
                    <Stack.Screen name="Password" component={PasswordScreen} />
                    <Stack.Screen name="GameDetail" component={GameDetailScreen} />
                </Stack.Navigator>
            </NavigationContainer>

    );
};

export default AppNavigator;

