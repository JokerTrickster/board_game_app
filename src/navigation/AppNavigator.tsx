import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './navigationTypes';
import { webSocketService } from '../services/WebSocketService';
import { globalContainer } from '../infrastructure/mvvm/DIContainer';
import { NavigationViewModel } from './viewModels/NavigationViewModel';
import { AuthViewModel } from '../auth/viewModels/AuthViewModel';

// MVVM Screens
import { HomeScreen } from '../screens/home';
import { LoginScreen, SignUpScreen } from '../auth';
import { SoloFindItScreen, FindItScreen } from '../games/find-it';
import { SlimeWarScreen } from '../games/slime-war';

// Legacy screens (to be migrated)
import FindItGameOverScreen from '../games/find-it/FindItGameOverScreen';
import SoloFindItResultScreen from '../games/find-it/SoloFindItResultScreen';
import MultiFindItResultScreen from '../games/find-it/MultiFindItResultScreen';
import GameDetailScreen from '../screens/GameDetailScreen';
import LoadingScreen from '../screens/LoadingScreen';
import PasswordScreen from '../screens/PasswordScreen';
import SlimeWarResultScreen from '../games/slime-war/screens/SlimeWarResultScreen';
import SequenceScreen from '../games/sequence/screens/SequenceScreen';
import FrogResultScreen from '../games/frog/screens/FrogResultScreen';
import FrogScreen from '../games/frog/screens/FrogScreen';
import SequenceResultScreen from '../games/sequence/screens/SequenceResultScreen';

const Stack = createStackNavigator<RootStackParamList>();

// Navigation container reference
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const AppNavigator: React.FC = () => {
    const [initialRoute, setInitialRoute] = useState<'Login' | 'Home'>('Login');
    const [isNavigationReady, setIsNavigationReady] = useState(false);

    // Initialize navigation and auth
    useEffect(() => {
        const initializeApp = async () => {
            // Get ViewModels from DI container
            const navigationViewModel = globalContainer.resolve<NavigationViewModel>('NavigationViewModel');
            const authViewModel = globalContainer.resolve<AuthViewModel>('AuthViewModel');

            // Initialize ViewModels
            await navigationViewModel.initialize();
            await authViewModel.initialize();

            // Check auth status and set initial route
            const isAuthenticated = await authViewModel.checkAuthStatus();
            setInitialRoute(isAuthenticated ? 'Home' : 'Login');

            // Set navigation reference in NavigationViewModel
            navigationViewModel.setNavigationRef(navigationRef);
        };

        initializeApp();
    }, []);

    // Handle navigation ready state
    const handleNavigationReady = () => {
        setIsNavigationReady(true);
        
        // Set navigation reference for WebSocket service
        webSocketService.setNavigation(navigationRef);

        // Get NavigationViewModel and notify it's ready
        const navigationViewModel = globalContainer.resolve<NavigationViewModel>('NavigationViewModel');
        navigationViewModel.processPendingDeepLink();
    };

    // Handle navigation state change
    const handleNavigationStateChange = (state: any) => {
        if (!isNavigationReady) return;

        const navigationViewModel = globalContainer.resolve<NavigationViewModel>('NavigationViewModel');
        
        // Get current route info
        if (state && state.routes && state.routes.length > 0) {
            const currentRoute = state.routes[state.index];
            navigationViewModel.setCurrentRoute(currentRoute.name, currentRoute.params);
        }
    };

    return (
        <NavigationContainer 
            ref={navigationRef}
            onReady={handleNavigationReady}
            onStateChange={handleNavigationStateChange}
        >
            <Stack.Navigator 
                initialRouteName={initialRoute} 
                screenOptions={{ headerShown: false }}
            >
                {/* Authentication Screens */}
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                
                {/* Main Application Screens */}
                <Stack.Screen name="Home" component={HomeScreen} />
                
                {/* Game Screens - MVVM */}
                <Stack.Screen name="FindIt" component={FindItScreen} />
                <Stack.Screen name="SoloFindIt" component={SoloFindItScreen} />
                <Stack.Screen name="SlimeWar" component={SlimeWarScreen} />
                
                {/* Legacy Game Screens - To be migrated */}
                <Stack.Screen name="FindItGameOver" component={FindItGameOverScreen} />
                <Stack.Screen name="SoloFindItResult" component={SoloFindItResultScreen} />
                <Stack.Screen name="MultiFindItResult" component={MultiFindItResultScreen} />
                <Stack.Screen name="SlimeWarResult" component={SlimeWarResultScreen} />
                <Stack.Screen name="Sequence" component={SequenceScreen} />
                <Stack.Screen name="SequenceResult" component={SequenceResultScreen} />
                <Stack.Screen name="Frog" component={FrogScreen} />
                <Stack.Screen name="FrogResult" component={FrogResultScreen} />
                
                {/* Utility Screens */}
                <Stack.Screen name="GameDetail" component={GameDetailScreen} />
                <Stack.Screen name="Loading" component={LoadingScreen} />
                <Stack.Screen name="Password" component={PasswordScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;

