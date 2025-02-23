import { NavigationContainerRefWithCurrent } from '@react-navigation/native';

export type RootStackParamList = {
    Home: undefined;
    FindIt: undefined;
    Login: undefined;
    SignUp: undefined;
    FindItGameOver: undefined;
};

// ✅ 네비게이션 참조 타입 추가
export type NavigationRefType = NavigationContainerRefWithCurrent<RootStackParamList> | null;
