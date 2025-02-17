import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // ✅ 네비게이션 추가
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/navigationTypes';
import { AuthService } from '../services/AuthService';
import styles from '../styles/LoginStyles';

// ✅ 네비게이션 타입 정의
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation<LoginScreenNavigationProp>(); // ✅ 네비게이션 추가

    const handleLogin = async () => {
        try {
//            const response = await fetch('https://dev-frog-api.jokertrickster.com/v0.1/game/auth/signin', {
            const response = await fetch('http://10.0.2.2:8080/v0.1/game/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                await AuthService.saveAccessToken(data.accessToken);
                await AuthService.saveUserID(data.userID);    
                console.log('로그인 성공:', data.accessToken);
                navigation.replace('Home'); 
            } else {
                Alert.alert('로그인 실패', data.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            Alert.alert('오류 발생', '네트워크 오류가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>로그인</Text>
            <TextInput style={styles.input} placeholder="이메일" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="비밀번호" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>로그인</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LoginScreen;
