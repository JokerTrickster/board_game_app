import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './views/GameScreen';
import GameOverScreen from './views/GameOverScreen';
import { RootStackParamList } from './navigation/navigationTypes'; // ✅ 네비게이션 타입 import

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Main">
                <Stack.Screen name="Main" component={HomeScreen} options={{ title: '메인 화면' }} />
                <Stack.Screen name="Game" component={GameScreen} options={{ title: '게임 화면' }} />
                <Stack.Screen name="GameOver" component={GameOverScreen} options={{ title: '게임 종료' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
