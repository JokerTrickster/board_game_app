import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 40, // 필요에 따라 조정
        marginTop:40,
    },
    backButton: {
        marginRight: 100,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        // textAlign은 header가 row 방향이므로 제거하거나 조정 가능
    },
    container: { padding: 20 },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#000', marginBottom: 5,marginTop:15 },
    smallButton: {
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 3,
        paddingBottom: 3,
        backgroundColor: 'white',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#000' },
    smallButtonText: { fontSize: 14 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
    checkboxText: { flex: 1, fontSize: 14, marginLeft:10 },
    linkText: { color: '#000', textDecorationLine: 'underline',fontSize:10},
    signupButton: { backgroundColor: '#FAC0BE', padding: 15, borderRadius: 30, alignItems: 'center', marginTop: 60, borderWidth: 1.5,borderColor: '#000' },
    signupButtonText: { fontSize: 18, fontWeight: 'bold' },
    background: {
        flex: 1,
        resizeMode: 'cover', // 이미지 크기를 화면에 맞게 조정
    },
    inputWrapper: {
        width: '100%',
        position: 'relative',
        marginBottom: -5,
    },
    inputIcon: {
        position: 'absolute',
        top: '50%',
        transform: [{ translateY: -12 }],
        width: 20,
        height: 20,
        resizeMode: 'contain',
        zIndex: 1, // 아이콘을 텍스트 입력 위에 렌더링
    },
    icon: { color: '#555', marginRight: 10 },
    input: {
        flex:1,
        width: '100%',
        paddingLeft: 30, // 아이콘 공간 확보를 위해 충분한 값 지정
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold',
    },
    eyeButton: {
        padding: 8,
        marginLeft: 8,
    },
    passwordError: {
        color: 'red',
        fontSize: 10,
    },
});
