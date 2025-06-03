// services/SlimeWarService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../config';

class SequenceService {

    /**
     * 혼자하기 시작 전에 코인을 차감하는 API 호출 함수
     * @param coin 차감할 코인 수 (기본값 1)
     * @returns Promise resolving to API 응답 결과
     */
    async deductCoin(coin: number = 100): Promise<any> {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Access token not found');
        }
        try {
            const response = await fetch(`${API_BASE_URL}/board-game/v0.1/game/coin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'tkn': token,
                },
                body: JSON.stringify({ coin }),
            });
            if (!response.ok) {
                throw new Error(`서버 요청 실패: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    /**
     * 랭킹 정보를 가져오는 함수
     * @returns Promise resolving to rankUserList 배열
     */
    async fetchRankings(): Promise<any[]> {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Access token not found');
        }
        try {
            console.log("api base url   ", API_BASE_URL);
            const response = await fetch(`${API_BASE_URL}/sequence/v0.1/game/rank`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'tkn': token,
                },
            });
            if (!response.ok) {
                throw new Error(`서버 요청 실패: ${response.status}`);
            }
            const data = await response.json();
            if (!data.rankUserList) {
                throw new Error('Invalid response from server');
            }
            return data.rankUserList;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 비밀번호 확인 API를 호출하여 게임 참가 가능 여부를 확인합니다.
     * @param password 확인할 비밀번호
     * @returns Promise resolving to boolean (비밀번호 유효 여부)
     */
    async verifyPassword(password: string): Promise<boolean> {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Access token not found');
        }
        try {
            const response = await fetch(`${API_BASE_URL}/sequence/v0.1/game/join/password-check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'tkn': token,
                },
                body: JSON.stringify({ password }),
            });
            if (!response.ok) {
                throw new Error(`서버 요청 실패: ${response.status}`);
            }
            const data = await response.json();
            return data === true;
        } catch (error) {
            console.error('비밀번호 확인 중 오류 발생:', error);
            return false;
        }
    }


    /**
     * 시퀀스 게임 결과를 가져오는 함수
     * @returns Promise resolving to result 배열 (각 원소: { score, userID })
     */
    async fetchGameResult(roomID: number): Promise<Array<{ score: number; userID: number }>> {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Access token not found');
        }
        try {
            const response = await fetch(`${API_BASE_URL}/sequence/v0.1/game/result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'tkn': token,
                },
                body: JSON.stringify({ roomID: roomID }),
            });
            if (!response.ok) {
                throw new Error(`서버 요청 실패: ${response.status}`);
            }
            const data = await response.json();
            if (!data.result) {
                throw new Error('Invalid response from server');
            }
            return data.result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 시퀀스 게임 종료 API 호출
     * @param winner 승리 여부 (true: 승리, false: 패배)
     * @param roomID 방 번호
     * @returns Promise<boolean> 성공 시 true 반환
     */
    async sendGameOver(winner: boolean, roomID: number): Promise<boolean> {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Access token not found');
        }
        try {
            const response = await fetch(`${API_BASE_URL}/board-game/v0.1/game-over`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'tkn': token,
                },
                body: JSON.stringify({
                    winner,
                    gameType: 2,
                    roomID,
                }),
            });
            if (!response.ok) {
                throw new Error(`서버 요청 실패: ${response.status}`);
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    async sendGameOverResult(roomId: number, userId: number, score: number, result: number): Promise<void> {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Access token not found');
        }
        try {
            const response = await fetch(`${API_BASE_URL}/board-game/v0.1/game-over`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'tkn': token,
                },
                body: JSON.stringify({
                    gameType: 3,
                    roomID: roomId,
                    userID: userId,
                    score: score,
                    result: result
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send game over result');
            }
        } catch (error) {
            console.error('Error sending game over result:', error);
            throw error;
        }
    }
}

export const sequenceService = new SequenceService();

