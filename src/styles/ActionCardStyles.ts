import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    actionCardBackground: {
        width: '100%',
        height: 180,  // 배경 높이
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 3,
        overflow: 'visible',  // 배경을 넘어선 자식들도 보이도록
    },
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        height: '100%',
        overflow: 'visible',
    },
    podiumItem: {
        alignItems: 'center',
        width: '30%',
        padding: 5,
        borderRadius: 10,
        height: 145,  // 2등, 3등 기본 높이
        overflow: 'visible',
        marginTop:30,
    },
    firstPlace: {
        height: 160,  // 1등은 기본보다 더 높게
        transform: [{ scale: 1.1 }],
        zIndex: 1,
        marginTop:10,
    },
    rankText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        borderWidth: 2.5,
        marginTop:25,
    },
    nickname: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 30,
        zIndex: 2,
    },
    firstNickname: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 43,
        zIndex: 2,
    },
    rankImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginBottom: 5,
    },
    profileImageContainer: {
        position: 'relative',
        zIndex: 1,
    },
    rankBadge: {
        position: 'absolute',
        top: 0,   // 프로필 이미지의 왼쪽 상단에 겹치도록 조정
        left: -20,
        width: 40,
        height: 40,
        resizeMode: 'contain',
        zIndex: 3,  // 텍스트보다 위에 표시
    },
});
