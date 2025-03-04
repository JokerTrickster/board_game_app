
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput,Image, ImageBackground, TouchableOpacity, Alert, ScrollView, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/navigationTypes';
import { SignUpService } from '../services/SignUpService';
import CheckBox from '@react-native-community/checkbox';
import styles from '../styles/SignUpStyles';

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen: React.FC = () => {
    const navigation = useNavigation<SignUpScreenNavigationProp>();

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    const [verificationCode, setVerificationCode] = useState('');
    const [codeError, setCodeError] = useState('');

    const [nickname, setNickname] = useState('');
    const [nicknameMessage, setNicknameMessage] = useState('');
    const [nicknameMessageColor, setNicknameMessageColor] = useState('red');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const [agreeAll, setAgreeAll] = useState(false);
    const [agreeAge, setAgreeAge] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeMarketing, setAgreeMarketing] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [timer, setTimer] = useState(600); // 10분 타이머 (초 단위)
    const [canRequestCode, setCanRequestCode] = useState(true);
    const [requestCooldown, setRequestCooldown] = useState(0); // 5분 요청 제한 타이머

    const isFormValid =
        isEmailVerified &&
        nicknameMessageColor === 'blue' &&
        password &&
        confirmPassword &&
        password === confirmPassword &&
        agreeAge &&
        agreeTerms &&
        agreePrivacy;

    

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0 && !canRequestCode) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer, canRequestCode]);
    useEffect(() => {
        let cooldownInterval: NodeJS.Timeout;
        if (requestCooldown > 0) {
            cooldownInterval = setInterval(() => setRequestCooldown(prev => prev - 1), 1000);
        } else if (requestCooldown === 0) {
            setCanRequestCode(true);
        }
        return () => clearInterval(cooldownInterval);
    }, [requestCooldown]);

    useEffect(() => {
        if (confirmPassword && password !== confirmPassword) {
            setPasswordError('비밀번호가 동일하지 않습니다. 다시 확인해주세요.');
        } else {
            setPasswordError('');
        }
    }, [password, confirmPassword]);
    // 필수 약관 동의 상태 변경 시 전체 동의 체크박스 상태를 동기화
    useEffect(() => {
        const allChecked = agreeAge && agreeTerms && agreePrivacy && agreeMarketing;
        if (agreeAll !== allChecked) {
            setAgreeAll(allChecked);
        }
    }, [agreeAge, agreeTerms, agreePrivacy, agreeMarketing]);

    
    const handleEmailCodeValidation = async () => {
        setCodeError('');
        try {
            await SignUpService.verifyEmailCode(email, verificationCode);
            setIsEmailVerified(true);
            setTimer(0);  // 타이머 초기화하여 타이머 숨기기
            setCanRequestCode(false);  // 인증 요청 버튼 비활성화 유지
            setRequestCooldown(0);  // 요청 쿨다운 초기화
            Alert.alert('인증 성공', '이메일 인증이 완료되었습니다.');
        } catch (error: any) {
            setCodeError(error.message);
        }
    };
    const handleEmailVerificationRequest = async () => {
        if (!canRequestCode) {
            Alert.alert('잠시 기다려주세요.', '5분 후에 다시 요청할 수 있습니다.');
            return;
        }

        setEmailError('');
        try {
            await SignUpService.requestEmailVerification(email);
            Alert.alert('인증코드 발송', '이메일로 인증코드가 전송되었습니다.');

            setTimer(600); // 타이머 10분 재설정
            setCanRequestCode(false); // 요청 불가능 상태로 변경
            setRequestCooldown(300); // 5분 요청 제한 시작
        } catch (error: any) {
            setEmailError(error.message);
        }
    };

    const handleNicknameCheck = async () => {
        const result = await SignUpService.checkNickname(nickname);
        setNicknameMessage(result.message);
        setNicknameMessageColor(result.isAvailable ? 'blue' : 'red');
    };

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!(agreeAge && agreeTerms && agreePrivacy)) {
            Alert.alert('오류', '필수 약관에 모두 동의해야 합니다.');
            return;
        }

        try {
            await SignUpService.signUp(email, nickname, password, verificationCode);
            Alert.alert('회원가입 성공', '로그인 후 이용해주세요!');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('회원가입 실패', error.message);
        }
    };
    const toggleAgreeAll = (newValue: boolean) => {
        setAgreeAll(newValue);
        setAgreeAge(newValue);
        setAgreeTerms(newValue);
        setAgreePrivacy(newValue);
        setAgreeMarketing(newValue);
    };

    const handleAgreeAge = (value: boolean) => setAgreeAge(value);
    const handleAgreeTerms = (value: boolean) => setAgreeTerms(value);
    const handleAgreePrivacy = (value: boolean) => setAgreePrivacy(value);
    const handleAgreeMarketing = (value: boolean) => setAgreeMarketing(value);
    return (
        <ImageBackground
            source={require('../assets/images/signup/background.png')}
            style={styles.background}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="angle-left" size={50} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.title}>회원가입</Text>
                </View>

                {/* 이메일 입력 (아이콘 포함) */}
                <View style={styles.inputRow}>
                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                        <Image
                            source={require('../assets/icons/signup/email.png')}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="이메일"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.smallButton,
                            (!canRequestCode || isEmailVerified) && { backgroundColor: '#ccc' },
                        ]}
                        onPress={handleEmailVerificationRequest}
                        disabled={!canRequestCode || isEmailVerified}
                    >
                        <Text style={styles.smallButtonText}>
                            {isEmailVerified
                                ? '인증 완료'
                                : canRequestCode
                                    ? '인증 요청'
                                    : `요청 대기 (${Math.floor(requestCooldown / 60)}:${(requestCooldown % 60)
                                        .toString()
                                        .padStart(2, '0')})`}
                        </Text>
                    </TouchableOpacity>
                </View>
                {emailError ? <Text style={{ color: 'red', fontSize: 12 }}>{emailError}</Text> : null}

                {/* 인증 코드 입력 (아이콘 포함) */}
                <View style={styles.inputRow}>
                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                        <Image
                            source={require('../assets/icons/signup/authcode.png')}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="인증 코드"
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                        />
                    </View>
                    {!isEmailVerified && (
                        <Text style={{ marginHorizontal: 10, fontSize: 14 }}>
                            {Math.floor(timer / 60)
                                .toString()
                                .padStart(2, '0')}
                            :
                            {(timer % 60).toString().padStart(2, '0')}
                        </Text>
                    )}
                    <TouchableOpacity
                        style={[
                            styles.smallButton,
                            isEmailVerified && { backgroundColor: '#ccc' },
                        ]}
                        onPress={handleEmailCodeValidation}
                        disabled={isEmailVerified}
                    >
                        <Text style={styles.smallButtonText}>
                            {isEmailVerified ? '인증 완료' : '인증 확인'}
                        </Text>
                    </TouchableOpacity>
                </View>
                {codeError ? <Text style={{ color: 'red', fontSize: 12 }}>{codeError}</Text> : null}

                {/* 닉네임 입력 (아이콘 포함) */}
                <View style={styles.inputRow}>
                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                        <Image
                            source={require('../assets/icons/signup/name.png')}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="닉네임"
                            value={nickname}
                            onChangeText={setNickname}
                        />
                    </View>
                    <TouchableOpacity style={styles.smallButton} onPress={handleNicknameCheck}>
                        <Text style={styles.smallButtonText}>중복 확인</Text>
                    </TouchableOpacity>
                </View>
                {nicknameMessage ? (
                    <Text style={{ color: nicknameMessageColor, fontSize: 12 }}>
                        {nicknameMessage}
                    </Text>
                ) : null}

                {/* 비밀번호 입력 (아이콘 + 오른쪽 토글 버튼) */}
                <View style={styles.inputRow}>
                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                        <Image
                            source={require('../assets/icons/signup/password.png')}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="비밀번호"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!isPasswordVisible}
                        />
                    </View>
                    <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)} style={styles.eyeButton}>
                        <Icon
                            name={isPasswordVisible ? 'eye' : 'eye-slash'}
                            size={20}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                </View>

                {/* 비밀번호 재확인 입력 (아이콘 + 오른쪽 토글 버튼) */}
                <View style={styles.inputRow}>
                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                        <Image
                            source={require('../assets/icons/signup/password.png')}
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="비밀번호 재확인"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!isConfirmPasswordVisible}
                        />
                    </View>
                    <TouchableOpacity onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeButton}>
                        <Icon
                            name={isConfirmPasswordVisible ? 'eye' : 'eye-slash'}
                            size={20}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                </View>
                {passwordError ? (
                    <Text style = {styles.passwordError}>{passwordError}</Text>
                ) : null}

                {/* 약관 동의 및 기타 항목들 */}
                <View style={styles.checkboxRow}>
                    <TouchableOpacity onPress={() => toggleAgreeAll(!agreeAll)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 ,marginTop:40}}>
                        <Icon
                            name={agreeAll ? 'check-square' : 'square-o'}
                            size={24}
                            color={agreeAll ? '#5C9EFF' : '#aaa'}
                        />
                        <Text style={styles.checkboxText}>약관에 모두 동의</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.checkboxRow}>
                    <TouchableOpacity onPress={() => handleAgreeAge(!agreeAge)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft:10 }}>
                        <Icon
                            name={agreeAge ? 'check-square' : 'square-o'}
                            size={24}
                            color={agreeAge ? '#5C9EFF' : '#aaa'}
                        />
                        <Text style={styles.checkboxText}>만 14세 이상입니다 (필수)</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.checkboxRow}>
                    <TouchableOpacity onPress={() => handleAgreeTerms(!agreeTerms)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                        <Icon
                            name={agreeTerms ? 'check-square' : 'square-o'}
                            size={24}
                            color={agreeTerms ? '#5C9EFF' : '#aaa'}
                        />
                        <Text style={styles.checkboxText}>서비스 이용약관 동의 (필수)</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.notion.so/10d2c71ec7c580e1bba8c16dd448a94b?pvs=4')}>
                            <Text style={styles.linkText}>보기</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>

                <View style={styles.checkboxRow}>
                    <TouchableOpacity onPress={() => handleAgreePrivacy(!agreePrivacy)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                        <Icon
                            name={agreePrivacy ? 'check-square' : 'square-o'}
                            size={24}
                            color={agreePrivacy ? '#5C9EFF' : '#aaa'}
                        />
                        <Text style={styles.checkboxText}>개인정보 수집 및 이용 동의 (필수)</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.notion.so/10d2c71ec7c580e1bba8c16dd448a94b?pvs=4')}>
                            <Text style={styles.linkText}>보기</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>

                <View style={styles.checkboxRow}>
                    <TouchableOpacity onPress={() => handleAgreeMarketing(!agreeMarketing)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                        <Icon
                            name={agreeMarketing ? 'check-square' : 'square-o'}
                            size={24}
                            color={agreeMarketing ? '#5C9EFF' : '#aaa'}
                        />
                        <Text style={styles.checkboxText}>마케팅 수신 동의 (선택)</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.notion.so/10d2c71ec7c580e1bba8c16dd448a94b?pvs=4')}>
                            <Text style={styles.linkText}>보기</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[
                        styles.signupButton,
                        { backgroundColor: isFormValid ? '#FAC0BE' : '#ccc' },
                    ]}
                    onPress={handleSignUp}
                    disabled={!isFormValid}
                >
                    <Text style={styles.signupButtonText}>가입 완료</Text>
                </TouchableOpacity>
            </ScrollView>
        </ImageBackground>
    );
};

export default SignUpScreen;