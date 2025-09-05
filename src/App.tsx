import React, { useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AppNavigator from './navigation/AppNavigator';
import { GOOGLE_SIGNIN_CONFIG } from './config'; // ✅ config에서 가져오기
import { performanceMonitor } from './services/PerformanceMonitor';

// Load performance utilities in debug builds
if (__DEV__) {
  require('./utils/performanceUtils');
}

const App: React.FC = () => {
    useEffect(() => {
        GoogleSignin.configure(GOOGLE_SIGNIN_CONFIG); // ✅ config 사용
        
        // Start performance monitoring
        performanceMonitor.startMonitoring(5000); // Monitor every 5 seconds
        
        return () => {
            performanceMonitor.stopMonitoring();
        };
    }, []);

    return <AppNavigator />;
};

export default App;
