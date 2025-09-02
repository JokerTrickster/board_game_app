import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground,Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/navigationTypes';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { LoginService } from '../services/LoginService';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/ReactLoginStyles';
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        // 입력 값 검증
        if (!email.trim()) {
            Alert.alert('입력 오류', '이메일을 입력해주세요.');
            return;
        }
        
        if (!password.trim()) {
            Alert.alert('입력 오류', '비밀번호를 입력해주세요.');
            return;
        }
        
        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('입력 오류', '올바른 이메일 형식을 입력해주세요.');
            return;
        }
        
        const result = await LoginService.login(email, password);
        if (result.success) {
            navigation.replace('Home');
        } else {
            Alert.alert('로그인 실패', result.message);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const response = await GoogleSignin.signIn();

            if (!response.data || !response.data.serverAuthCode) {
                Alert.alert('구글 로그인 실패', '로그인 정보를 가져오는 데 실패했습니다.');
                return;
            }

            const serverResponse = await LoginService.googleLogin(response.data.serverAuthCode);

            if (serverResponse.success) {
                navigation.replace('Home');
            } else {
                Alert.alert('구글 로그인 실패', serverResponse.message);
            }
        } catch (error) {
            console.error('구글 로그인 에러:', error);
            Alert.alert('구글 로그인 실패', '다시 시도해 주세요.');
        }
    };



    return (
        <ImageBackground
            source={require('../assets/images/common/background_couple.png')}
            style={styles.background}  // 아래에서 background 스타일을 추가합니다.
        >
        <View style={styles.container}>
                {/* 구글 로그인 버튼 */}
                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                    <Image
                        source={require('../assets/icons/login/login_google.png')}
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.googleButtonText}>구글 로그인</Text>
                </TouchableOpacity>

            <View style={styles.orContainer}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.orLine} />
            </View>
      
                <View style={styles.inputWrapper}>
                    <Image
                        source={require('../assets/icons/login/login_email.png')}
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="이메일 입력"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <Image
                        source={require('../assets/icons/login/login_password.png')}
                        style={styles.inputIcon}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="비밀번호 입력"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>로그인</Text>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.signupText}>회원가입</Text>
                </TouchableOpacity>

                <Text style={styles.separator}>|</Text>

                <TouchableOpacity onPress={() => navigation.navigate('Password')}>
                    <Text style={styles.forgotPasswordText}>비밀번호 찾기</Text>
                </TouchableOpacity>
            </View>
            </View>
        </ImageBackground>
    );
};

export default LoginScreen;
