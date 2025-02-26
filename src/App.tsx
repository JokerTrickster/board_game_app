import React, { useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AppNavigator from './navigation/AppNavigator';
import { GOOGLE_SIGNIN_CONFIG } from './config'; // ✅ config에서 가져오기

const App: React.FC = () => {
    useEffect(() => {
        GoogleSignin.configure(GOOGLE_SIGNIN_CONFIG); // ✅ config 사용
    }, []);

    return <AppNavigator />;
};

export default App;
