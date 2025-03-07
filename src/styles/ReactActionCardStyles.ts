import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export default StyleSheet.create({
    actionCardBackground: {
        width: '100%',
        height: verticalScale(150),  // 반응형 배경 높이
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(3),
        overflow: 'visible',  // 자식 요소가 배경을 넘어도 보이도록
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
        padding: scale(5),
        borderRadius: scale(10),
        height: verticalScale(120),  // 2등, 3등 기본 높이
        overflow: 'visible',
        marginTop: verticalScale(15),
    },
    firstPlace: {
        height: verticalScale(120),  // 1등은 기본보다 더 높게
        transform: [{ scale: 1.1 }],
        zIndex: 1,
        marginTop: verticalScale(0),
    },
    profileImage: {
        width: scale(60),
        height: verticalScale(50),
        borderRadius: scale(10),
        borderWidth: scale(2.5),
        marginTop: verticalScale(30),
    },
    nickname: {
        fontSize: scale(14),
        fontWeight: '600',
        marginTop: verticalScale(25),
        zIndex: 2,
    },
    firstNickname: {
        fontSize: scale(14),
        fontWeight: '600',
        marginTop: verticalScale(33),
        zIndex: 2,
    },
    rankImage: {
        width: scale(40),
        height: verticalScale(40),
        resizeMode: 'contain',
        marginBottom: scale(5),
    },
    profileImageContainer: {
        position: 'relative',
        zIndex: 1,
    },
    rankBadge: {
        position: 'absolute',
        top: scale(10),   // 프로필 이미지의 왼쪽 상단에 겹치도록 조정
        left: scale(-20),
        width: scale(40),
        height: verticalScale(40),
        resizeMode: 'contain',
        zIndex: 3,  // 텍스트보다 위에 표시
    },
});
