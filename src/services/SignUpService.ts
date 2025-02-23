// src/services/SignUpService.ts
const API_BASE_URL = 'http://10.0.2.2:8080/v0.1/game/auth';

export class SignUpService {
    static async requestEmailVerification(email: string) {
        const response = await fetch(`${API_BASE_URL}/signup/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || '이메일이 존재합니다.');
        }

        return response.json();
    }

    static async verifyEmailCode(email: string, code: string) {
        const response = await fetch(`${API_BASE_URL}/signup/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || '인증코드가 잘못됐습니다. 다시 확인해주세요.');
        }

        return response.json();
    }

    static async checkNickname(name: string) {
        const response = await fetch(`${API_BASE_URL}/name/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });

        if (response.status === 204) {
            // 닉네임 중복 없음 (No Content)
            return {
                isAvailable: true,
                message: '사용할 수 있는 닉네임입니다.',
            };
        } else {
            // 닉네임 중복됨 또는 에러 발생
            const data = await response.json();
            return {
                isAvailable: false,
                message: data.message || '이미 사용 중인 닉네임입니다.',
            };
        }
    }


    static async signUp(email: string, name: string, password: string, authCode: string) {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password, authCode }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || '입력한 정보를 다시 확인해주세요.');
        }

        return response.json();
    }
}
