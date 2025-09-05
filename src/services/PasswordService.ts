import { API_BASE_URL } from '../config';
// src/services/PasswordService.ts

export class PasswordService {
    static async requestCode(email: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/v0.1/game/auth/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('인증 코드 요청 중 오류가 발생했습니다.');
        }
    }

    static async validateCode(email: string, code: string, password: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/v0.1/game/auth/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('인증 코드 검증 중 오류가 발생했습니다.');
        }
    }

    static async changePassword(email: string, password: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/v0.1/game/auth/change`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('비밀번호 변경 중 오류가 발생했습니다.');
        }
    }
}
