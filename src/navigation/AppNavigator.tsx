import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import FindItScreen from '../games/find-it/FindItScreen';
import GameOverScreen from '../screens/GameOverScreen';
import { RootStackParamList } from './navigationTypes'; // ✅ 네비게이션 타입 import

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="FindIt" component={FindItScreen} />
                <Stack.Screen name="GameOver" component={GameOverScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
