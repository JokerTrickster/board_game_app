// src/services/LoginService.ts
import { AuthService } from './AuthService';

// const API_BASE_URL = 'http://10.0.2.2:8080/v0.1/game/auth';
const API_BASE_URL = 'https://dev-frog-api.jokertrickster.com';

export class LoginService {
    static async login(email: string, password: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/v0.1/game/auth/signin`, {
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

    static async googleLogin(idToken: string) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/v0.1/game/auth/google/callback?IDToken=${encodeURIComponent(idToken)}`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                },
            );

            const data = await response.json();
            console.log(data);
            if (response.ok) {
                await AuthService.saveUserID(data.userID);
                await AuthService.saveAccessToken(data.accessToken);
                await AuthService.saveRefreshToken(data.refreshToken);
                return { success: true };
            } else {
                return {
                    success: false,
                    message: data.message || '구글 로그인 처리에 실패했습니다.',
                };
            }
        } catch (error) {
            return { success: false, message: '네트워크 오류가 발생했습니다.' };
        }
    }
    static async fetchUserData(userID: number) {
        try {
            const accessToken = await AuthService.getAccessToken();
            if (!accessToken) {
                return { success: false, message: '액세스 토큰이 없습니다.' };
            }

            const headers = {
                'Content-Type': 'application/json',
                tkn: accessToken, // ✅ tkn 헤더 추가
            };

            const [userResponse, profileResponse, profileListResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/v0.1/game/users/${userID}`, { headers }),
                fetch(`${API_BASE_URL}/v0.1/game/users/profiles`, { headers }),
                fetch(`${API_BASE_URL}/v0.1/game/profiles`, { headers }),
            ]);

            if (!userResponse.ok || !profileResponse.ok || !profileListResponse.ok) {
                return { success: false, message: '유저 정보를 불러오는 데 실패했습니다.' };
            }

            const userData = await userResponse.json();
            const userProfiles = await profileResponse.json();
            const profileList = await profileListResponse.json();

            return {
                success: true,
                user: userData,
                profileImage:  profileList.profiles[0].image ,
            };
        } catch (error) {
            return { success: false, message: '유저 데이터를 불러오는 중 오류가 발생했습니다.' };
        }
    }
}
