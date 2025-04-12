


import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export default StyleSheet.create({
   
    imageWrapper: {
        width: '100%',
        height: verticalScale(190),
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 20,
        left: 30,
        right: 30,
        bottom: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 1)',
    },
    overlayText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },

    gameCard: {
        width: '45%',
        height: verticalScale(255),
        backgroundColor: '#fff',
        marginVertical: verticalScale(10),
        borderRadius: scale(10),
        elevation: scale(6),
        alignItems: 'center',
        borderWidth: scale(1),
        borderColor: '#000',
    },
    gameImage: {
        width: '90%',
        height: verticalScale(190),
        borderRadius: scale(10),
        borderWidth: scale(1),
        resizeMode: 'cover', // 이미지 전체가 보이도록 설정
        marginBottom: verticalScale(-10), // 음수 값을 제거 또는 양수로 조정
    },
    gameTitle: {
        marginTop: verticalScale(5),
        fontWeight: '900', // Increased font weight for bolder text
        fontSize: scale(20)
    },
    hashtagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(5),
    },
    hashtag: {
        marginHorizontal: scale(3),
        fontSize: scale(12),
        backgroundColor: '#eee',
        padding: scale(2),
        borderRadius: scale(5)
    },

    categoryBorder: {
        height: verticalScale(20),
        width: '40%',
        borderWidth: scale(1),
        borderColor: '#666', // 원하는 색상으로 변경
        borderRadius: scale(5),
        alignItems: 'center',
        marginRight: scale(7),
    },
    hashtagBorder: {
        height: verticalScale(20),
        width: '40%',
        borderWidth: scale(1),
        borderColor: '#666', // 원하는 색상으로 변경
        borderRadius: scale(5),
        alignItems: 'center',
    },
    categoryText: {
        fontSize: scale(12),
        color: '#000',
    },
   
    hashtagText: {
        fontSize: scale(12),
        color: '#000',
    },
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
});
