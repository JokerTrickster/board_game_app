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
    Loading: { nextScreen: keyof RootStackParamList; params?: any }; // params를 선택적으로 추가
    SoloFindItResult: undefined;
    MultiFindItResult: undefined;  
};

// ✅ 네비게이션 참조 타입 추가
export type NavigationRefType = NavigationContainerRefWithCurrent<RootStackParamList> | null;
