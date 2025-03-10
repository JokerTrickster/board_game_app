// services/FindItService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

class FindItService {
    /**
     * 혼자하기 API를 호출하여, solo-play 게임 정보를 받아옵니다.
     * @param round 기본값 0, 시작 라운드를 지정합니다.
     * @returns Promise resolving to gameInfoList (이미지 10개 정보 배열)
     */
    async fetchSoloPlayGameInfo(round: number = 10): Promise<any[]> {
        // 액세스 토큰을 AsyncStorage에서 가져옵니다.
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Access token not found');
        }
        try {
            const response = await fetch(`${API_BASE_URL}/find-it/v0.1/game/solo-play`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'tkn': token,
                },
                body: JSON.stringify({ round }),
            });
            if (!response.ok) {
                throw new Error(`서버 요청 실패: ${response.status}`);
            }
            const data = await response.json();
            if (!data.gameInfoList) {
                throw new Error('Invalid response from server');
            }
            return data.gameInfoList;
        } catch (error) {
            throw error;
        }
    }
}

export const findItService = new FindItService();

