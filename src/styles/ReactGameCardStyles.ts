


import { StyleSheet } from 'react-native';
import { responsive, ASPECT_RATIOS } from '../utils';

export default StyleSheet.create({

    imageWrapper: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: ASPECT_RATIOS.PHOTO,
    },
    overlay: {
        position: 'absolute',
        top: '10%',
        left: '15%',
        right: '15%',
        bottom: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 1)',
    },
    overlayText: {
        color: '#000',
        fontSize: responsive.font(18),
        fontWeight: 'bold',
    },

    gameCard: {
        width: '45%',
        backgroundColor: '#fff',
        marginVertical: responsive.verticalScale(10),
        borderRadius: responsive.borderRadius(10),
        padding: responsive.scale(5),
        elevation: responsive.elevation(6),
        alignItems: 'center',
        borderWidth: responsive.scale(1),
        borderColor: '#000',
        aspectRatio: ASPECT_RATIOS.CARD,
    },
    gameImage: {
        width: '90%',
        height: verticalScale(190),
        borderRadius: scale(10),
        borderWidth: scale(1),
        resizeMode: 'contain', // 이미지 전체가 보이도록 설정
        marginBottom: verticalScale(-10), // 음수 값을 제거 또는 양수로 조정
    },
    gameTitle: {
        marginTop: verticalScale(5),
        fontWeight: 'bold',
        fontSize: scale(20),
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
        borderRadius: scale(5),
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
