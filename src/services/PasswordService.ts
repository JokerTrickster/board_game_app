// src/services/PasswordService.ts
// const API_BASE_URL = 'http://10.0.2.2:8080/v0.1/game/auth/password';
const API_BASE_URL = 'https://dev-frog-api.jokertrickster.com/v0.1/game/auth';

export class PasswordService {
    static async requestCode(email: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            return await response.json();
        } catch (error) {
            throw new Error('인증 코드 요청 중 오류가 발생했습니다.');
        }
    }

    static async validateCode(email: string, code: string, password: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, password }),
            });
            return await response.json();
        } catch (error) {
            throw new Error('인증 코드 검증 중 오류가 발생했습니다.');
        }
    }

    static async changePassword(email: string, password: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/change`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            return await response.json();
        } catch (error) {
            throw new Error('비밀번호 변경 중 오류가 발생했습니다.');
        }
    }
}
