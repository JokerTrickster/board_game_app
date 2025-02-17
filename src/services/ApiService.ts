import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_BASE_URL = 'https://dev-frog-api.jokertrickster.com/v0.1/game';
const API_BASE_URL = 'http://10.0.2.2:8080/v0.1/game'; // ✅ API_BASE_URL 수정
export const ApiService = {
    request: async (endpoint: string, method: string = 'GET', body: any = null) => {
        const token = await AsyncStorage.getItem('access_token');
        const headers: HeadersInit_ = {
            'Content-Type': 'application/json',
            ...(token && { tkn: token }), // ✅ `tkn` 헤더 추가
        };

        const options: RequestInit = {
            method,
            headers,
            ...(body && { body: JSON.stringify(body) }),
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            return await response.json();
        } catch (error) {
            console.error(`API 요청 실패 (${endpoint}):`, error);
            return null;
        }
    },
};
