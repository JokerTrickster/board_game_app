import { NavigationContainerRefWithCurrent } from '@react-navigation/native';

export type RootStackParamList = {
    Home: undefined;
    FindIt: undefined;
    SoloFindIt: { gameInfoList: any[] };
    Login: undefined;
    SignUp: undefined;
    FindItGameOver: undefined;
    Password: undefined;
    GameDetail: { game: string };
    Loading: { nextScreen: keyof RootStackParamList }; // 추가: 로딩 페이지
};

// ✅ 네비게이션 참조 타입 추가
export type NavigationRefType = NavigationContainerRefWithCurrent<RootStackParamList> | null;
