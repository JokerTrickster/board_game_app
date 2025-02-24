import React, { useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AppNavigator from './navigation/AppNavigator';

const App: React.FC = () => {
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '486518371116-p5fbtprg2n283c6dt9gcv1glnmebcbn4.apps.googleusercontent.com', // Firebase에서 받은 Web Client ID를 넣어주세요.
            offlineAccess: true,  // 서버 인증 코드를 받으려면 반드시 true 설정
        });
    }, []);

    return <AppNavigator />;
};

export default App;