import React, { useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AppNavigator from './navigation/AppNavigator';
import { GOOGLE_SIGNIN_CONFIG } from './config';
import { performanceMonitor } from './services/PerformanceMonitor';
import { ViewModelProvider } from './infrastructure/mvvm';
import { registerServices } from './infrastructure/serviceRegistration';
import { globalContainer } from './infrastructure/mvvm/DIContainer';
import { NavigationViewModel } from './navigation/viewModels/NavigationViewModel';
import { AuthViewModel } from './auth/viewModels/AuthViewModel';

// Load performance utilities in debug builds
if (__DEV__) {
  require('./utils/performanceUtils');
}

const App: React.FC = () => {
    useEffect(() => {
        // Register services first
        registerServices();
        
        // Register global ViewModels in DI container
        globalContainer.register(
            'NavigationViewModel',
            () => new NavigationViewModel(),
            { singleton: true }
        );
        
        globalContainer.register(
            'AuthViewModel', 
            () => new AuthViewModel(),
            { singleton: true }
        );
        
        GoogleSignin.configure(GOOGLE_SIGNIN_CONFIG);
        
        // Start performance monitoring
        performanceMonitor.startMonitoring(5000); // Monitor every 5 seconds
        
        return () => {
            performanceMonitor.stopMonitoring();
        };
    }, []);

    return (
        <ViewModelProvider>
            <AppNavigator />
        </ViewModelProvider>
    );
};

export default App;
