import React from 'react';
import { observer } from 'mobx-react-lite';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { AuthViewModel } from '../viewModels/AuthViewModel';
import styles from '../../styles/ReactLoginStyles';

interface LoginViewProps {
  viewModel: AuthViewModel;
  email: string;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onLoginPress: () => void;
  onGoogleLoginPress: () => void;
  onSignUpPress: () => void;
  onForgotPasswordPress?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = observer(({
  viewModel,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onLoginPress,
  onGoogleLoginPress,
  onSignUpPress,
  onForgotPasswordPress
}) => {
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
        <Text style={styles.loadingText}>로그인 중...</Text>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/background.png')} 
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
          />
          <Text style={styles.appTitle}>Board Game App</Text>
        </View>

        {/* Error Message */}
        {renderErrorMessage()}

        {/* Login Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Icon name="envelope" size={20} color="#667eea" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor="#999"
              value={email}
              onChangeText={onEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!viewModel.isLoading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#667eea" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor="#999"
              value={password}
              onChangeText={onPasswordChange}
              secureTextEntry
              editable={!viewModel.isLoading}
            />
          </View>

          {/* Forgot Password Link */}
          {onForgotPasswordPress && (
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={onForgotPasswordPress}
              disabled={viewModel.isLoading}
            >
              <Text style={styles.forgotPasswordText}>비밀번호를 잊으셨나요?</Text>
            </TouchableOpacity>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              (viewModel.isLoading || !email.trim() || !password.trim()) && styles.loginButtonDisabled
            ]}
            onPress={onLoginPress}
            disabled={viewModel.isLoading || !email.trim() || !password.trim()}
          >
            <Text style={styles.loginButtonText}>
              {viewModel.isLoading ? '로그인 중...' : '로그인'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Login Button */}
          <View style={styles.googleButtonContainer}>
            <GoogleSigninButton
              style={styles.googleButton}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Light}
              onPress={onGoogleLoginPress}
              disabled={viewModel.isLoading}
            />
          </View>
        </View>

        {/* Sign Up Section */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpPrompt}>계정이 없으신가요?</Text>
          <TouchableOpacity 
            onPress={onSignUpPress}
            disabled={viewModel.isLoading}
          >
            <Text style={styles.signUpLink}>회원가입</Text>
          </TouchableOpacity>
        </View>

        {/* Loading Overlay */}
        {renderLoadingOverlay()}
      </View>
    </ImageBackground>
  );
});

export default LoginView;