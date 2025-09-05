import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import CheckBox from '@react-native-community/checkbox';
import { AuthViewModel } from '../viewModels/AuthViewModel';
import styles from '../../styles/SignUpStyles';

interface SignUpViewProps {
  viewModel: AuthViewModel;
  email: string;
  emailError: string;
  verificationCode: string;
  codeError: string;
  nickname: string;
  password: string;
  confirmPassword: string;
  passwordError: string;
  isPasswordVisible: boolean;
  isConfirmPasswordVisible: boolean;
  onEmailChange: (email: string) => void;
  onVerificationCodeChange: (code: string) => void;
  onNicknameChange: (nickname: string) => void;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (password: string) => void;
  onRequestEmailVerification: () => void;
  onVerifyEmailCode: () => void;
  onCheckNickname: () => void;
  onTogglePasswordVisibility: () => void;
  onToggleConfirmPasswordVisibility: () => void;
  onSignUp: () => void;
  onLoginPress: () => void;
  onTermsPress: () => void;
  onPrivacyPress: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = observer(({
  viewModel,
  email,
  emailError,
  verificationCode,
  codeError,
  nickname,
  password,
  confirmPassword,
  passwordError,
  isPasswordVisible,
  isConfirmPasswordVisible,
  onEmailChange,
  onVerificationCodeChange,
  onNicknameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onRequestEmailVerification,
  onVerifyEmailCode,
  onCheckNickname,
  onTogglePasswordVisibility,
  onToggleConfirmPasswordVisibility,
  onSignUp,
  onLoginPress,
  onTermsPress,
  onPrivacyPress
}) => {
  const formatTimer = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderErrorMessage = () => {
    if (!viewModel.error) return null;

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{viewModel.error}</Text>
      </View>
    );
  };

  const renderLoadingOverlay = () => {
    if (!viewModel.isLoading) return null;

    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>처리 중...</Text>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/background.png')} 
      style={styles.background}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
          />
          <Text style={styles.title}>회원가입</Text>
        </View>

        {/* Error Message */}
        {renderErrorMessage()}

        {/* Email Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이메일 인증</Text>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Icon name="envelope" size={16} color="#667eea" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="이메일을 입력하세요"
                value={email}
                onChangeText={onEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!viewModel.isLoading && !viewModel.emailVerification?.isVerified}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (!viewModel.canRequestVerification || !email.trim()) && styles.verifyButtonDisabled
              ]}
              onPress={onRequestEmailVerification}
              disabled={!viewModel.canRequestVerification || !email.trim() || viewModel.isLoading}
            >
              <Text style={styles.verifyButtonText}>
                {viewModel.emailVerification?.isVerified ? '인증완료' : '인증요청'}
              </Text>
            </TouchableOpacity>
          </View>

          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          {/* Timer */}
          {viewModel.verificationTimer > 0 && (
            <Text style={styles.timerText}>
              남은 시간: {formatTimer(viewModel.verificationTimer)}
            </Text>
          )}

          {/* Verification Code Input */}
          {!viewModel.emailVerification?.isVerified && viewModel.verificationTimer > 0 && (
            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Icon name="key" size={16} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="인증코드를 입력하세요"
                  value={verificationCode}
                  onChangeText={onVerificationCodeChange}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!viewModel.isLoading}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (!verificationCode.trim()) && styles.verifyButtonDisabled
                ]}
                onPress={onVerifyEmailCode}
                disabled={!verificationCode.trim() || viewModel.isLoading}
              >
                <Text style={styles.verifyButtonText}>인증</Text>
              </TouchableOpacity>
            </View>
          )}

          {codeError ? (
            <Text style={styles.errorText}>{codeError}</Text>
          ) : null}

          {viewModel.emailVerification?.isVerified && (
            <Text style={styles.successText}>✓ 이메일 인증이 완료되었습니다.</Text>
          )}
        </View>

        {/* Nickname Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>닉네임</Text>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Icon name="user" size={16} color="#667eea" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChangeText={onNicknameChange}
                autoCapitalize="none"
                editable={!viewModel.isLoading}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (!nickname.trim() || viewModel.nicknameValidation.isChecking) && styles.verifyButtonDisabled
              ]}
              onPress={onCheckNickname}
              disabled={!nickname.trim() || viewModel.nicknameValidation.isChecking || viewModel.isLoading}
            >
              <Text style={styles.verifyButtonText}>
                {viewModel.nicknameValidation.isChecking ? '확인중...' : '중복확인'}
              </Text>
            </TouchableOpacity>
          </View>

          {viewModel.nicknameValidation.message ? (
            <Text style={[
              styles.messageText,
              { color: viewModel.nicknameValidation.isAvailable ? '#4CAF50' : '#F44336' }
            ]}>
              {viewModel.nicknameValidation.message}
            </Text>
          ) : null}
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>비밀번호</Text>
          
          <View style={styles.inputContainer}>
            <Icon name="lock" size={16} color="#667eea" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChangeText={onPasswordChange}
              secureTextEntry={!isPasswordVisible}
              editable={!viewModel.isLoading}
            />
            <TouchableOpacity onPress={onTogglePasswordVisibility}>
              <Icon 
                name={isPasswordVisible ? "eye" : "eye-slash"} 
                size={16} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={16} color="#667eea" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChangeText={onConfirmPasswordChange}
              secureTextEntry={!isConfirmPasswordVisible}
              editable={!viewModel.isLoading}
            />
            <TouchableOpacity onPress={onToggleConfirmPasswordVisibility}>
              <Icon 
                name={isConfirmPasswordVisible ? "eye" : "eye-slash"} 
                size={16} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>

          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          {/* Password Requirements */}
          {viewModel.passwordValidation.errors.length > 0 && (
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>비밀번호 요구사항:</Text>
              {viewModel.passwordValidation.errors.map((error, index) => (
                <Text key={index} style={styles.requirementItem}>• {error}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>약관 동의</Text>
          
          <View style={styles.agreementContainer}>
            <CheckBox
              value={viewModel.agreements.agreeAll}
              onValueChange={(value) => viewModel.setAllAgreements(value)}
              tintColors={{ true: '#667eea', false: '#999' }}
            />
            <Text style={styles.agreementText}>전체 동의</Text>
          </View>

          <View style={styles.agreementContainer}>
            <CheckBox
              value={viewModel.agreements.agreeAge}
              onValueChange={(value) => viewModel.setAgreement('agreeAge', value)}
              tintColors={{ true: '#667eea', false: '#999' }}
            />
            <Text style={styles.agreementText}>만 14세 이상입니다 (필수)</Text>
          </View>

          <View style={styles.agreementContainer}>
            <CheckBox
              value={viewModel.agreements.agreeTerms}
              onValueChange={(value) => viewModel.setAgreement('agreeTerms', value)}
              tintColors={{ true: '#667eea', false: '#999' }}
            />
            <TouchableOpacity onPress={onTermsPress}>
              <Text style={[styles.agreementText, styles.agreementLink]}>
                이용약관 동의 (필수)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.agreementContainer}>
            <CheckBox
              value={viewModel.agreements.agreePrivacy}
              onValueChange={(value) => viewModel.setAgreement('agreePrivacy', value)}
              tintColors={{ true: '#667eea', false: '#999' }}
            />
            <TouchableOpacity onPress={onPrivacyPress}>
              <Text style={[styles.agreementText, styles.agreementLink]}>
                개인정보 처리방침 동의 (필수)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.agreementContainer}>
            <CheckBox
              value={viewModel.agreements.agreeMarketing}
              onValueChange={(value) => viewModel.setAgreement('agreeMarketing', value)}
              tintColors={{ true: '#667eea', false: '#999' }}
            />
            <Text style={styles.agreementText}>마케팅 정보 수신 동의 (선택)</Text>
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[
            styles.signUpButton,
            (!viewModel.isFormValid || viewModel.isLoading) && styles.signUpButtonDisabled
          ]}
          onPress={onSignUp}
          disabled={!viewModel.isFormValid || viewModel.isLoading}
        >
          <Text style={styles.signUpButtonText}>
            {viewModel.isLoading ? '가입 중...' : '회원가입'}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginPrompt}>이미 계정이 있으신가요?</Text>
          <TouchableOpacity onPress={onLoginPress} disabled={viewModel.isLoading}>
            <Text style={styles.loginLink}>로그인</Text>
          </TouchableOpacity>
        </View>

        {/* Loading Overlay */}
        {renderLoadingOverlay()}
      </ScrollView>
    </ImageBackground>
  );
});

export default SignUpView;