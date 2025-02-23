import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 30,
        color: '#333',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#FFFFFF',
        marginBottom: 24,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginLeft: 10,
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        width: '100%',
    },
    orLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
    },
    orText: {
        color: '#888',
        marginHorizontal: 10,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#f8f8f8',
        marginBottom: 16,
        color: '#333',
    },
    loginButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#4A90E2',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    loginButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: '600',
    },
    signupText: {
        fontSize: 14,
        color: '#4A90E2',
        fontWeight: '500',
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center', // ✅ 가운데 정렬로 변경
        alignItems: 'center', // ✅ 수직 가운데 정렬 추가
        width: '100%',
        paddingHorizontal: 20,
    },
    separator: { // ✅ "|" 구분선 스타일
        fontSize: 14,
        color: '#ccc',
        marginHorizontal: 8,
    },
});
