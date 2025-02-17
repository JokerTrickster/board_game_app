import { NavigationContainerRefWithCurrent } from '@react-navigation/native';

export type RootStackParamList = {
    Home: undefined;
    FindIt: undefined;
    GameOver: undefined;
    Login: undefined;
    SignUp: undefined;
    EmailVerification: { email: string }; // ✅ 이메일 인증 시 이메일 값 전달
};

// ✅ 네비게이션 참조 타입 추가
export type NavigationRefType = NavigationContainerRefWithCurrent<RootStackParamList> | null;
