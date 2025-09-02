import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ID_KEY = 'userID';
export const AuthService = {
    // ✅ 액세스 토큰 저장
    saveAccessToken: async (token: string) => {
        try {
            await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
        } catch (error) {
            console.error('액세스 토큰 저장 실패:', error);
        }
    },

    // ✅ 액세스 토큰 가져오기
    getAccessToken: async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        } catch (error) {
            console.error('액세스 토큰 가져오기 실패:', error);
            return null;
        }
    },

    // ✅ 리프레시 토큰 저장
    saveRefreshToken: async (token: string) => {
        try {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
        } catch (error) {
            console.error('리프레시 토큰 저장 실패:', error);
        }
    },

    // ✅ 리프레시 토큰 가져오기
    getRefreshToken: async (): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        } catch (error) {
            console.error('리프레시 토큰 가져오기 실패:', error);
            return null;
        }
    },

    // ✅ userID 저장
    saveUserID: async (userID: number) => {
        try {
            await AsyncStorage.setItem(USER_ID_KEY, String(userID));
        } catch (error) {
            console.error('유저 ID 저장 실패:', error);
        }
    },

    // ✅ userID 가져오기
    getUserID: async (): Promise<number | null> => {
        try {
            const userID = await AsyncStorage.getItem(USER_ID_KEY);
            return userID ? parseInt(userID, 10) : null;
        } catch (error) {
            console.error('유저 ID 가져오기 실패:', error);
            return null;
        }
    },

    // ✅ 로그아웃 (모든 토큰, 유저 ID 삭제)
    logout: async () => {
        try {
            await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
            await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
            await AsyncStorage.removeItem(USER_ID_KEY);
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    }
};
