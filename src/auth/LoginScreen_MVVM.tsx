import React, { useState, useEffect, useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useViewModel } from '../infrastructure/mvvm/ViewModelProvider';
import { AuthViewModel } from './viewModels/AuthViewModel';
import { LoginView } from './views/LoginView';
import { RootStackParamList } from '../navigation/navigationTypes';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen_MVVM: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  
  // Local form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const viewModel = useViewModel(
    'auth',
    () => new AuthViewModel(),
    []
  );

  // Initialize the auth system when component mounts
  useEffect(() => {
    if (viewModel && !viewModel.isInitialized) {
      viewModel.initialize();
    }
  }, [viewModel]);

  // Check if user is already logged in
  useEffect(() => {
    if (viewModel?.isLoggedIn) {
      navigation.replace('Home');
    }
  }, [viewModel?.isLoggedIn, navigation]);

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          '앱 종료',
          '앱을 종료하시겠습니까?',
          [
            {
              text: '취소',
              onPress: () => null,
              style: 'cancel',
            },
            {
              text: '종료',
              onPress: () => BackHandler.exitApp(),
            },
          ]
        );
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => subscription.remove();
    }, [])
  );

  const handleLogin = useCallback(async () => {
    if (!viewModel) return;

    const credentials = { email: email.trim(), password: password.trim() };
    
    // Client-side validation
    const validationErrors = viewModel.validateLoginForm(credentials);
    if (validationErrors.length > 0) {
      Alert.alert('입력 오류', validationErrors[0]);
      return;
    }

    try {
      const success = await viewModel.login(credentials);
      if (success) {
        navigation.replace('Home');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('로그인 오류', '로그인 중 오류가 발생했습니다.');
    }
  }, [viewModel, email, password, navigation]);

  const handleGoogleLogin = useCallback(async () => {
    if (!viewModel) return;

    try {
      const response = await GoogleSignin.signIn();

      if (!response.data || !response.data.idToken) {
        Alert.alert('구글 로그인 실패', '로그인 정보를 가져오는 데 실패했습니다.');
        return;
      }

      const success = await viewModel.googleLogin({
        idToken: response.data.idToken,
        serverAuthCode: response.data.serverAuthCode
      });

      if (success) {
        navigation.replace('Home');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow
        return;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('알림', '이미 로그인이 진행 중입니다.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('오류', 'Google Play Services를 사용할 수 없습니다.');
      } else {
        Alert.alert('구글 로그인 오류', '구글 로그인 중 오류가 발생했습니다.');
      }
    }
  }, [viewModel, navigation]);

  const handleSignUpPress = useCallback(() => {
    navigation.navigate('SignUp');
  }, [navigation]);

  const handleForgotPasswordPress = useCallback(() => {
    Alert.alert(
      '비밀번호 찾기',
      '비밀번호 찾기 기능은 아직 구현되지 않았습니다.',
      [{ text: '확인' }]
    );
  }, []);

  const handleEmailChange = useCallback((newEmail: string) => {
    setEmail(newEmail);
    // Clear error when user starts typing
    if (viewModel?.error) {
      viewModel.clearError();
    }
  }, [viewModel]);

  const handlePasswordChange = useCallback((newPassword: string) => {
    setPassword(newPassword);
    // Clear error when user starts typing
    if (viewModel?.error) {
      viewModel.clearError();
    }
  }, [viewModel]);

  if (!viewModel) {
    return null; // or loading component
  }

  return (
    <LoginView
      viewModel={viewModel}
      email={email}
      password={password}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onLoginPress={handleLogin}
      onGoogleLoginPress={handleGoogleLogin}
      onSignUpPress={handleSignUpPress}
      onForgotPasswordPress={handleForgotPasswordPress}
    />
  );
};

export default LoginScreen_MVVM;