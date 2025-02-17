import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AuthService } from '../services/AuthService';
import styles from '../styles/SignUpStyles';

const SignUpScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    const handleSignup = async () => {
        if (password !== confirmPassword) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            // const response = await fetch('https://dev-frog-api.jokertrickster.com/v0.1/game/auth/signup', {
            const response = await fetch('http://10.0.2.2:8080/v0.1/game/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, verificationCode }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('회원가입 성공', '로그인 후 이용해주세요!');
            } else {
                Alert.alert('회원가입 실패', data.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            Alert.alert('오류 발생', '네트워크 오류가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>회원가입</Text>
            <TextInput style={styles.input} placeholder="이메일" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="비밀번호" value={password} onChangeText={setPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="비밀번호 확인" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="이름" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="이메일 인증 코드" value={verificationCode} onChangeText={setVerificationCode} />

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>회원가입</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SignUpScreen;
