// ItemBar.styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
// 기준 해상도 (디자인 시안에 맞게 설정)
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export default StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        backgroundColor: '#f2f2f2',
    },
    groupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: scale(20),
        marginRight: scale(20),
    },
    itemContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: scale(10),
    },
    iconWrapper: {
        position: 'relative',
    },
    icon: {
        width: scale(35),
        height: scale(35),
        resizeMode: 'contain',
    },
    countBadge: {
        position: 'absolute',
        bottom: verticalScale(1),
        right: scale(0),
        color: '#fff',
        fontSize: scale(12),
        paddingHorizontal: scale(4),
        paddingVertical: verticalScale(1),
        borderRadius: scale(8),
        overflow: 'hidden',
        fontWeight: 'bold',
    },
    itemLabel: {
        fontSize: scale(12),
        color: '#000',
    },
});
