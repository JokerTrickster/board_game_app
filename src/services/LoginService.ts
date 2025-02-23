// src/services/LoginService.ts
import { AuthService } from './AuthService';

const API_BASE_URL = 'http://10.0.2.2:8080/v0.1/game/auth';

export class LoginService {
    static async login(email: string, password: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                await AuthService.saveAccessToken(data.accessToken);
                await AuthService.saveUserID(data.userID);
                return { success: true };
            } else {
                return {
                    success: false,
                    message: data.message || '이메일 또는 비밀번호가 올바르지 않습니다.',
                };
            }
        } catch (error) {
            return { success: false, message: '네트워크 오류가 발생했습니다.' };
        }
    }

    static async googleLogin(userInfo: any) {
        // TODO: 서버와 연동하여 추가 처리 로직 구현
        return userInfo;
    }
}
