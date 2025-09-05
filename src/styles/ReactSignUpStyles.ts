import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;


// 가로 및 세로에 따른 스케일 함수
const scale = (size:number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export default StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: scale(20),
        marginBottom: verticalScale(40),
        marginTop: verticalScale(40),
    },
    backButton: {
        marginRight: scale(100),
    },
    title: {
        fontSize: scale(28),
        fontWeight: 'bold',
    },
    container: {
        padding: scale(20),
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: scale(1),
        borderColor: '#000',
        marginBottom: verticalScale(5),
        marginTop: verticalScale(15),
    },
    smallButton: {
        paddingLeft: scale(15),
        paddingRight: scale(15),
        paddingTop: verticalScale(3),
        paddingBottom: verticalScale(3),
        backgroundColor: 'white',
        borderRadius: scale(30),
        borderWidth: scale(1),
        borderColor: '#000',
    },
    smallButtonText: {
        fontSize: scale(14),
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: verticalScale(3),
    },
    checkboxText: {
        flex: 1,
        fontSize: scale(14),
        marginLeft: scale(10),
    },
    linkText: {
        color: '#000',
        textDecorationLine: 'underline',
        fontSize: scale(10),
    },
    signupButton: {
        backgroundColor: '#FAC0BE',
        padding: scale(15),
        borderRadius: scale(30),
        alignItems: 'center',
        marginTop: verticalScale(60),
        borderWidth: scale(1.5),
        borderColor: '#000',
    },
    signupButtonText: {
        fontSize: scale(18),
        fontWeight: 'bold',
    },
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    inputWrapper: {
        width: '100%',
        position: 'relative',
        marginBottom: verticalScale(-5),
    },
    inputIcon: {
        position: 'absolute',
        top: '50%',
        transform: [{ translateY: -scale(12) }],
        width: scale(20),
        height: scale(20),
        resizeMode: 'contain',
        zIndex: 1,
    },
    icon: {
        color: '#555',
        marginRight: scale(10),
    },
    input: {
        flex: 1,
        width: '100%',
        paddingLeft: scale(30),
        fontSize: scale(16),
        color: '#000',
        fontWeight: 'bold',
    },
    eyeButton: {
        padding: scale(8),
        marginLeft: scale(8),
    },
    passwordError: {
        color: 'red',
        fontSize: scale(10),
    },
});
