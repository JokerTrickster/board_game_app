// src/screens/PasswordScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PasswordService } from '../services/PasswordService';
import styles from '../styles/ReactSignUpStyles';
import { RootStackParamList } from '../navigation/navigationTypes';

type PasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Password'>;

const PasswordScreen: React.FC = () => {
    const navigation = useNavigation<PasswordScreenNavigationProp>();

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isCodeVerified, setIsCodeVerified] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [timer, setTimer] = useState(600);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isEmailSent && timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isEmailSent, timer]);

    const handleRequestCode = async () => {
        try {
            await PasswordService.requestCode(email);
            setIsEmailSent(true);
            setTimer(600);
            Alert.alert('인증코드 전송', '이메일로 인증코드를 보냈습니다.');
        } catch (error: any) {
            Alert.alert('오류', error.message);
        }
    };

    const handleValidateCode = async () => {
        try {
            await PasswordService.validateCode(email, code, password);
            setIsCodeVerified(true);
            Alert.alert('인증 성공', '인증이 완료되었습니다.');
        } catch (error: any) {
            Alert.alert('오류', error.message);
        }
    };

    const handleChangePassword = async () => {
        if (password !== confirmPassword) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            await PasswordService.changePassword(email, password);
            Alert.alert('비밀번호 변경 성공', '변경된 비밀번호로 로그인하세요.');
            navigation.replace('Login');
        } catch (error: any) {
            Alert.alert('오류', error.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="angle-left" size={30} color="black" />
            </TouchableOpacity>

            <Text style={styles.title}>비밀번호 변경하기</Text>

            <View style={styles.inputRow}>
                <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="이메일"
                    value={email}
                    onChangeText={setEmail}
                    editable={!isEmailSent}
                    keyboardType="email-address"
                />
                <TouchableOpacity
                    style={[styles.smallButton, isEmailSent && { backgroundColor: '#ccc' }]}
                    onPress={handleRequestCode}
                    disabled={isEmailSent}>
                    <Text style={styles.smallButtonText}>
                        {isEmailSent ? '전송 완료' : '인증코드 요청'}
                    </Text>
                </TouchableOpacity>
            </View>

            {isEmailSent && !isCodeVerified && (
                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="인증코드"
                        value={code}
                        onChangeText={setCode}
                    />
                    <Text style={{ marginHorizontal: 10, fontSize: 14 }}>
                        {`${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}
                    </Text>
                    <TouchableOpacity style={styles.smallButton} onPress={handleValidateCode}>
                        <Text style={styles.smallButtonText}>인증 확인</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isCodeVerified && (
                <>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="새 비밀번호"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!isPasswordVisible}
                        />
                        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                            <Icon
                                name={isPasswordVisible ? 'eye' : 'eye-slash'}
                                size={20}
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="비밀번호 재확인"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!isConfirmPasswordVisible}
                        />
                        <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                            <Icon
                                name={isConfirmPasswordVisible ? 'eye' : 'eye-slash'}
                                size={20}
                                style={styles.icon}
                            />
                        </TouchableOpacity>
                    </View>

                    {password !== confirmPassword && confirmPassword !== '' && (
                        <Text style={{ color: 'red', fontSize: 12 }}>
                            비밀번호가 일치하지 않습니다.
                        </Text>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.signupButton,
                            {
                                backgroundColor:
                                    password && confirmPassword && password === confirmPassword
                                        ? '#AFDCEC'
                                        : '#ccc',
                            },
                        ]}
                        onPress={handleChangePassword}
                        disabled={!password || !confirmPassword || password !== confirmPassword}>
                        <Text style={styles.signupButtonText}>변경 완료</Text>
                    </TouchableOpacity>
                </>
            )}
        </ScrollView>
    );
};

export default PasswordScreen;
