import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useViewModel } from '../infrastructure/mvvm/ViewModelProvider';
import { AuthViewModel } from './viewModels/AuthViewModel';
import { SignUpView } from './views/SignUpView';
import { RootStackParamList } from '../navigation/navigationTypes';

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen_MVVM: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();

  // Local form state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

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

  // Validate email in real-time
  useEffect(() => {
    if (email && viewModel) {
      if (!viewModel.authModel.validateEmail(email)) {
        setEmailError('올바른 이메일 형식을 입력해주세요.');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [email, viewModel]);

  // Validate password match in real-time
  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword]);

  const handleRequestEmailVerification = useCallback(async () => {
    if (!viewModel || !email.trim()) {
      setEmailError('이메일을 입력해주세요.');
      return;
    }

    if (!viewModel.authModel.validateEmail(email)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    try {
      const success = await viewModel.requestEmailVerification(email);
      if (success) {
        Alert.alert(
          '인증코드 발송',
          '입력하신 이메일로 인증코드가 발송되었습니다.\n10분 내에 인증을 완료해주세요.',
          [{ text: '확인' }]
        );
        setEmailError('');
      }
    } catch (error) {
      console.error('Email verification request error:', error);
    }
  }, [viewModel, email]);

  const handleVerifyEmailCode = useCallback(async () => {
    if (!viewModel || !email.trim() || !verificationCode.trim()) {
      setCodeError('인증코드를 입력해주세요.');
      return;
    }

    try {
      const success = await viewModel.verifyEmailCode(email, verificationCode);
      if (success) {
        Alert.alert(
          '이메일 인증 완료',
          '이메일 인증이 완료되었습니다.',
          [{ text: '확인' }]
        );
        setCodeError('');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setCodeError('인증코드가 올바르지 않습니다.');
    }
  }, [viewModel, email, verificationCode]);

  const handleCheckNickname = useCallback(async () => {
    if (!viewModel || !nickname.trim()) {
      return;
    }

    if (nickname.length < 2 || nickname.length > 12) {
      Alert.alert('닉네임 오류', '닉네임은 2-12자 사이로 입력해주세요.');
      return;
    }

    try {
      await viewModel.checkNickname(nickname);
    } catch (error) {
      console.error('Nickname check error:', error);
    }
  }, [viewModel, nickname]);

  const handlePasswordChange = useCallback((newPassword: string) => {
    setPassword(newPassword);
    if (viewModel) {
      viewModel.validatePassword(newPassword);
    }
  }, [viewModel]);

  const handleSignUp = useCallback(async () => {
    if (!viewModel) {return;}

    const signUpData = {
      email: email.trim(),
      password: password.trim(),
      confirmPassword: confirmPassword.trim(),
      name: nickname.trim(),
      authCode: verificationCode.trim(),
      agreeTerms: viewModel.agreements.agreeTerms,
      agreePrivacy: viewModel.agreements.agreePrivacy,
      agreeAge: viewModel.agreements.agreeAge,
      agreeMarketing: viewModel.agreements.agreeMarketing,
    };

    // Client-side validation
    const validationErrors = viewModel.validateSignUpForm(signUpData);
    if (validationErrors.length > 0) {
      Alert.alert('입력 오류', validationErrors[0]);
      return;
    }

    if (!viewModel.emailVerification?.isVerified) {
      Alert.alert('인증 오류', '이메일 인증을 완료해주세요.');
      return;
    }

    if (viewModel.nicknameValidation.isAvailable !== true) {
      Alert.alert('닉네임 오류', '닉네임 중복확인을 완료해주세요.');
      return;
    }

    try {
      const success = await viewModel.signUp(signUpData);
      if (success) {
        Alert.alert(
          '회원가입 완료',
          '회원가입이 완료되었습니다.\n로그인 화면으로 이동합니다.',
          [
            {
              text: '확인',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Sign up error:', error);
    }
  }, [
    viewModel,
    email,
    password,
    confirmPassword,
    nickname,
    verificationCode,
    navigation,
  ]);

  const handleLoginPress = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const handleTermsPress = useCallback(() => {
    Alert.alert(
      '이용약관',
      '이용약관 페이지로 이동하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => {
            // Open terms URL
            Linking.openURL('https://your-terms-url.com').catch(() => {
              Alert.alert('오류', '링크를 열 수 없습니다.');
            });
          },
        },
      ]
    );
  }, []);

  const handlePrivacyPress = useCallback(() => {
    Alert.alert(
      '개인정보 처리방침',
      '개인정보 처리방침 페이지로 이동하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => {
            // Open privacy URL
            Linking.openURL('https://your-privacy-url.com').catch(() => {
              Alert.alert('오류', '링크를 열 수 없습니다.');
            });
          },
        },
      ]
    );
  }, []);

  const handleEmailChange = useCallback((newEmail: string) => {
    setEmail(newEmail);
    // Clear error when user starts typing
    if (viewModel?.error) {
      viewModel.clearError();
    }
  }, [viewModel]);

  const handleVerificationCodeChange = useCallback((code: string) => {
    setVerificationCode(code);
    setCodeError('');
    // Clear error when user starts typing
    if (viewModel?.error) {
      viewModel.clearError();
    }
  }, [viewModel]);

  const handleNicknameChange = useCallback((newNickname: string) => {
    setNickname(newNickname);
    // Reset nickname validation when user changes nickname
    if (viewModel) {
      viewModel.authModel.setNicknameValidation(false, null, '');
    }
  }, [viewModel]);

  const handleTogglePasswordVisibility = useCallback(() => {
    setPasswordVisible(!isPasswordVisible);
  }, [isPasswordVisible]);

  const handleToggleConfirmPasswordVisibility = useCallback(() => {
    setConfirmPasswordVisible(!isConfirmPasswordVisible);
  }, [isConfirmPasswordVisible]);

  if (!viewModel) {
    return null; // or loading component
  }

  return (
    <SignUpView
      viewModel={viewModel}
      email={email}
      emailError={emailError}
      verificationCode={verificationCode}
      codeError={codeError}
      nickname={nickname}
      password={password}
      confirmPassword={confirmPassword}
      passwordError={passwordError}
      isPasswordVisible={isPasswordVisible}
      isConfirmPasswordVisible={isConfirmPasswordVisible}
      onEmailChange={handleEmailChange}
      onVerificationCodeChange={handleVerificationCodeChange}
      onNicknameChange={handleNicknameChange}
      onPasswordChange={handlePasswordChange}
      onConfirmPasswordChange={setConfirmPassword}
      onRequestEmailVerification={handleRequestEmailVerification}
      onVerifyEmailCode={handleVerifyEmailCode}
      onCheckNickname={handleCheckNickname}
      onTogglePasswordVisibility={handleTogglePasswordVisibility}
      onToggleConfirmPasswordVisibility={handleToggleConfirmPasswordVisibility}
      onSignUp={handleSignUp}
      onLoginPress={handleLoginPress}
      onTermsPress={handleTermsPress}
      onPrivacyPress={handlePrivacyPress}
    />
  );
};

export default SignUpScreen_MVVM;
