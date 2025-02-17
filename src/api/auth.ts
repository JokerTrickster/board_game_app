import { Alert } from 'react-native';

// const BASE_URL = 'https://dev-frog-api.jokertrickster.com/v0.1/game/auth';
const BASE_URL = 'http://10.0.2.2:8080/v0.1/game/auth'; // ✅ BASE_URL 수정
/** 로그인 요청 */
export const signIn = async (email: string, password: string) => {
    try {
        const response = await fetch(`${BASE_URL}/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || '로그인 실패');
        return data;
    } catch (error: any) {
        Alert.alert('로그인 실패', error.message);
        return null;
    }
};

/** 회원가입 요청 */
export const signUp = async (email: string, password: string, name: string, verificationCode: string) => {
    try {
        const response = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, verificationCode })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || '회원가입 실패');
        return data;
    } catch (error: any) {
        Alert.alert('회원가입 실패', error.message);
        return null;
    }
};

/** 이메일 인증 코드 요청 */
export const requestEmailVerification = async (email: string) => {
    try {
        const response = await fetch(`${BASE_URL}/signup/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || '이메일 인증 요청 실패');
        return data;
    } catch (error: any) {
        Alert.alert('이메일 인증 요청 실패', error.message);
        return null;
    }
};
